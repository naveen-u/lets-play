"""
This module contains the ORM class which maps to the tables
required for the codenames game.
"""

from sqlalchemy.orm import backref

from app import db


class CodenamesPlayers(db.Model):
    """
    This class maps to the codenames_players table in the database.
    The table stores user data specific to the codenames game.
    """

    id = db.Column(db.String(64), db.ForeignKey("user_data.id"), primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey("codenames_teams.id"))
    user_data = db.relationship(
        "UserData", backref=backref("codenames_player", uselist=False)
    )
    team = db.relationship("CodenamesTeams", backref="players", foreign_keys=[team_id])

    def __repr__(self):
        return "<Codenames Player | id: {}>".format(self.id)
