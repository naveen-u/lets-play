from flask_socketio import Namespace, emit, join_room
from flask_login import current_user
from app import socketio

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
            print(f'CONNECT\t\t| User: {current_user.username}\tRoom: {current_user.room}\tID: {current_user.id}')
            join_room(current_user.room)
            message = dict()
            message['message'] = f'{current_user.username} joined the room!'
            emit('chat_message', message, room=current_user.room, include_self=False)
        else:
            print('CONNECT\t\t| ANONYMOUS')

    def on_disconnect(self):
        print('DISCONNECT')

    def on_chat_message(self, message):
        """
        Handles the chat_message event in the /chat namespace.
        Listens to messages from users and broadcasts it to all other users
        in the same room.
        """
        if current_user.is_authenticated:
            print(f'MESSAGE\t\t| User: {current_user.username}\tRoom: {current_user.room}\tID: {current_user.id}')
            emit('chat_message', message, room=current_user.room, include_self=False)


socketio.on_namespace(Chat('/chat'))