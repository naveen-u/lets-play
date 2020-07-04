from flask import session, request, jsonify, json, current_app
from flask_login import current_user, login_user, logout_user
from app.models import UserData, db
from app import app
import uuid
import random
import string

@app.route('/session', methods=['GET', 'POST'])
def session_access():
    """
    Stores/sends session data and logs users in and out. Also creates a
    new room if required.
    """
    # Get session data if user is already logged in
    if request.method == 'GET':
        if current_user.is_authenticated:
            return jsonify({
                'user': session.get('user', ''),
                'room': session.get('room', ''),
                'id': session.get('id', '')
            })
        else:
            return '', 401
    data = request.get_json()
    # If POST request came with data, log user in
    if data is not None:
        # If both user and room fields are present, user is trying to join an existing room
        if 'user' in data and 'room' in data:
            users = UserData.query.filter_by(room=data['room']).all()
            uniqueName = not any(user.username == data['user'] for user in users)
            if users:
                if uniqueName:
                    id = str(uuid.uuid4())
                    u = UserData(id=id, username=data['user'], room=data['room'])
                    db.session.add(u)
                    db.session.commit()
                    login_user(u)
                    print(f'Logged in {data["user"]}: {id}')
                    print(f'Current user ID is {current_user.id if current_user.is_authenticated else "anonymous"}')
                    session['user'] = data['user']
                    session['room'] = data['room']
                    session['id'] = id
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
            query = db.session.query(UserData.room.distinct().label("room"))
            rooms = [room.room for room in query.all()]
            while room in rooms:
                room = random_string(9)
            id = str(uuid.uuid4())
            u = UserData(id=id, username=data['user'], room=room)
            db.session.add(u)
            db.session.commit()
            login_user(u)
            print(f'Logged in {data["user"]}: {id}')
            print(f'Current user ID is {current_user.id if current_user.is_authenticated else "anonymous"}')
            session['user'] = data['user']
            session['room'] = room
            session['id'] = id
            return jsonify({
                'room': room
            })
    # If no data came with the POST request, log user out and clean up session data
    else:
        u = UserData.query.get(session.get('id', ''))
        if u is not None:
            print(f'Logging out {u.username}: {u.id}')
            db.session.delete(u)
            db.session.commit()
            logout_user()
            session.pop("user", None)
            session.pop("room", None)
            session.pop("id", None)
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
