from flask import Flask, Blueprint
from flask_socketio import SocketIO
from flask_session import Session
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

socketio = SocketIO(manage_session=False, cors_allowed_origins='*')
login = LoginManager()

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)
app.config.from_pyfile('config.py')

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login.init_app(app)
socketio.init_app(app)

from app import routes, models
from app.events import chat