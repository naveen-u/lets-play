import click
import csv
import os
from flask.cli import with_appcontext
from app import flask_app, db
from app.models import CodenamesWords
from . import register_populate_db_method


@register_populate_db_method(name="Codenames")
def populate_codenames_words():
    path = os.path.join(flask_app.config["BASEDIR"], "resources/codenames_words.csv")
    try:
        with open(path, mode="r") as csv_file:
            entries = csv.DictReader(csv_file)
            count = len(list(entries))
            for entry in entries:
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
