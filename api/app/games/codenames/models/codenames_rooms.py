"""
This module contains the ORM class which maps to the tables
required for the codenames game.
"""

from sqlalchemy.orm import backref

from app import db


class CodenamesRooms(db.Model):
    """
    This class maps to the codenames_rooms table in the database.
    The table stores room data specific to the codenames game.
    """

    id = db.Column(db.String(10), db.ForeignKey("room_data.id"), primary_key=True)
    state = db.Column(db.String)
    state_details = db.Column(db.String)
    grid = db.Column(db.String(25))
    words = db.Column(db.String)
    clue = db.Column(db.String)
    turns_left = db.Column(db.Integer)
    room_data = db.relationship(
        "RoomData", backref=backref("codenames_room", uselist=False)
    )

    def __repr__(self):
        return "<Codenames room | id: {}, state: {}>".format(self.id, self.state)
