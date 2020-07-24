from flask_socketio import Namespace, emit, join_room, leave_room
from flask_login import current_user
from app import socketio
from app import register_clean_up_method

class Chat(Namespace):
    """
    Class-based event handler for the /chat namespace.
    Handles all chat-related events.
    """
    def on_connect(self):
        """
        Handles the on_connect event in the /chat namespace.
        Adds user to the room in the /chat namespace.
        """
        if current_user.is_authenticated:
            join_room(current_user.room_id)
            message = dict()
            message['message'] = f'{current_user.username} joined the room!'
            emit('chat_message', message, room=current_user.room_id, include_self=False)
        else:
            pass

    def on_disconnect(self):
        pass

    def on_chat_message(self, message):
        """
        Handles the chat_message event in the /chat namespace.
        Listens to messages from users and broadcasts it to all other users
        in the same room.
        """
        if current_user.is_authenticated:
            message['username'] = current_user.username
            emit('chat_message', message, room=current_user.room_id, include_self=False)

@register_clean_up_method
def cleanup_chat(current_user):
    """
    Registering a cleanup method for the chat namespace. This sends a message to the
    room notifying users that someone has left.
    """
    message = dict()
    message['message'] = f'{current_user.username} left the room!'
    emit('chat_message', message, room=current_user.room_id, namespace='/chat')

socketio.on_namespace(Chat('/chat'))