"""
This module contains event handlers for events fired during the Codenames game.
"""

import json

from flask_socketio import emit
from flask_login import current_user

from app import socketio, db
from app.games.codenames.models import (
    CodenamesTeams,
    CodenamesRooms,
)
from .constants import NAMESPACE, TEAMS, STATES
from .utils import (
    get_team_from_grid,
    is_codenames_player,
    is_not_spymaster,
    is_spymaster,
)

######################################################################
#                                                                    #
#                           EVENT HANDLERS                           #
#                         ==================                         #
#                                                                    #
#  EVENTS                                   EXPLANATION              #
#                                                                    #
#                                                                    #
# clue                  Fired when a spymaster sends the clue for    #
#                       their team's turn.                           #
#                                                                    #
# word_click            Fired when a player clicks on a word cell    #
#                                                                    #
# pass                  This is fired when a player clicks on the    #
#                       pass option during their team's turn.        #
#                                                                    #
######################################################################


@socketio.on("clue", namespace=NAMESPACE)
@is_codenames_player
@is_spymaster
def on_clue(data):
    """
    Handles the clue event.

    This event is fired when a spymaster sends the clue
    for their team's turn.
    """
    # Check game state
    if not (
        (
            current_user.room.codenames_room.state == STATES.BLUE_SPYMASTER
            and current_user.codenames_player.team.team_name == TEAMS.BLUE
        )
        or (
            current_user.room.codenames_room.state == STATES.RED_SPYMASTER
            and current_user.codenames_player.team.team_name == TEAMS.RED
        )
    ):
        return
    # Check that the clue does not contain any of the words in the grid
    for word in json.loads(current_user.room.codenames_room.words):
        if word not in ["R", "B", "N", "A"] and word in data["clue"]:
            print(f'\n\n\n{word} is inside {data["clue"]}\n\n\n')
            return
    # Check that the clue number is at most the number of words left
    if current_user.codenames_player.team.words_left < data["number"]:
        return

    current_user.room.codenames_room.clue = data["clue"]
    current_user.room.codenames_room.turns_left = data["number"] + 1
    state = None
    if current_user.room.codenames_room.state == STATES.BLUE_SPYMASTER:
        state = STATES.BLUE_PLAYER
        current_user.room.codenames_room.state = STATES.BLUE_PLAYER
    elif current_user.room.codenames_room.state == STATES.RED_SPYMASTER:
        state = STATES.RED_PLAYER
        current_user.room.codenames_room.state = STATES.RED_PLAYER
    db.session.commit()

    data["state"] = state
    data["turns"] = current_user.room.codenames_room.turns_left
    emit("game_data", data, room=current_user.room_id)


@socketio.on("word_click", namespace=NAMESPACE)
@is_codenames_player
@is_not_spymaster
def on_word_click(index):
    """
    Handles the word_click event.

    This is fired when a player clicks on a word cell.
    """
    # Check that user is not a spymaster
    team = current_user.codenames_player.team
    # Check game state
    room = current_user.room.codenames_room
    if not (
        (room.state == STATES.BLUE_PLAYER and team.team_name == TEAMS.BLUE)
        or (room.state == STATES.RED_PLAYER and team.team_name == TEAMS.RED)
    ):
        return
    if room.turns_left <= 0:
        return
    words = json.loads(room.words)
    grid = room.grid
    words[index] = grid[index]
    winner = None
    current_team = None
    current_team_name = get_team_from_grid(grid[index])
    if current_team_name is not None:
        room.turns_left = (
            CodenamesRooms.turns_left - 1 if current_team_name == team.team_name else 0
        )
        current_team = CodenamesTeams.query.filter_by(
            room=room, team_name=current_team_name
        ).first()
        if current_team.words_left == 1:
            room.state = STATES.GAME_OVER
            winner = current_team_name
            room.state_details = winner
        current_team.words_left = CodenamesTeams.words_left - 1
    elif grid[index] == "N":
        room.turns_left = 0
    elif grid[index] == "A":
        room.state = STATES.GAME_OVER
        winner = TEAMS.BLUE if team.team_name == TEAMS.RED else TEAMS.RED
        room.state_details = winner
    if room.turns_left == 0:
        room.state = (
            STATES.RED_SPYMASTER
            if room.state == STATES.BLUE_PLAYER
            else STATES.BLUE_SPYMASTER
        )
    room.words = json.dumps(words)
    db.session.commit()
    data = {}
    data["words"] = words
    data["state"] = room.state
    data["turns"] = room.turns_left
    if winner is not None:
        data["details"] = winner
        data["grid"] = room.grid
    if current_team_name is not None:
        data[current_team_name + "Left"] = (
            CodenamesTeams.query.filter_by(room=room, team_name=current_team_name)
            .first()
            .words_left
        )
    emit("game_data", data, room=current_user.room_id)


@socketio.on("pass", namespace=NAMESPACE)
@is_codenames_player
@is_not_spymaster
def on_pass():
    """
    Handles the pass event.

    This is fired when a player clicks on the pass option during
    their team's turn.
    """
    # Check that user is not a spymaster
    team = current_user.codenames_player.team
    # Check game state
    room = current_user.room.codenames_room
    if not (
        (room.state == STATES.BLUE_PLAYER and team.team_name == TEAMS.BLUE)
        or (room.state == STATES.RED_PLAYER and team.team_name == TEAMS.RED)
    ):
        return
    if room.turns_left <= 0:
        return
    room.turns_left = 0
    if room.state == STATES.BLUE_PLAYER:
        room.state = STATES.RED_SPYMASTER
    elif room.state == STATES.RED_PLAYER:
        room.state = STATES.BLUE_SPYMASTER
    db.session.commit()
    data = {}
    data["state"] = room.state
    data["turns"] = room.turns_left
    emit("game_data", data, room=current_user.room_id)
