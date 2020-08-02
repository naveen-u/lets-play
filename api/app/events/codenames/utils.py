"""
This module contains utility functions required by the Codenames game event handlers.
"""

import functools
import json
import random


from flask_socketio import emit
from flask_login import current_user
from sqlalchemy import func

from app import db
from app.models.codenames import (
    CodenamesTeams,
    CodenamesWords,
)
from .constants import NAMESPACE, TEAMS, STATES


def player_distribution_is_valid(check_spymaster=True):
    """
    Checks if the distribution of players across both teams is valid.

    Args:
        check_spymaster (bool, optional): Set to false if the presence
        of spymaster does not need to be checked. Defaults to True.

    Returns:
        bool: True if the distribution is valid; False otherwise.
    """
    blue_team = CodenamesTeams.query.filter_by(
        room=current_user.room.codenames_room, team_name=TEAMS.BLUE
    ).first()
    red_team = CodenamesTeams.query.filter_by(
        room=current_user.room.codenames_room, team_name=TEAMS.RED
    ).first()

    if check_spymaster:
        if blue_team.spymaster is None or red_team.spymaster is None:
            return False

    if (
        len(blue_team.players) < 2
        or len(red_team.players) < 2
        or abs(len(blue_team.players) - len(red_team.players)) > 1
    ):
        return False

    return True


def create_word_list():
    """
    Get 25 random words from the corpus and send them to the players.
    """
    words = (
        CodenamesWords.query.filter_by(variant="STANDARD")
        .order_by(func.random())
        .limit(25)
        .all()
    )
    list_of_words = [
        word.front if random.getrandbits(1) else word.back for word in words
    ]
    current_user.room.codenames_room.words = json.dumps(list_of_words)
    db.session.commit()
    data = {}
    data["words"] = list_of_words
    data["turns"] = 0
    grid_sequence = ["A"] + ["N"] * 7 + ["B"] * 8 + ["R"] * 8
    if random.getrandbits(1):
        current_user.room.codenames_room.state = STATES.BLUE_SPYMASTER
        state = STATES.BLUE_SPYMASTER
        grid_sequence += ["B"]

    else:
        current_user.room.codenames_room.state = STATES.RED_SPYMASTER
        state = STATES.RED_SPYMASTER
        grid_sequence += ["R"]
    if state == STATES.BLUE_SPYMASTER:
        data["blueLeft"] = 9
        data["redLeft"] = 8
    else:
        data["redLeft"] = 9
        data["blueLeft"] = 8
    emit("game_data", data, room=current_user.room_id, namespace=NAMESPACE)
    random.shuffle(grid_sequence)
    grid = "".join(grid_sequence)
    current_user.room.codenames_room.grid = grid
    db.session.commit()
    data = dict()
    data["grid"] = grid
    emit("game_state", state, room=current_user.room_id)
    for team in current_user.room.codenames_room.teams:
        if team.spymaster_player is not None:
            emit("game_data", data, room=team.spymaster_player.user_data.sid)
            if (
                state == STATES.BLUE_SPYMASTER
                and team.team_name == TEAMS.BLUE
                or state == STATES.RED_SPYMASTER
                and team.team_name == TEAMS.RED
            ):
                team.words_left = 9
            else:
                team.words_left = 8
        db.session.commit()


def get_team_from_grid(grid_letter):
    """
    Utility function which returns team name given the grid letter.

    Args:
        grid_letter (str): The letter in the grid possibly representing a team

    Returns:
        str: Team name if the team is valid; None otherwise
    """
    grid_to_team_map = {
        "B": TEAMS.BLUE,
        "R": TEAMS.RED,
    }
    return grid_to_team_map.get(grid_letter, None)


def is_codenames_player(funct):
    """
    Decorator that ensures the method is called only by a codenames player.

    Args:
        funct (function): Function being decorated

    Returns:
        function: Decorated function which calls the original function
        if the user is a codenames player, and returns otherwise
    """

    @functools.wraps(funct)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return None
        return funct(*args, **kwargs)

    return wrapper


def is_spymaster(funct):
    """
    Decorator that ensures the method is called only by a spymaster.

    Args:
        funct (function): Function being decorated

    Returns:
        function: Decorated function which calls the original function
        if the user is a spymaster, and returns otherwise
    """

    @functools.wraps(funct)
    def wrapper(*args, **kwargs):
        if (
            current_user.codenames_player.team.spymaster_player
            != current_user.codenames_player
        ):
            return None
        return funct(*args, **kwargs)

    return wrapper


def is_not_spymaster(funct):
    """
    Decorator that ensures the method is called only by a non-spymaster player.

    Args:
        funct (function): Function being decorated

    Returns:
        function: Decorated function which calls the original function
        if the user is not a spymaster, and returns otherwise
    """

    @functools.wraps(funct)
    def wrapper(*args, **kwargs):
        if (
            current_user.codenames_player.team.spymaster_player
            == current_user.codenames_player
        ):
            return None
        return funct(*args, **kwargs)

    return wrapper
