import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import SpymasterInput from './SpymasterInput';
import StatusBar from './StatusBar';
import WordGrid from './WordGrid';
import { TEAMS, STATES } from './Constants';
import PlayerList from './PlayerList';

const useStyles = makeStyles((theme) => ({
  clue: {
    height: 56,
    minWidth: 227,
    borderWidth: "2px",
    borderRadius: "8px",
    borderColor: ({currentColor}) => currentColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(0,2),
  },
  endGameButton: {
    width: 275,
    margin: theme.spacing(0,2),
  }
}));

const Game = (props) => {
  const [words, setWords] = useState([]);
  const [grid, setGrid] = useState([]);
  const [clue,setClue] = useState([]);
  
  const [turns, setTurns] = useState(0);
  const [blueLeft, setBlueLeft] = useState(0);
  const [redLeft, setRedLeft] = useState(0);
  const [details, setDetails] = useState('');

  useEffect(() => {
    props.socket.on('game_data', data => {
      if (data.words != null) {
        setWords(data.words);
      }
      if (data.grid != null) {
        setGrid(data.grid);
      }
      if (data.state != null) {
        props.setGameState(data.state);
      }
      if (data.clue != null) {
        setClue(data.clue);
      }
      if (data.turns != null) {
        setTurns(data.turns);
      }
      if (data.blueLeft != null) {
        setBlueLeft(data.blueLeft);
      }
      if (data.redLeft != null) {
        setRedLeft(data.redLeft);
      }
      if (data.details != null) {
        setDetails(data.details);
      }
    });
  }, [props.socket]);

  const isSpymaster = props.currentTeam === TEAMS.BLUE && props.blueMaster.id === props.userId ||
                      props.currentTeam === TEAMS.RED && props.redMaster.id === props.userId;
  
  const themeColor = props.currentTeam === TEAMS.BLUE ? 'primary' : 'secondary';

  const currentColor = props.gameState === STATES.BLUE_PLAYER ? 'DeepSkyBlue':
                       props.gameState === STATES.RED_PLAYER ? 'FireBrick' : 'Grey';

  const playerTurn = props.gameState === STATES.BLUE_PLAYER && props.currentTeam === TEAMS.BLUE ||
                     props.gameState === STATES.RED_PLAYER && props.currentTeam === TEAMS.RED
  
  const spymasterTurn = props.gameState === STATES.BLUE_SPYMASTER && props.currentTeam === TEAMS.BLUE && isSpymaster ||
                        props.gameState === STATES.RED_SPYMASTER && props.currentTeam === TEAMS.RED && isSpymaster;
  
  const gameOver = props.gameState === STATES.GAME_OVER;

  const currentTeamLeft = props.currentTeam === TEAMS.BLUE ? blueLeft : redLeft;

  const classes = useStyles({currentColor});

  const sameTeams = () => {
    props.socket.emit('restart_with_same_teams');
  }

  const restart = () => {
    props.socket.emit('restart');
  }

  return (
    <Grid container direction="column" spacing={3} alignItems="center" justify="center">
      <StatusBar
        blueLeft={blueLeft}
        redLeft={redLeft}
        turns={turns}
        currentColor={currentColor}
        gameOver={props.gameState === STATES.GAME_OVER}
        details={details}
      />
      <WordGrid
        words={words}
        grid={grid} 
        isSpymaster={isSpymaster || gameOver}
        playerTurn={playerTurn}
        socket={props.socket}
        gameOver={gameOver}
      />
      {!gameOver ? 
          spymasterTurn ? 
          <SpymasterInput
            socket={props.socket}
            themeColor={themeColor}
            maxNum={currentTeamLeft}
            words={words}
          />
          :
          <Grid item>
            <Box className={classes.clue} border={1} display="block" component="div">
              {props.gameState === STATES.BLUE_PLAYER || props.gameState === STATES.RED_PLAYER ?
                <Typography>
                {clue.toString().toUpperCase()}
                </Typography>
                :
                <Typography color="textSecondary">
                  Waiting for spymaster...
                </Typography>
              }
            </Box>
          </Grid>
        :
          props.admin ? 
            <Box display="flex" flexDirection="row" alignItems="center">
            <Button
              type="button"
              variant="contained"
              color="primary"
              onClick={sameTeams}
              className={classes.endGameButton}
              disabled={!(props.blueMaster && props.redMaster && 
                Math.abs(
                  props.playerList.filter(player => player.team === TEAMS.BLUE).length
                  - props.playerList.filter(player => player.team === TEAMS.RED).length
                ) <= 1 &&
                props.playerList.filter(player => player.team === TEAMS.BLUE).length >= 2 &&
                props.playerList.filter(player => player.team === TEAMS.RED).length >= 2
              )}
            >
              Play again with same teams
            </Button>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              onClick={restart}
              className={classes.endGameButton}
            >
              Start a new game
            </Button>
            </Box>
          :
          <Box className={classes.clue} border={1} display="block" component="div">
            <Typography color="textSecondary">
              Waiting for room admin to start next game...
            </Typography>
          </Box>
      }
    </Grid>
  );
}

export default Game;