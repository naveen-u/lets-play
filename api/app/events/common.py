import datetime
import logging

from flask import request
from flask_migrate import current
from flask_socketio import emit
from flask_login import current_user

from app import socketio, scheduler, db, flask_app
from app.models import UserData
from app.routes import clean_up_methods

log = logging.getLogger(__name__)

@socketio.on('connect')
def handle_connect():
    """
    Handles the global connect event. If the user is already present, the socket ID of
    the user is updated.
    """
    if current_user.is_authenticated:
        log.info('Existing user. Updating socket ID.')
        current_user.sid = request.sid
        db.session.commit()

@socketio.on('disconnecting')
def handle_disconnecting():
    """
    Handles the disconnecting event. This event is fired before the window unloads.
    Schedules a job to run after WAIT time to perform cleanup if the user doesn't
    rejoin by then.
    """
    if current_user.is_authenticated:
        scheduler.add_job(
            cleanup, 
            trigger='date',
            args=[current_user.sid],
            next_run_time=(datetime.datetime.now() + datetime.timedelta(seconds=10))
        )

def cleanup(socket_id):
    """
    Performs clean-up.
    """
    current_user = UserData.query.filter_by(sid=socket_id).first()
    if current_user is not None:
        log.info('Got user for disconnected socket. Performing cleanup.')
        with flask_app.app_context():
            for func in clean_up_methods:
                func(current_user)
            room = current_user.room
            if room.admin == current_user:
                new_admin = UserData.query.filter(UserData.room_id == room.id, UserData.id != current_user.id).first()
                if new_admin is not None:
                    room.admin = new_admin
                    socketio.emit('set_admin', True, room=new_admin.sid)
            db.session.delete(current_user)
            db.session.commit()
            if not room.users:
                db.session.delete(room)
                db.session.commit()

    else:
        log.info('Did not recieve user data for socket ID. User possibly reconnected.')
