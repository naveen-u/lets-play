"""
The module contains the actual flask application code.
"""

import logging
import os
import sys

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from logging.handlers import RotatingFileHandler

from config import Config

if not os.path.exists("logs"):
    os.mkdir("logs")

file_handler = RotatingFileHandler(
    "logs/lets-play.log", maxBytes=102400, backupCount=10
)

# handler = logging.StreamHandler(sys.stdout)
# handler.setLevel(logging.DEBUG)
# formatter = logging.Formatter("%(asctime)s | %(name)s %(funcName)s | %(message)s")
# handler.setFormatter(formatter)

logging.basicConfig(
    handlers=[file_handler],
    format="%(asctime)s | %(name)s %(funcName)s | %(message)s",
    datefmt="%m/%d/%Y %I:%M:%S %p",
    level=logging.INFO,
)

socketio = SocketIO(manage_session=False, cors_allowed_origins="*")
login = LoginManager()

flask_app = Flask(__name__, instance_relative_config=True)
flask_app.config.from_object(Config)
flask_app.config.from_pyfile("config.py")

db = SQLAlchemy(flask_app)
migrate = Migrate(flask_app, db, render_as_batch=True)
login.init_app(flask_app)

scheduler = BackgroundScheduler({"apscheduler.timezone": "Asia/Calcutta"})
scheduler.start()

socketio.init_app(
    flask_app,
    logger=logging.getLogger("socketio"),
    engineio_logger=logging.getLogger("engineio"),
)

# List of methods to be called on logout.
clean_up_methods = []


def register_clean_up_method(clean_up_method):
    """
    Decorator to register a method as a clean up method. Clean up methods are
    called before a user logs out. Any clean up that requires current_user needs
    to be registered with this. After log out, current_user would be anonymous.
    """
    clean_up_methods.append(clean_up_method)


from app import routes, events, models, commands, games
