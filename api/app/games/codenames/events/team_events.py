"""
This module contains event handlers related to the
team selection phase of the Codenames game.
"""

from flask_socketio import emit, join_room, leave_room
from flask_login import current_user

from app import socketio, db
from app.games.codenames.models import CodenamesTeams
from .constants import NAMESPACE, STATE_KEYS, TEAMS, STATES
from .utils import (
    is_codenames_player,
    is_spymaster,
    player_distribution_is_valid,
    create_word_list,
)


######################################################################
#                                                                    #
#                           EVENT HANDLERS                           #
#                         ==================                         #
#                                                                    #
#  EVENTS                                   EXPLANATION              #
#                                                                    #
# join_team             Sent by client when they join or leave a     #
#                       team.                                        #
#                                                                    #
# set_spymaster         Sent by client when they set themselves as   #
#                       spymaster of their team.                     #
#                                                                    #
# team_ready            Sent by client when the spymaster marks      #
#                       their team as ready to start.                #
#                                                                    #
######################################################################


@socketio.on("join_team", namespace=NAMESPACE)
@is_codenames_player
def on_join_team(message):
    """
    Handles the join_team event in the namespace.
    """
    # Check game state
    if current_user.room.codenames_room.state not in [
        STATES.JOIN,
        STATES.RED_READY,
        STATES.BLUE_READY,
    ]:
        return

    new_team = CodenamesTeams.query.filter_by(
        room_id=current_user.room_id, team_name=message
    ).first()
    old_team = current_user.codenames_player.team

    # If the old team was ready but the player leaving was a spymaster or the last player,
    # mark the team as not ready
    state = old_team.room.state
    if (
        state == STATES.RED_READY
        and old_team.team_name == TEAMS.RED
        or state == STATES.BLUE_READY
        and old_team.team_name == TEAMS.BLUE
    ):
        if old_team.spymaster is not None and old_team.spymaster == current_user.id:
            old_team.room.state = STATES.JOIN
            emit(
                "set_state",
                {STATE_KEYS.GAME_STATE: STATES.JOIN},
                room=current_user.room_id,
            )
        elif len(old_team.players) == 2:
            old_team.room.state = STATES.JOIN
            emit(
                "set_state",
                {STATE_KEYS.GAME_STATE: STATES.JOIN},
                room=current_user.room_id,
            )

    # If player was spymaster of their old team, remove team's spymaster
    if old_team.spymaster is not None and old_team.spymaster == current_user.id:
        old_team.spymaster = None

    current_user.codenames_player.team = new_team
    db.session.commit()
    # Send signal
    data = dict()
    data["user"] = current_user.username
    data["id"] = current_user.id
    data["team"] = message
    emit("join_team", data, room=current_user.room_id)
    join_room(current_user.room_id + message)


@socketio.on("set_spymaster", namespace=NAMESPACE)
@is_codenames_player
def on_set_spymaster():
    """
    Handles the set_spymaster event in the namespace
    """
    # Check game state
    if current_user.room.codenames_room.state not in [
        STATES.JOIN,
        STATES.RED_READY,
        STATES.BLUE_READY,
    ]:
        return
    # Check that player is in a playing team
    if current_user.codenames_player.team.team_name == TEAMS.NEUTRAL:
        return

    player = current_user.codenames_player
    team = current_user.codenames_player.team
    if team.spymaster_player is None:
        team.spymaster_player = player
        db.session.commit()
        data = dict()
        data["team"] = team.team_name
        data["user"] = current_user.username
        data["id"] = current_user.id
        emit("set_spymaster", data, room=current_user.room_id)
        leave_room(current_user.room_id + team.team_name)


@socketio.on("team_ready", namespace=NAMESPACE)
@is_codenames_player
@is_spymaster
def on_team_ready():
    """
    Handles the team_ready event. If both teams are ready, the game begins.
    """
    # Check game state
    if current_user.room.codenames_room.state not in [
        STATES.JOIN,
        STATES.RED_READY,
        STATES.BLUE_READY,
    ]:
        return

    team = current_user.codenames_player.team

    if not player_distribution_is_valid(check_spymaster=False):
        return

    if team.team_name == TEAMS.RED:
        state_transition = {
            STATES.JOIN: STATES.RED_READY,
            STATES.RED_READY: STATES.JOIN,
            STATES.BLUE_READY: STATES.STARTED,
        }
        team.room.state = state_transition.get(team.room.state)
    elif team.team_name == TEAMS.BLUE:
        state_transition = {
            STATES.JOIN: STATES.BLUE_READY,
            STATES.BLUE_READY: STATES.JOIN,
            STATES.RED_READY: STATES.STARTED,
        }
        team.room.state = state_transition.get(team.room.state)
    db.session.commit()
    emit(
        "set_state", {STATE_KEYS.GAME_STATE: team.room.state}, room=current_user.room_id
    )
    if current_user.room.codenames_room.state == STATES.STARTED:
        create_word_list()
