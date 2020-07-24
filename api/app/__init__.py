import logging

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from config import Config

logging.basicConfig(format='%(asctime)s | %(name)s %(funcName)s | %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p', level=logging.INFO)

socketio = SocketIO(manage_session=False, cors_allowed_origins='*')
login = LoginManager()

app = Flask(__name__, instance_relative_config=True)
app.config.from_object(Config)
app.config.from_pyfile('config.py')

db = SQLAlchemy(app)
migrate = Migrate(app, db, render_as_batch=True)
login.init_app(app)

scheduler = BackgroundScheduler({'apscheduler.timezone': 'Asia/Calcutta'})
scheduler.start()

socketio_logger = logging.getLogger('socketio')
engineio_logger = logging.getLogger('engineio')
socketio.init_app(app)

from app import routes, events, models