import json
import random
from types import SimpleNamespace

from flask_socketio import Namespace, emit, join_room, leave_room
from flask_login import current_user
from sqlalchemy import func

from app import socketio, db
from app import register_clean_up_method
from app.models.user_data import UserData
from app.models.codenames import CodenamesPlayers, CodenamesTeams, CodenamesRooms, CodenamesWords

#########################################
#                                       #
#               CONSTANTS               # 
#                                       #
#########################################

# Socketio namespace for this game
NAMESPACE = '/codenames'
SPYMASTER = 'Spymaster'
PLAYER = 'Player'

# Team names
TEAMS_DICT = {
    'NEUTRAL': 'neutral',       # users who aren't in either team
    'BLUE': 'blue',             # blue team
    'RED': 'red'                # red team
}
TEAMS = SimpleNamespace(**TEAMS_DICT)

# Game states
STATES_DICT = {
    'JOIN': 'JOIN',                         # awaiting team formation
    'RED_READY': 'RED_READY',               # red team is ready but blue is not
    'BLUE_READY': 'BLUE_READY',             # blue team is ready but red is not
    'STARTED': 'STARTED',                   # setting up game
    'BLUE_PLAYER': 'BLUE_PLAYER',           # blue team's turn to guess words
    'RED_PLAYER': 'RED_PLAYER',             # red team's turn to guess words
    'BLUE_SPYMASTER': 'BLUE_SPYMASTER',     # blue spymaster's turn to give a clue
    'RED_SPYMASTER': 'RED_SPYMASTER',       # red spymaster's turn to give a clue
    'GAME_OVER': 'GAME_OVER',               # game ended
}
STATES = SimpleNamespace(**STATES_DICT)

######################################################################
#                                                                    #
#                           EVENT HANDLERS                           #
#                         ==================                         #
#                                                                    #
#  EVENTS                                   EXPLANATION              #
#                                                                    #
# connect               Fired when a user connects to the namespace. #
#                       The user is added to the neutral team,       #
#                       existing team data is sent to the user, and  #
#                       existing users are notified.                 #
#                                                                    #
# join_team             Sent by client when they join or leave a     #
#                       team.                                        #
#                                                                    #
# set_spymaster         Sent by client when they set themselves as   #
#                       spymaster of their team.                     #
#                                                                    #
# team_ready            Sent by client when the spymaster marks      #
#                       their team as ready to start.                #
#                                                                    #
# clue                  Fired when a spymaster sends the clue for    #
#                       their team's turn.                           #
#                                                                    #
# word_click            Fired when a player clicks on a word cell    #
#                                                                    #
# restart_with_same_teams   Fired when the room admin chooses the    #
#                       restart with same teams option.              #
#                                                                    #
# restart               Fired when the room admin chooses the "Start #
#                       a new game" option.                          #
#                                                                    #
# chat_message          Fired when a user sends a chat message to    #
#                       their team.                                  #
#                                                                    #
######################################################################

