from flask import session
from flask_login import current_user, login_user, logout_user
from flask_socketio import send, emit, join_room, leave_room, disconnect
from app import socketio

@socketio.on('chat_message')
def handle_chat_message(message):
    print(f'MESSAGE | Room: {session.get("room", "")}\tUser: {session.get("user", "")}\tID: {session.get("id", "")}')
    emit('chat_message', message, room=session.get('room', ''), include_self=False)

@socketio.on('join_room')
def handle_join_room():
    """
    Receives messages to add users to rooms.

    Parameters:
    details (dict): Dictionary containing details user and room
    details.user (str): User who is attempting to join a room
    details.room (str): Room which the user wants to join
    """
    print(f'Join room | user: {session.get("user", "")}\troom: {session.get("room", "")}')
    join_room(session.get('room', ''))
    message = dict()
    message['message'] = f'{session.get("user", "")} joined the room!'
    emit('chat_message', message, room=session.get('room', ''), include_self=False)
    print(f'Joined {session.get("room","")}')

@socketio.on('leave_room')
def handle_leave_room():
    """
    Receives messages when user leaves a rooms.
    """
    print(f'Leave room | user: {session.get("user", "")}\troom: {session.get("room", "")}')
    leave_room(session.get('room',''))
    message = dict()
    message['message'] = f'{session.get("user", "")} has left the room!'
    emit('chat_message', message, room=session.get('room', ''), include_self=False)
    emit('left_room')