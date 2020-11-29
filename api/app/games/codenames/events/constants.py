"""
This module contains the constants used in the Codenames game.
"""

from types import SimpleNamespace

NAMESPACE = "/codenames"

SPYMASTER = "Spymaster"

STATE_KEYS_DICT = {
    "PLAYER_LIST": "playerList",
    "BLUE_MASTER": "blueMaster",
    "RED_MASTER": "redMaster",
    "GAME_STATE": "gameState",
}
STATE_KEYS = SimpleNamespace(**STATE_KEYS_DICT)

PLAYER = "Player"

# Team names
TEAMS_DICT = {
    "NEUTRAL": "neutral",  # users who aren't in either team
    "BLUE": "blue",  # blue team
    "RED": "red",  # red team
}
TEAMS = SimpleNamespace(**TEAMS_DICT)

# Game states
STATES_DICT = {
    "JOIN": "JOIN",  # awaiting team formation
    "RED_READY": "RED_READY",  # red team is ready but blue is not
    "BLUE_READY": "BLUE_READY",  # blue team is ready but red is not
    "STARTED": "STARTED",  # setting up game
    "BLUE_PLAYER": "BLUE_PLAYER",  # blue team's turn to guess words
    "RED_PLAYER": "RED_PLAYER",  # red team's turn to guess words
    "BLUE_SPYMASTER": "BLUE_SPYMASTER",  # blue spymaster's turn to give a clue
    "RED_SPYMASTER": "RED_SPYMASTER",  # red spymaster's turn to give a clue
    "GAME_OVER": "GAME_OVER",  # game ended
}
STATES = SimpleNamespace(**STATES_DICT)
