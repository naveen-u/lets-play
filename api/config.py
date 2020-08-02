"""
Config class for the flask application.
"""
import os

BASEDIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    """
    This class contains the configurations for the flask application.
    These configurations will be pushed to production and version control.
    No development instance-specific configurations should be added here.
    """

    DEBUG = False
    SESSION_TYPE = "filesystem"
    SESSION_COOKIE_SECURE = False
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or "sqlite:///" + os.path.join(BASEDIR, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
