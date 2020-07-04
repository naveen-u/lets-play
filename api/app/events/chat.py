from flask import session
from flask_socketio import emit
from flask_login import current_user
from app import socketio

@socketio.on('chat_message')
def handle_chat_message(message):
    print(f'MESSAGE | Room: {current_user.room}\tUser: {current_user.username}\tID: {current_user.id}')
    emit('chat_message', message, room=current_user.room, include_self=False)