class Codenames(Namespace):
    """
    Class-based event handler for the namespace.
    Handles all events related to the Codenames game.
    """
    def on_connect(self):
        """
        Handles the on_connect event in the namespace.
        Adds user to the room in the namespace. Adds users
        to the neutrals team by default.
        """
        # Check if user is authenticated
        if not current_user.is_authenticated:
            return

        if current_user.codenames_player is None:
            # The connection is from a new user
            join_room(current_user.room_id)
            # Populate codenames_teams table if not already populated
            room = current_user.room.codenames_room
            if room is None:
                room = CodenamesRooms(room_data=current_user.room, state="JOIN")
                db.session.add(room)
                for team_name in TEAMS_DICT.values():
                    team = CodenamesTeams(room_id=current_user.room_id, team_name=team_name)
                    db.session.add(team)
                db.session.commit()
            team = CodenamesTeams.query.filter_by(room_id=current_user.room_id, team_name=TEAMS.NEUTRAL).first()
            player = CodenamesPlayers(user_data=current_user, team=team)
            db.session.add(player)
            db.session.commit()
            # Send message to other players notifying them of the new player
            message = dict()
            message['user'] = current_user.username
            message['id'] = current_user.id
            message['team'] = TEAMS.NEUTRAL
            emit('join_team', message, room=current_user.room_id, include_self=False)
        else:
            # The connection is from an existing player. Hence, add the new socket id to the room.
            join_room(current_user.room_id)
            if current_user.codenames_player.team.team_name != TEAMS.NEUTRAL \
                    and current_user.codenames_player.spymaster_of is None:
                join_room(current_user.room_id + current_user.codenames_player.team.team_name)
            db.session.commit()

        emit('game_state', current_user.room.codenames_room.state)
        # Send a message to the new player with the list of current players
        team_list = dict()
        team_list['players'] = []
        players = CodenamesTeams.query.filter_by(room_id=current_user.room_id)\
                .join(CodenamesPlayers, CodenamesTeams.id == CodenamesPlayers.team_id)\
                .with_entities(CodenamesPlayers.id, CodenamesTeams.team_name)\
                .join(UserData, UserData.id == CodenamesPlayers.id)\
                .with_entities(UserData.id, UserData.username, CodenamesTeams.team_name)\
                .all()
        
        for i in players:
            player_id, name, team = i
            team_list['players'].append({'id': player_id, 'user': name, 'team':team})
        
        spymasters = CodenamesTeams.query\
                    .filter(CodenamesTeams.room_id==current_user.room_id,CodenamesTeams.spymaster!=None)\
                    .join(UserData, CodenamesTeams.spymaster == UserData.id)\
                    .with_entities(CodenamesTeams.spymaster, UserData.username, CodenamesTeams.team_name)\
                    .all()
        
        for i in spymasters:
            player_id, name, team = i
            team_list[team + SPYMASTER] = {'id': player_id, 'user': name, 'team':team}

        team_list['currentTeam'] = current_user.codenames_player.team.team_name
        emit('team_list', team_list, room=current_user.sid)
        room = current_user.room.codenames_room
        if room.state not in [STATES.JOIN, STATES.RED_READY, STATES.BLUE_READY]:
            data = {}
            data['state'] = room.state
            data['details'] = room.state_details
            data['turns'] = room.turns_left
            data['words'] = json.loads(room.words)
            data['blueLeft'] = CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.BLUE).first().words_left
            data['redLeft'] = CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.RED).first().words_left
            if room.state in [STATES.BLUE_PLAYER, STATES.RED_PLAYER]:
                data['clue'] = room.clue
            if current_user.codenames_player.spymaster_of is not None or room.state == STATES.GAME_OVER:
                data['grid'] = room.grid
            emit('game_data', data, room=room.id)
    
    def on_disconnect(self):
        pass

    def on_join_team(self, message):
        """
        Handles the join_team event in the namespace.
        """
        # Check if user is authenticated and playing the game
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        # Check game state
        if current_user.room.codenames_room.state not in \
                [STATES.JOIN, STATES.RED_READY, STATES.BLUE_READY]:
            return

        newTeam = CodenamesTeams.query.filter_by(room_id=current_user.room_id, team_name=message).first()
        oldTeam = current_user.codenames_player.team

        # If the old team was ready but the player leaving was a spymaster or the last player,
        # mark the team as not ready
        state = oldTeam.room.state
        if state == STATES.RED_READY and oldTeam.team_name == TEAMS.RED or\
                state == STATES.BLUE_READY and oldTeam.team_name == TEAMS.BLUE:
            if oldTeam.spymaster is not None and oldTeam.spymaster == current_user.id:
                oldTeam.room.state = STATES.JOIN
                emit('game_state', STATES.JOIN, room=current_user.room_id)
            elif len(oldTeam.players) == 2:
                oldTeam.room.state = STATES.JOIN
                emit('game_state', STATES.JOIN, room=current_user.room_id)

        # If player was spymaster of their old team, remove team's spymaster
        if oldTeam.spymaster is not None and oldTeam.spymaster == current_user.id:
            oldTeam.spymaster = None

        current_user.codenames_player.team = newTeam
        db.session.commit()
        # Send signal
        data = dict()
        data['user'] = current_user.username
        data['id'] = current_user.id
        data['team'] = message
        emit('join_team', data, room=current_user.room_id)
        join_room(current_user.room_id + message)
    
    def on_set_spymaster(self):
        """
        Handles the set_spymaster event in the namespace
        """
        # Check if user is authenticated and playing the game
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        # Check game state
        if current_user.room.codenames_room.state not in \
                [STATES.JOIN, STATES.RED_READY, STATES.BLUE_READY]:
            return
        # Check that player is in a playing team
        if current_user.codenames_player.team.team_name == TEAMS.NEUTRAL:
            return

        player = current_user.codenames_player
        team = current_user.codenames_player.team
        if team.spymaster_player is None:
            team.spymaster_player = player
            db.session.commit()
            data = dict()
            data['team'] = team.team_name
            data['user'] = current_user.username
            data['id'] = current_user.id
            emit('set_spymaster', data, room=current_user.room_id)
            leave_room(current_user.room_id + team.team_name)

    def on_team_ready(self):
        """
        Handles the team_ready event. If both teams are ready, the game begins.
        """
        # Check if user is authenticated and playing the game
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        # Check game state
        if current_user.room.codenames_room.state not in \
                [STATES.JOIN, STATES.RED_READY, STATES.BLUE_READY]:
            return
        # Check that user is a spymaster
        if current_user.codenames_player.team.spymaster_player != current_user.codenames_player:
            return

        team = current_user.codenames_player.team

        if team.spymaster is None:
            return

        if not self.player_distribution_is_valid(check_spymaster=False):
            return

        if team.team_name == TEAMS.RED:
            if team.room.state == STATES.JOIN:
                team.room.state = STATES.RED_READY
            elif team.room.state == STATES.RED_READY:
                team.room.state = STATES.JOIN
            elif team.room.state == STATES.BLUE_READY:
                team.room.state = STATES.STARTED
        elif team.team_name == TEAMS.BLUE:
            if team.room.state == STATES.JOIN:
                team.room.state = STATES.BLUE_READY
            elif team.room.state == STATES.BLUE_READY:
                team.room.state = STATES.JOIN
            elif team.room.state == STATES.RED_READY:
                team.room.state = STATES.STARTED
        db.session.commit()
        emit('game_state', team.room.state, room=current_user.room_id)
        if current_user.room.codenames_room.state == STATES.STARTED:
            self.create_word_list()
    
    def on_clue(self, data):
        """
        Handles the clue event. This is fired when a spymaster sends a clue to their team.
        """
        # Check if user is authenticated and playing the game
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        # Check that user is a spymaster
        if current_user.codenames_player.team.spymaster_player != current_user.codenames_player:
            return
        # Check game state
        if not ((current_user.room.codenames_room.state == STATES.BLUE_SPYMASTER and 
                current_user.codenames_player.team.team_name == TEAMS.BLUE ) or \
                (current_user.room.codenames_room.state == STATES.RED_SPYMASTER and \
                current_user.codenames_player.team.team_name == TEAMS.RED )):
            return
        # Check that the clue does not contain any of the words in the grid
        for word in json.loads(current_user.room.codenames_room.words):
            if word not in ['R', 'B', 'N', 'A'] and word in data['clue']:
                print(f'\n\n\n{word} is inside {data["clue"]}\n\n\n')
                return
        # Check that the clue number is at most the number of words left
        if current_user.codenames_player.team.words_left < data['number']:
            return

        current_user.room.codenames_room.clue = data['clue']
        current_user.room.codenames_room.turns_left = data['number'] + 1
        state = None
        if current_user.room.codenames_room.state == STATES.BLUE_SPYMASTER:
            state = STATES.BLUE_PLAYER
            current_user.room.codenames_room.state = STATES.BLUE_PLAYER
        elif current_user.room.codenames_room.state == STATES.RED_SPYMASTER:
            state = STATES.RED_PLAYER
            current_user.room.codenames_room.state = STATES.RED_PLAYER
        db.session.commit()

        data['state'] = state
        data['turns'] = current_user.room.codenames_room.turns_left
        emit('game_data', data, room=current_user.room_id)
    
    def on_word_click(self, index):
        """
        Handles the word_click event. This is fired when a player clicks on a word cell.
        """
        # Check if user is authenticated and playing the game
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        # Check that user is not a spymaster
        team = current_user.codenames_player.team 
        if team.spymaster_player == current_user.codenames_player:
            return
        # Check game state
        room = current_user.room.codenames_room
        if not ((room.state == STATES.BLUE_PLAYER and team.team_name == TEAMS.BLUE ) or \
                (room.state == STATES.RED_PLAYER and team.team_name == TEAMS.RED )):
            return
        if room.turns_left <= 0:
            return
        words = json.loads(room.words)
        grid = room.grid
        words[index] = grid[index]
        winner = None
        current_team = None
        if grid[index] in ['B', 'R']:
            if (grid[index] == 'R' and team.team_name == TEAMS.BLUE) or \
                    (grid[index] == 'B' and team.team_name == TEAMS.RED):
                room.turns_left = 0
            else:
                room.turns_left = CodenamesRooms.turns_left - 1
            r = None
            if grid[index] == 'B':
                current_team = CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.BLUE).first()
            if grid[index] == 'R':
                current_team = CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.RED).first()
            if current_team.words_left == 1:
                room.state = STATES.GAME_OVER
                winner = current_team.team_name
                room.state_details = winner
        if grid[index] == 'N':
            room.turns_left = 0
        if grid[index] == 'A':
            room.state = STATES.GAME_OVER
            if team.team_name == TEAMS.BLUE:
                winner = TEAMS.RED
            else:
                winner = TEAMS.BLUE
            room.state_details = winner
        if room.turns_left == 0:
            if room.state == STATES.BLUE_PLAYER:
                room.state = STATES.RED_SPYMASTER
            elif room.state == STATES.RED_PLAYER:
                room.state = STATES.BLUE_SPYMASTER
        room.words = json.dumps(words)
        if current_team is not None:
            current_team.words_left = CodenamesTeams.words_left - 1
        db.session.commit()
        data = {}
        data['words'] = words
        data['state'] = room.state
        data['turns'] = room.turns_left
        if winner is not None:
            data['details'] = winner
            data['grid'] = room.grid
        if grid[index] == 'R':
            data['redLeft'] = CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.RED).first().words_left
        elif grid[index] == 'B':
            data['blueLeft'] = CodenamesTeams.query.filter_by(room=room, team_name=TEAMS.BLUE).first().words_left
        emit('game_data', data, room=current_user.room_id)
    
    def on_restart_with_same_teams(self):
        """
        Handles the restart_with_same_teams event. This is fired when the room admin choses
        to start a new game with the same teams.
        """
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        
        if not current_user.room.codenames_room.state == STATES.GAME_OVER:
            return

        if current_user.room.codenames_room.state_details == TEAMS.BLUE + SPYMASTER or\
                current_user.room.codenames_room.state_details == TEAMS.RED + SPYMASTER:
            return

        if not self.player_distribution_is_valid:
            return

        current_user.room.codenames_room.state = STATES.STARTED
        current_user.room.codenames_room.turns_left = 0
        db.session.commit()
        emit('game_state', STATES.STARTED, room=current_user.room_id)
        self.create_word_list()
    
    def on_restart(self):
        """
        Handles the restart_with_same_teams event. This is fired when the room admin choses
        to start a new game.
        """
        if not current_user.is_authenticated or current_user.codenames_player is None:
            return
        
        if not current_user.room.codenames_room.state == STATES.GAME_OVER:
            return
        
        emit('game_state', STATES.JOIN, room=current_user.room_id)

        team = CodenamesTeams.query.filter_by(room_id=current_user.room_id, team_name=TEAMS.NEUTRAL).first()
        current_user.room.codenames_room.state = STATES.JOIN
        current_user.room.codenames_room.state_details = None
        

        team_list = dict()
        team_list['players'] = []

        users = UserData.query.filter_by(room_id=current_user.room_id)

        for user in users:
            leave_room(user.room_id+user.codenames_player.team.team_name)
            user.codenames_player.team = team
            team_list['players'].append({'id': user.id, 'user': user.username, 'team': TEAMS.NEUTRAL})
            if user.codenames_player.spymaster_of is not None:
                user.codenames_player.spymaster_of.spymaster = None

        db.session.commit()
        team_list['currentTeam'] = TEAMS.NEUTRAL
        team_list['state'] = STATES.JOIN
        team_list[TEAMS.BLUE + SPYMASTER] = None
        team_list[TEAMS.RED + SPYMASTER] = None
        emit('team_list', team_list, room=current_user.room_id)

    def on_chat_message(self, message):
        """
        Handles the chat_message event in this namespace.
        Listens to messages from users and broadcasts it other users
        in the same team.
        """
        if current_user.is_authenticated:
            message['username'] = current_user.username
            emit('chat_message', message, room=current_user.room_id + current_user.codenames_player.team.team_name, include_self=False)

    def create_word_list(self):
        """
        Get 25 random words from the corpus and send them to the players.
        """
        words = CodenamesWords.query.filter_by(variant='STANDARD')\
            .order_by(func.random()).limit(25).all()
        list_of_words = [word.front if random.getrandbits(1) else word.back for word in words]
        current_user.room.codenames_room.words = json.dumps(list_of_words)
        db.session.commit()
        data = {}
        data['words'] = list_of_words
        data['turns'] = 0
        l = ['A'] + ['N']*7 + ['B']*8 + ['R']*8
        if random.getrandbits(1):
            current_user.room.codenames_room.state = STATES.BLUE_SPYMASTER
            state = STATES.BLUE_SPYMASTER
            l += ['B']

        else:
            current_user.room.codenames_room.state = STATES.RED_SPYMASTER
            state = STATES.RED_SPYMASTER
            l += ['R']
        if state == STATES.BLUE_SPYMASTER:
            data['blueLeft'] = 9
            data['redLeft'] = 8
        else:
            data['redLeft'] = 9
            data['blueLeft'] = 8
        emit('game_data', data, room=current_user.room_id, namespace=NAMESPACE)
        random.shuffle(l)
        grid = ''.join(l)
        current_user.room.codenames_room.grid = grid
        db.session.commit()
        data = dict()
        data['grid'] = grid
        emit('game_state', state, room=current_user.room_id)
        for team in current_user.room.codenames_room.teams:
            if team.spymaster_player is not None:
                emit('game_data', data, room=team.spymaster_player.user_data.sid)
                if state == STATES.BLUE_SPYMASTER and team.team_name == TEAMS.BLUE or\
                        state == STATES.RED_SPYMASTER and team.team_name == TEAMS.RED:
                    team.words_left = 9
                else:
                    team.words_left = 8
            db.session.commit()

    def player_distribution_is_valid(self, check_spymaster=True):
        blueTeam = CodenamesTeams.query.filter_by(room=current_user.room.codenames_room, team_name=TEAMS.BLUE).first()
        redTeam = CodenamesTeams.query.filter_by(room=current_user.room.codenames_room, team_name=TEAMS.RED).first()

        if check_spymaster:
            if blueTeam.spymaster is None or redTeam.spymaster is None:
                return False

        if len(blueTeam.players) < 2 or len(redTeam.players) < 2 or abs(len(blueTeam.players) - len(redTeam.players)) > 1:
            return False

        return True

