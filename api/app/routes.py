from flask import request, jsonify, json, current_app
from flask_login import current_user, login_user, logout_user
from flask_socketio import emit
from app.models import UserData, RoomData
from app import flask_app, db, socketio, clean_up_methods
import uuid
import random
import string

@flask_app.route('/session', methods=['GET', 'POST'])
def session_access():
    """
    Stores/sends session data and logs users in and out. Also creates a
    new room if required.
    """
    # Get session data if user is already logged in
    if request.method == 'GET':
        if current_user.is_authenticated:
            return jsonify({
                'user': current_user.username,
                'room': current_user.room_id,
                'id': current_user.id,
                'admin': current_user.admin_of is not None
            })
        else:
            return '', 401
    data = request.get_json()
    # If POST request came with data, log user in
    if data is not None:
        # If both user and room fields are present, user is trying to join an existing room
        if 'user' in data and 'room' in data:
            users = UserData.query.filter_by(room_id=data['room']).all()
            uniqueName = not any(user.username == data['user'] for user in users)
            if users:
                if uniqueName:
                    id = str(uuid.uuid4())
                    u = UserData(id=id, username=data['user'], room_id=data['room'])
                    db.session.add(u)
                    db.session.commit()
                    login_user(u)
                    return '', 204
                else:
                    responseData = {
                        'error': 'user',
                        'user': data['user'],
                        'room': data['room']
                    }
                    response = current_app.response_class(
                        response=json.dumps(responseData),
                        status=400,
                        mimetype='application/json'
                    )
                    return response
            else:
                responseData = {
                    'error': 'room',
                    'user': data['user'],
                    'room': data['room']
                }
                response = current_app.response_class(
                    response=json.dumps(responseData),
                    status=400,
                    mimetype='application/json'
                )
                return response
        # If only user field is present, user is trying to create a new room
        elif 'user' in data:
            room = random_string(9)
            while RoomData.query.get(room) is not None:
                room = random_string(9)
            userId = str(uuid.uuid4())
            roomData = RoomData(id=room, admin_id=userId)
            u = UserData(id=userId, username=data['user'], room=roomData)
            db.session.add(roomData)
            db.session.add(u)
            db.session.commit()
            login_user(u)
            return jsonify({
                'room': room
            })
    # If no data came with the POST request, log user out and clean up data
    else:
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
        logout_user()
        return '', 204


def random_string(stringLength):
    """
    Utility function to generate random string of given length

    Parameters:
    stringLength (int): Length of string to be generated

    Returns:
    str: Random string of length stringLength
    """
    letters = string.ascii_letters
    return ''.join(random.choice(letters) for i in range(stringLength))
