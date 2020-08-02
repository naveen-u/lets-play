"""
This module contains the ORM class which maps to the room_data table.
This table stores room data within the platform.
"""

from sqlalchemy.orm import backref

from app import db


class RoomData(db.Model):
    """
    This class maps to the room_data table in the database.
    The table stores room data wthin the platform.
    """

    id = db.Column(db.String(10), primary_key=True)
    admin_id = db.Column(db.String(64), db.ForeignKey("user_data.id"))
    game = db.Column(db.String(20))
    admin = db.relationship(
        "UserData",
        backref=backref("admin_of", uselist=False),
        foreign_keys=[admin_id],
        post_update=True,
    )

    def __repr__(self):
        return "<Room | id: {}, admin: {}>".format(self.id, self.admin_id)
