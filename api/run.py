#!/bin/env python3
from app import flask_app, socketio


if __name__ == '__main__':
    socketio.run(flask_app, port=5000)
