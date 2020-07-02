from flask import session
from flask_login import current_user, login_user, logout_user
from flask_socketio import send, emit, join_room, leave_room, disconnect
from app import socketio

@socketio.on('disconnect')
def disconnect_user():
    """
    Logs users out and clean up when they disconnect
    """
    print(f'Got disconnect from {current_user.id if current_user.is_authenticated else "anonymous"}')
    print(f'Session | user: {session.get("user", "")}\troom: {session.get("room", "")}')
    session.pop("user", None)
    session.pop("room", None)
    session.pop("id", None)


@socketio.on('message')
def handle_message(message):
    print(f'MESSAGE | Room: {session.get("room", "")}\tUser: {session.get("user", "")}\tID: {session.get("id", "")}')
    send(message, room=session.get('room', ''), include_self=False)

@socketio.on('joinRoom')
def joinRoom(details):
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
    send(message, room=session.get('room', ''), include_self=False)
    print(f'Joined {details["room"]}')

@socketio.on('leaveRoom')
def leaveRoom():
    """
    Receives messages when user leaves a rooms.
    """
    print(f'Leave room | user: {session.get("user", "")}\troom: {session.get("room", "")}')
    leave_room(session.get('room',''))
    message = dict()
    message['message'] = f'{session.get("user", "")} has left the room!'
    send(message, room=session.get('room', ''), include_self=False)
    emit('leftRoom')