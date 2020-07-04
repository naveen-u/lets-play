from flask import session
from flask_socketio import emit, join_room, leave_room
from flask_login import current_user, logout_user
from app import socketio
from app.models import UserData, db

@socketio.on('join_room')
def handle_join_room():
    """
    Receives messages when user enters a room. Adds user to the socketio room.
    """
    print(f'Join room | user: {current_user.username}\troom: {current_user.room}')
    join_room(current_user.room)
    message = dict()
    message['message'] = f'{current_user.username} joined the room!'
    emit('chat_message', message, room=current_user.room, include_self=False)

@socketio.on('leave_room')
def handle_leave_room():
    """
    Receives messages when user leaves a room. Removes user from the room and logs them out.
    """
    print(f'Leave room | user: {current_user.username}\troom: {current_user.room}')
    leave_room(current_user.room)
    message = dict()
    message['message'] = f'{current_user.username} has left the room!'
    emit('chat_message', message, room=current_user.room, include_self=False)
    db.session.delete(current_user)
    db.session.commit()
    logout_user()
    emit('left_room')
