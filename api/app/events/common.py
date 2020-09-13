"""
This module contains the socketio event handler for the global namespace.
"""

import datetime
import logging

from flask import request
from flask_login import current_user
from flask_socketio import join_room

from app import socketio, scheduler, db, flask_app
from app.models import UserData
from app.routes import clean_up_methods

log = logging.getLogger(__name__)


@socketio.on("connect")
def handle_connect():
    """
    Handles the global connect event. If the user is already present, the socket ID of
    the user is updated.
    """
    if current_user.is_authenticated:
        log.info("Existing user. Updating socket ID.")
        current_user.sid = request.sid
        join_room(current_user.room_id)
        db.session.commit()


@socketio.on("disconnecting")
def handle_disconnecting():
    """
    Handles the disconnecting event. This event is fired before the window unloads.
    Schedules a job to run after WAIT time to perform cleanup if the user doesn't
    rejoin by then.
    """
    if current_user.is_authenticated:
        scheduler.add_job(
            cleanup,
            trigger="date",
            args=[current_user.sid],
            next_run_time=(datetime.datetime.now() + datetime.timedelta(seconds=10)),
        )


def cleanup(socket_id):
    """
    Performs cleanup after a user leaves.

    Args:
        socket_id (str): Socket ID that was disconnected
    """
    leaving_user = UserData.query.filter_by(sid=socket_id).first()
    if leaving_user is not None:
        log.info("Got user for disconnected socket. Performing cleanup.")
        with flask_app.app_context():
            for func in clean_up_methods:
                func(leaving_user)
            room = leaving_user.room
            state_change = {}
            if room.admin == leaving_user:
                new_admin = UserData.query.filter(
                    UserData.room_id == room.id, UserData.id != leaving_user.id
                ).first()
                if new_admin is not None:
                    room.admin = new_admin
                    state_change["roomAdmin"] = new_admin.id
            db.session.delete(leaving_user)
            db.session.commit()
            state_change["userList"] = [
                {"username": user.username, "userId": user.id} for user in room.users
            ]
            socketio.emit("set_state", state_change, room=room.id)
            if not room.users:
                db.session.delete(room)
                db.session.commit()

    else:
        log.info("Did not recieve user data for socket ID. User possibly reconnected.")
