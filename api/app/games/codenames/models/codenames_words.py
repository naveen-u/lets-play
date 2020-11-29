"""
This module contains the ORM class which maps to the tables
required for the codenames game.
"""

import csv
import os
from sqlalchemy.orm import backref

from app import flask_app, db
from app.commands.tables import register_populate_db_method


class CodenamesWords(db.Model):
    """
    This class maps to the codenames_words table in the database.
    The table stores words to be used in the codenames game.
    """

    id = db.Column(db.Integer, primary_key=True)
    variant = db.Column(db.String, index=True)
    front = db.Column(db.String)
    back = db.Column(db.String)

    def __repr__(self):
        return "<Codenames Word | id: {}, variant: {}, front: {}, back: {}>".format(
            self.id, self.variant, self.front, self.back
        )


@register_populate_db_method(name="Codenames")
def populate_codenames_words():
    """
    Registers CLI command to populate the Codenames Words table.
    """
    path = os.path.join(flask_app.config["BASEDIR"], "resources/codenames_words.csv")
    try:
        with open(path, mode="r") as csv_file:
            entries = csv.DictReader(csv_file)
            entryList = list(entries)
            count = len(entryList)
            for entry in entryList:
                words_entry = CodenamesWords(
                    id=int(entry["id"]),
                    variant=str(entry["variant"]),
                    front=str(entry["front"]),
                    back=str(entry["back"]),
                )
                db.session.add(words_entry)
            db.session.commit()
            print(
                f"Wrote {count} {'entry' if count == 1 else 'entries'} to table codenames_words"
            )
    except:
        db.session.rollback()
        raise
