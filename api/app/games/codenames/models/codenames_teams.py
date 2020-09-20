"""
This module contains the ORM class which maps to the tables
required for the codenames game.
"""

from sqlalchemy.orm import backref

from app import db


class CodenamesTeams(db.Model):
    """
    This class maps to the codenames_teams table in the database.
    The table stores team data for the codenames game.
    """

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(10), db.ForeignKey("codenames_rooms.id"), index=True)
    team_name = db.Column(db.String(10))
    words_left = db.Column(db.Integer)
    spymaster = db.Column(db.String(64), db.ForeignKey("codenames_players.id"))
    room = db.relationship("CodenamesRooms", backref="teams", foreign_keys=[room_id])
    spymaster_player = db.relationship(
        "CodenamesPlayers",
        backref=backref("spymaster_of", uselist=False),
        foreign_keys=[spymaster],
        post_update=True,
    )

    def __repr__(self):
        return "<Codenames Team | id: {}>".format(self.id)
