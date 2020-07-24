from app import db
from sqlalchemy.orm import backref

class RoomData(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    admin_id = db.Column(db.String(64), db.ForeignKey('user_data.id'))
    game = db.Column(db.String(20))
    admin = db.relationship('UserData', backref=backref("admin_of", uselist=False), foreign_keys=[admin_id], post_update=True)

    def __repr__(self):
        return '<Room | id: {}, admin: {}>'.format(self.id, self.admin_id)