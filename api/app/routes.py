"""
This module contains the session route for login and logout.
"""

import random
import string
import uuid

from flask import request, jsonify, json, current_app
from flask_login import current_user, login_user, logout_user
from app.models import UserData, RoomData
from app import flask_app, db, socketio, clean_up_methods


@flask_app.route("/session", methods=["GET", "POST"])
def session_access():
    """
    Stores/sends session data and logs users in and out. Also creates a
    new room if required.

    This adds the /session route to the flask application. This route is capable
    of handling both GET and POST requests.

    GET:    Returns the user session details.

    POST:   Logs users in or out depending on the payload data.
            If the payload contains both user and room fields, the user is added
            to an existing room (whose ID is denoted by the room field).
            If the payload contains only the user field, a new room is created and
            the user is added to it.
            If the payload is empty, the user is logged out and any required cleanup
            activity is performed.
    """
    if request.method == "GET":
        return get_session()

    data = request.get_json()

    if data is not None:
        if "user" in data and "room" in data:
            return add_user_to_existing_room(
                username=data.get("user", ""), room=data.get("room", "")
            )

        if "user" in data:
            return add_user_to_new_room(data.get("user", ""))

    for func in clean_up_methods:
        func(current_user)
    log_user_out(current_user)
    return "", 204


def get_session():
    """
    Returns user data.
    """
    if current_user.is_authenticated:
        return jsonify(
            {
                "username": current_user.username,
                "userId": current_user.id,
                "roomId": current_user.room_id,
                "roomAdmin": current_user.room.admin_id,
                "userList": [
                    {"username": user.username, "userId": user.id}
                    for user in current_user.room.users
                ],
                "game": current_user.room.game or "",
            }
        )
    return "", 401


def add_user_to_existing_room(username, room):
    """
    Adds a new user to an existing room.

    Args:
        username (str): Username of the new user trying to join the room
        room (str): Room ID of the room that the user is trying to join
    """
    users = UserData.query.filter_by(room_id=room).all()
    unique_name = not any(user.username == username for user in users)
    if users:
        if unique_name:
            user_id = str(uuid.uuid4())
            user = UserData(id=user_id, username=username, room_id=room)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            state_change = {
                "userList": [
                    {"username": user.username, "userId": user.id}
                    for user in user.room.users
                ],
            }
            socketio.emit("set_state", state_change, room=current_user.room_id)
            return "", 204
        response_data = {
            "error": "user",
            "user": username,
            "room": room,
        }
        response = current_app.response_class(
            response=json.dumps(response_data),
            status=400,
            mimetype="application/json",
        )
        return response
    response_data = {
        "error": "room",
        "user": username,
        "room": room,
    }
    response = current_app.response_class(
        response=json.dumps(response_data),
        status=400,
        mimetype="application/json",
    )
    return response


def add_user_to_new_room(username):
    """
    Creates a new room and adds the user to it.

    Args:
        username (str): Username of the user making the request
    """
    room = random_string(9)
    while RoomData.query.get(room) is not None:
        room = random_string(9)
    user_id = str(uuid.uuid4())
    room_data = RoomData(id=room, admin_id=user_id)
    user = UserData(id=user_id, username=username, room=room_data)
    db.session.add(room_data)
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify({"room": room})


def log_user_out(user):
    """
    Logs a user out and removes them from their room.

    Args:
        user (UserData): User to be removed.
    """
    room = user.room
    state_change = {}
    if room.admin == user:
        new_admin = UserData.query.filter(
            UserData.room_id == room.id, UserData.id != user.id
        ).first()
        if new_admin is not None:
            room.admin = new_admin
            state_change["roomAdmin"] = new_admin.id
    db.session.delete(user)
    db.session.commit()
    state_change["userList"] = [
        {"username": user.username, "userId": user.id} for user in room.users
    ]
    socketio.emit("set_state", state_change, room=room.id)
    if not room.users:
        db.session.delete(room)
        db.session.commit()
    logout_user()


def random_string(string_length):
    """
    Utility function to generate random string of given length

    Args:
        string_length (int): Length of string to be generated

    Returns:
        str: Random string of length string_length
    """

    letters = string.ascii_letters
    return "".join(random.choice(letters) for i in range(string_length))
