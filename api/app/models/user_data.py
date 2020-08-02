"""
This module contains the ORM class which maps to the user_data table.
This table stores user data within the platform.
"""

from flask_login import UserMixin
from app import db, login


@login.user_loader
def load_user(user_id):
    """
    Loads user data given the user's id.

    Args:
        user_id (str): ID of the user whose data is to be retrieved

    Returns:
        UserData: The UserData object for the user with the specified ID
    """
    return UserData.query.get(user_id)


class UserData(UserMixin, db.Model):
    """
    This class maps to the user_data table in the database.
    The table stores user data wthin the platform.
    """

    id = db.Column(db.String(64), primary_key=True)
    sid = db.Column(db.String(36))
    username = db.Column(db.String(64), index=True)
    room_id = db.Column(db.String(10), db.ForeignKey("room_data.id"), index=True)
    room = db.relationship("RoomData", backref="users", foreign_keys=[room_id])

    def __repr__(self):
        return "<User | id: {}\tname: {}\troom: {}>".format(
            self.id, self.username, self.room_id
        )