#########################################
#                                       #
#                CLEANUP                # 
#                                       #
#########################################

@register_clean_up_method
def cleanup_codenames(current_user):
    """
    Registering a cleanup method for the codenames namespace. This removes the user
    from their team's list of players.
    """
    if current_user.codenames_player is None:
        return

    team = current_user.codenames_player.team
    if team.spymaster_player == current_user.codenames_player:
        team.spymaster = None
        if team.room.state == STATES.RED_READY and team.team_name == TEAMS.RED or\
                team.room.state == STATES.BLUE_READY and team.team_name == TEAMS.BLUE:
            team.room.state = STATES.JOIN
            emit('game_state', STATES.JOIN, room=current_user.room_id, namespace=NAMESPACE)
        elif team.room.state != STATES.GAME_OVER and team.room.state != STATES.JOIN:
            team.room.state = STATES.GAME_OVER
            team.room.state_details = team.team_name + SPYMASTER
            data = {}
            data['state'] = team.room.state
            data['details'] = team.room.state_details
            data['grid'] = team.room.grid
            emit('game_data', data, room=current_user.room_id, namespace=NAMESPACE)
    elif len(team.players) == 2:
        if team.room.state == STATES.RED_READY and team.team_name == TEAMS.RED or\
                team.room.state == STATES.BLUE_READY and team.team_name == TEAMS.BLUE:
            team.room.state = STATES.JOIN
            emit('game_state', STATES.JOIN, room=current_user.room_id, namespace=NAMESPACE)
        elif team.room.state != STATES.GAME_OVER and team.room.state != STATES.JOIN:
            team.room.state = STATES.GAME_OVER
            team.room.state_details = team.team_name + PLAYER
            data = {}
            data['state'] = team.room.state
            data['details'] = team.room.state_details
            data['grid'] = team.room.grid
            emit('game_data', data, room=current_user.room_id, namespace=NAMESPACE)

    db.session.delete(current_user.codenames_player)
    db.session.commit()

    players = UserData.query.filter_by(room_id=current_user.room_id).all()
    if len(players) == 1:
        teams = CodenamesTeams.query.filter_by(room_id=current_user.room_id).all()
        for team in teams:
            db.session.delete(team)
        db.session.delete(current_user.room.codenames_room)
        db.session.commit()
    # Send signal
    message = dict()
    message['id'] = current_user.id
    emit('leave_game', message, room=current_user.room_id, namespace=NAMESPACE)

socketio.on_namespace(Codenames(NAMESPACE))