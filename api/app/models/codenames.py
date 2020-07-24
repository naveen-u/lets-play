from app import db
from sqlalchemy.orm import backref

class CodenamesPlayers(db.Model):
    id = db.Column(db.String(64), db.ForeignKey('user_data.id'), primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('codenames_teams.id'))
    user_data = db.relationship('UserData', backref=backref("codenames_player", uselist=False))
    team = db.relationship('CodenamesTeams', backref="players", foreign_keys=[team_id])

    def __repr__(self):
        return '<Codenames Player | id: {}>'.format(self.id)

class CodenamesTeams(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.String(10), db.ForeignKey('codenames_rooms.id'), index=True)
    team_name = db.Column(db.String(10))
    words_left = db.Column(db.Integer)
    spymaster = db.Column(db.String(64), db.ForeignKey('codenames_players.id'))
    room = db.relationship('CodenamesRooms', backref="teams", foreign_keys=[room_id])
    spymaster_player = db.relationship('CodenamesPlayers', backref=backref("spymaster_of",\
        uselist=False), foreign_keys=[spymaster], post_update=True)

    def __repr__(self):
        return '<Codenames Team | id: {}>'.format(self.id)

class CodenamesRooms(db.Model):
    id = db.Column(db.String(10), db.ForeignKey('room_data.id'), primary_key=True)
    state = db.Column(db.String)
    state_details = db.Column(db.String)
    grid = db.Column(db.String(25))
    words = db.Column(db.String)
    clue = db.Column(db.String)
    turns_left = db.Column(db.Integer)
    room_data = db.relationship('RoomData', backref=backref("codenames_room", uselist=False))

    def __repr__(self):
        return '<Codenames room | id: {}, state: {}>'.format(self.id, self.state)

class CodenamesWords(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    variant = db.Column(db.String, index=True)
    front = db.Column(db.String)
    back = db.Column(db.String)

    def __repr__(self):
        return '<Codenames Word | id: {}, variant: {}, front: {}, back: {}>'.format(self.id, self.variant, self.front, self.back)