from flask_login import UserMixin
from app import db, login

@login.user_loader
def load_user(id):
    return UserData.query.get(id)

class UserData(UserMixin, db.Model):
    id = db.Column(db.String(64), primary_key=True)
    username = db.Column(db.String(64), index=True)
    room = db.Column(db.String(10), index=True)

    def __repr__(self):
        return '<User | id: {}\tname: {}\troom: {}>'.format(self.id, self.username, self.room)    