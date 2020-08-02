"""
This module contains event handlers related to the restart options
after a Codenames game ends.
"""


from flask_socketio import emit, leave_room
from flask_login import current_user

from app import socketio, db
from app.models.user_data import UserData
from app.models.codenames import CodenamesTeams
from app.utils import is_admin
from .constants import NAMESPACE, TEAMS, STATES, SPYMASTER
from .utils import is_codenames_player, player_distribution_is_valid, create_word_list


#########################################################################
#                                                                       #
#                           EVENT HANDLERS                              #
#                         ==================                            #
#                                                                       #
#  EVENTS                                   EXPLANATION                 #
#                                                                       #
# restart                   Fired when the room admin chooses the       #
#                           "Start a new game" option.                  #
#                                                                       #
# restart_with_same_teams   Fired when the room admin chooses the       #
#                           restart with same teams option.             #
#                                                                       #
#########################################################################


@socketio.on("restart", namespace=NAMESPACE)
@is_codenames_player
@is_admin
def on_restart():
    """
    Handles the restart_with_same_teams event. This is fired when the room admin choses
    to start a new game.
    """

    if not current_user.room.codenames_room.state == STATES.GAME_OVER:
        return

    emit("game_state", STATES.JOIN, room=current_user.room_id)

    team = CodenamesTeams.query.filter_by(
        room_id=current_user.room_id, team_name=TEAMS.NEUTRAL
    ).first()
    current_user.room.codenames_room.state = STATES.JOIN
    current_user.room.codenames_room.state_details = None

    team_list = dict()
    team_list["players"] = []

    users = UserData.query.filter_by(room_id=current_user.room_id)

    for user in users:
        leave_room(user.room_id + user.codenames_player.team.team_name)
        user.codenames_player.team = team
        team_list["players"].append(
            {"id": user.id, "user": user.username, "team": TEAMS.NEUTRAL}
        )
        if user.codenames_player.spymaster_of is not None:
            user.codenames_player.spymaster_of.spymaster = None

    db.session.commit()
    team_list["currentTeam"] = TEAMS.NEUTRAL
    team_list["state"] = STATES.JOIN
    team_list[TEAMS.BLUE + SPYMASTER] = None
    team_list[TEAMS.RED + SPYMASTER] = None
    emit("team_list", team_list, room=current_user.room_id)


@socketio.on("restart_with_same_teams", namespace=NAMESPACE)
@is_codenames_player
@is_admin
def on_restart_with_same_teams():
    """
    Handles the restart_with_same_teams event. This is fired when the room admin choses
    to start a new game with the same teams.
    """
    if not current_user.room.codenames_room.state == STATES.GAME_OVER:
        return

    if (
        current_user.room.codenames_room.state_details == TEAMS.BLUE + SPYMASTER
        or current_user.room.codenames_room.state_details == TEAMS.RED + SPYMASTER
    ):
        return

    if not player_distribution_is_valid:
        return

    current_user.room.codenames_room.state = STATES.STARTED
    current_user.room.codenames_room.turns_left = 0
    db.session.commit()
    emit("game_state", STATES.STARTED, room=current_user.room_id)
    create_word_list()
