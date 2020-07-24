from flask_login import UserMixin
from app import db, login

@login.user_loader
def load_user(id):
    return UserData.query.get(id)

class UserData(UserMixin, db.Model):
    id = db.Column(db.String(64), primary_key=True)
    sid = db.Column(db.String(36))
    username = db.Column(db.String(64), index=True)
    room_id = db.Column(db.String(10), db.ForeignKey('room_data.id'), index=True)
    room = db.relationship('RoomData', backref="users", foreign_keys=[room_id])

    def __repr__(self):
        return '<User | id: {}\tname: {}\troom: {}>'.format(self.id, self.username, self.room_id)    