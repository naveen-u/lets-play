"""
This module contains event handlers required for team chat.
"""


from flask_socketio import emit
from flask_login import current_user

from app import socketio
from .constants import NAMESPACE

######################################################################
#                                                                    #
#                           EVENT HANDLERS                           #
#                         ==================                         #
#                                                                    #
#  EVENTS                                   EXPLANATION              #
#                                                                    #
# chat_message          Fired when a user sends a chat message to    #
#                       their team.                                  #
#                                                                    #
######################################################################


@socketio.on("chat_message", namespace=NAMESPACE)
def on_chat_message(message):
    """
    Handles the chat_message event in this namespace.
    Listens to messages from users and broadcasts it other users
    in the same team.
    """
    if current_user.is_authenticated:
        message["username"] = current_user.username
        emit(
            "chat_message",
            message,
            room=current_user.room_id + current_user.codenames_player.team.team_name,
            include_self=False,
        )
