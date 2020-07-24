import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

import Chat from '../../Chat';
import Game from './Game';
import PickTeams from './PickTeams';
import PlayerList from './PlayerList';
import { TEAMS, STATES } from './Constants';

const socket = io('/codenames', {autoConnect: false});

const Codenames = (props) => {
  const [playerList, setPlayerList] = useState([]);
  const [blueMaster, setBlueMaster] = useState('');
  const [redMaster, setRedMaster] = useState('');
  const [currentTeam, setCurrentTeam] = useState(TEAMS.NEUTRAL);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Connect to the /codenames namespace on component mount
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('game_state', data => {
      console.log('Got state ', data);
      setGameState(data);
    });

    // team_list event rewrites present team list.
    socket.on('team_list', data => {
      if (typeof data.blueMaster !== 'undefined') {
        setBlueMaster(data.blueMaster || '');
      }
      if (typeof data.redMaster !== 'undefined') {
        setRedMaster(data.redMaster || '');
      }
      if (data.currentTeam === TEAMS.BLUE) {
        setCurrentTeam(TEAMS.BLUE);
      }
      else if (data.currentTeam === TEAMS.RED) {
        setCurrentTeam(TEAMS.RED);
      }
      else {
        setCurrentTeam(TEAMS.NEUTRAL);
      }
      setPlayerList(data.players);
    });

    // leave_game event signifies that a user left the game.
    socket.on('leave_game', data => {
      setPlayerList(list => list.filter(player => player.id !== data.id));
      setBlueMaster(blueMaster => blueMaster?.id === data.id ? '' : blueMaster);
      setRedMaster(redMaster => redMaster?.id === data.id ? '' : redMaster);
    });

    // Close socket (and leave room) when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const ongoing = !(gameState === STATES.JOIN || gameState === STATES.BLUE_READY || gameState === STATES.RED_READY);

  const teamChatEnabled = ongoing && (currentTeam === TEAMS.BLUE && blueMaster.id !== props.userId || currentTeam === TEAMS.RED && redMaster.id !== props.userId)

  return(
    <Grid container component="main">
      <Grid item xs={12} sm={9} md={9}>
      <Box height="100%" display="flex" flexDirection="row" justifyContent="left" alignContent="center">

        <PlayerList list={playerList} />
        <Divider orientation="vertical" light />
      
        {gameState != null && ongoing ? 
          <Game
            socket={socket}
            gameState={gameState}
            setGameState={setGameState}          
            userId={props.userId}
            admin={props.admin}
            playerList={playerList}
            blueMaster={blueMaster}
            redMaster={redMaster}
            currentTeam={currentTeam}
          />
        : ongoing === false ?
          <PickTeams
            socket={socket}
            playerList={playerList}
            setPlayerList={setPlayerList}
            blueMaster={blueMaster}
            setBlueMaster={setBlueMaster}
            redMaster={redMaster}
            setRedMaster={setRedMaster}
            currentTeam={currentTeam}
            setCurrentTeam={setCurrentTeam}
            blueTeamReady={gameState === STATES.BLUE_READY}
            redTeamReady={gameState === STATES.RED_READY}
            userId={props.userId}
          />
          : <></>
        }

      </Box>
      </Grid>
      <Grid item xs={false} sm={3} md={3} component={Paper}>
        <Chat teamSocket={teamChatEnabled ? socket : null}/>
      </Grid>
    </Grid>
  );


}

export default Codenames;