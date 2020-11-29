"""
This module handles events to player connection and disconnection.
"""

import json


from flask_socketio import emit, join_room
from flask_login import current_user

from app import socketio, db
from app import register_clean_up_method
from app.models.user_data import UserData
from app.games.codenames.models import (
    CodenamesPlayers,
    CodenamesTeams,
    CodenamesRooms,
)
from .constants import (
    NAMESPACE,
    STATE_KEYS,
    TEAMS,
    STATES,
    TEAMS_DICT,
    SPYMASTER,
    PLAYER,
)


######################################################################
#                                                                    #
#                           EVENT HANDLERS                           #
#                         ==================                         #
#                                                                    #
#  EVENTS                                   EXPLANATION              #
#                                                                    #
# connect               Fired when a user connects to the namespace. #
#                       The user is added to the neutral team,       #
#                       existing team data is sent to the user, and  #
#                       existing users are notified.                 #
#                                                                    #
######################################################################


@socketio.on("connect", namespace=NAMESPACE)
def on_connect():
    """
    Handles the on_connect event in the namespace.

    This event is fired when a user connects to the namespace.
    The user is added to the neutral team, existing team data
    is sent to the user, and existing users are notified.
    """
    # Check if user is authenticated
    if not current_user.is_authenticated:
        return

    if current_user.codenames_player is None:
        # The connection is from a new user
        join_room(current_user.room_id)
        # Populate codenames_teams table if not already populated
        room = current_user.room.codenames_room
        if room is None:
            room = CodenamesRooms(room_data=current_user.room, state="JOIN")
            db.session.add(room)
            for team_name in TEAMS_DICT.values():
                team = CodenamesTeams(room_id=current_user.room_id, team_name=team_name)
                db.session.add(team)
            db.session.commit()
        team = CodenamesTeams.query.filter_by(
            room_id=current_user.room_id, team_name=TEAMS.NEUTRAL
        ).first()
        player = CodenamesPlayers(user_data=current_user, team=team)
        db.session.add(player)
        db.session.commit()
        # Send message to other players notifying them of the new player
        message = dict()
        message["user"] = current_user.username
        message["id"] = current_user.id
        message["team"] = TEAMS.NEUTRAL
        emit("join_team", message, room=current_user.room_id, include_self=False)
    else:
        # The connection is from an existing player. Hence, add the new socket id to the room.
        join_room(current_user.room_id)
        if (
            current_user.codenames_player.team.team_name != TEAMS.NEUTRAL
            and current_user.codenames_player.spymaster_of is None
        ):
            join_room(
                current_user.room_id + current_user.codenames_player.team.team_name
            )
        db.session.commit()

    emit("set_state", {STATE_KEYS.GAME_STATE: current_user.room.codenames_room.state})
    # Send a message to the new player with the list of current players
    team_list = dict()
    team_list[STATE_KEYS.PLAYER_LIST] = []
    player_list = (
        CodenamesTeams.query.filter_by(room_id=current_user.room_id)
        .join(CodenamesPlayers, CodenamesTeams.id == CodenamesPlayers.team_id)
        .with_entities(CodenamesPlayers.id, CodenamesTeams.team_name)
        .join(UserData, UserData.id == CodenamesPlayers.id)
        .with_entities(UserData.id, UserData.username, CodenamesTeams.team_name)
        .all()
    )

    for i in player_list:
        player_id, name, team = i
        team_list[STATE_KEYS.PLAYER_LIST].append(
            {"id": player_id, "user": name, "team": team}
        )

    spymasters = (
        CodenamesTeams.query.filter(
            CodenamesTeams.room_id == current_user.room_id,
            CodenamesTeams.spymaster is not None,
        )
        .join(UserData, CodenamesTeams.spymaster == UserData.id)
        .with_entities(
            CodenamesTeams.spymaster, UserData.username, CodenamesTeams.team_name
        )
        .all()
    )

    for i in spymasters:
        player_id, name, team = i
        team_list[
            STATE_KEYS.BLUE_MASTER if team == TEAMS.BLUE else STATE_KEYS.RED_MASTER
        ] = {"id": player_id, "user": name, "team": team}

    emit("set_state", team_list, room=current_user.sid)
    room = current_user.room.codenames_room
    if room.state not in [STATES.JOIN, STATES.RED_READY, STATES.BLUE_READY]:
        data = {}
        data["state"] = room.state
        data["details"] = room.state_details
        data["turns"] = room.turns_left
        data["words"] = json.loads(room.words)
        data["blueLeft"] = (
            CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.BLUE)
            .first()
            .words_left
        )
        data["redLeft"] = (
            CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.RED)
            .first()
            .words_left
        )
        if room.state in [STATES.BLUE_PLAYER, STATES.RED_PLAYER]:
            data["clue"] = room.clue
        if (
            current_user.codenames_player.spymaster_of is not None
            or room.state == STATES.GAME_OVER
        ):
            data["grid"] = room.grid
        emit("game_data", data, room=room.id)


#########################################
#                                       #
#                CLEANUP                #
#                                       #
#########################################


@register_clean_up_method
def cleanup_codenames(leaving_user):
    """
    Registering a cleanup method for the codenames namespace. This removes the user
    from their team's list of players.
    """
    if leaving_user.codenames_player is None:
        return

    team = leaving_user.codenames_player.team
    if team.spymaster_player == leaving_user.codenames_player:
        team.spymaster = None
        if (
            team.room.state == STATES.RED_READY
            and team.team_name == TEAMS.RED
            or team.room.state == STATES.BLUE_READY
            and team.team_name == TEAMS.BLUE
        ):
            team.room.state = STATES.JOIN
            emit(
                "set_state",
                {STATE_KEYS.GAME_STATE: STATES.JOIN},
                room=leaving_user.room_id,
                namespace=NAMESPACE,
            )
        elif team.room.state != STATES.GAME_OVER and team.room.state != STATES.JOIN:
            team.room.state = STATES.GAME_OVER
            team.room.state_details = team.team_name + SPYMASTER
            data = {}
            data["state"] = team.room.state
            data["details"] = team.room.state_details
            data["grid"] = team.room.grid
            emit("game_data", data, room=leaving_user.room_id, namespace=NAMESPACE)
    elif len(team.players) == 2:
        if (
            team.room.state == STATES.RED_READY
            and team.team_name == TEAMS.RED
            or team.room.state == STATES.BLUE_READY
            and team.team_name == TEAMS.BLUE
        ):
            team.room.state = STATES.JOIN
            emit(
                "set_state",
                {STATE_KEYS.GAME_STATE: STATES.JOIN},
                room=leaving_user.room_id,
                namespace=NAMESPACE,
            )
        elif team.room.state != STATES.GAME_OVER and team.room.state != STATES.JOIN:
            team.room.state = STATES.GAME_OVER
            team.room.state_details = team.team_name + PLAYER
            data = {}
            data["state"] = team.room.state
            data["details"] = team.room.state_details
            data["grid"] = team.room.grid
            emit("game_data", data, room=leaving_user.room_id, namespace=NAMESPACE)

    db.session.delete(leaving_user.codenames_player)
    db.session.commit()

    players = UserData.query.filter_by(room_id=leaving_user.room_id).all()
    if len(players) == 1:
        teams = CodenamesTeams.query.filter_by(room_id=leaving_user.room_id).all()
        for team in teams:
            db.session.delete(team)
        db.session.delete(leaving_user.room.codenames_room)
        db.session.commit()
    # Send signal
    message = dict()
    message["id"] = leaving_user.id
    emit("leave_game", message, room=leaving_user.room_id, namespace=NAMESPACE)
