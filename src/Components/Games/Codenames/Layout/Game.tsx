import React, { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";

import makeStyles from "@mui/styles/makeStyles";

import SpymasterInput from "./SpymasterInput";
import StatusBar from "./StatusBar";
import WordGrid from "./WordGrid";
import { isAdminState, userIdState } from "../../../stores/gameDataStore";
import { GameStates, IGameData, IPlayer, Teams } from "../domain";
import {
  blueMasterState,
  currentTeamState,
  gameConditionState,
  playerListState,
  redMasterState,
  socket,
} from "../store";

interface IStyleProps {
  currentColor: string;
  playerTurn: boolean;
}

const useStyles = makeStyles<Theme, IStyleProps>((theme) => ({
  clue: {
    borderWidth: "2px",
    borderRadius: 16,
    borderColor: ({ currentColor }) => currentColor,
    overflow: "hidden",
    "&:hover": {
      borderColor: "White",
    },
    pointerEvents: "none",
  },
  clueText: {
    height: 56,
    minWidth: 227,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(0, 2),
  },
  endGameButton: {
    width: 275,
    margin: theme.spacing(0, 2),
  },
  passButton: {
    color: "White",
    backgroundColor: ({ currentColor }) => currentColor,
    borderRadius: 0,
    pointerEvents: "auto",
    padding: theme.spacing(2),
    "&:hover": {
      backgroundColor: "White",
      color: "Black",
      cursor: (props) => (props.playerTurn ? "pointer" : ""),
    },
  },
}));

const Game = () => {
  const playerList = useRecoilValue(playerListState);
  const blueMaster = useRecoilValue(blueMasterState);
  const redMaster = useRecoilValue(redMasterState);
  const currentTeam = useRecoilValue(currentTeamState);
  const [gameState, setGameState] = useRecoilState(gameConditionState);

  const [words, setWords] = useState([] as string[]);
  const [grid, setGrid] = useState([] as string[]);
  const [clue, setClue] = useState("");

  const [turns, setTurns] = useState(0);
  const [blueLeft, setBlueLeft] = useState(0);
  const [redLeft, setRedLeft] = useState(0);
  const [details, setDetails] = useState("");

  const userId = useRecoilValue(userIdState);
  const isAdmin = useRecoilValue(isAdminState);

  useEffect(() => {
    socket.on("game_data", (data: IGameData) => {
      if (data.words != null) {
        setWords(data.words);
      }
      if (data.grid != null) {
        setGrid(data.grid);
      }
      if (data.state != null) {
        setGameState(data.state);
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
  }, []);

  const isSpymaster =
    (currentTeam === Teams.BLUE && blueMaster?.id === userId) ||
    (currentTeam === Teams.RED && redMaster?.id === userId);

  const themeColor = currentTeam === Teams.BLUE ? "primary" : "secondary";

  const currentColor =
    gameState === GameStates.BLUE_PLAYER
      ? "DeepSkyBlue"
      : gameState === GameStates.RED_PLAYER
      ? "FireBrick"
      : "Grey";

  const playerTurn =
    ((gameState === GameStates.BLUE_PLAYER && currentTeam === Teams.BLUE) ||
      (gameState === GameStates.RED_PLAYER && currentTeam === Teams.RED)) &&
    !isSpymaster;

  const spymasterTurn =
    isSpymaster &&
    ((gameState === GameStates.BLUE_SPYMASTER && currentTeam === Teams.BLUE) ||
      (gameState === GameStates.RED_SPYMASTER && currentTeam === Teams.RED));

  const gameOver = gameState === GameStates.GAME_OVER;

  const currentTeamLeft = currentTeam === Teams.BLUE ? blueLeft : redLeft;

  const classes = useStyles({ currentColor, playerTurn });

  const sameTeams = () => {
    socket.emit("restart_with_same_teams");
  };

  const restart = () => {
    socket.emit("restart");
  };

  const handlePass = () => {
    socket.emit("pass");
  };

  return (
    <Grid
      container
      direction="column"
      spacing={3}
      alignItems="center"
      justifyContent="center"
    >
      <StatusBar
        blueLeft={blueLeft}
        redLeft={redLeft}
        turns={turns}
        currentColor={currentColor}
        gameOver={gameState === GameStates.GAME_OVER}
        details={details}
      />
      <WordGrid
        words={words}
        grid={grid}
        isSpymaster={isSpymaster || gameOver}
        playerTurn={playerTurn}
        socket={socket}
        gameOver={gameOver}
      />
      {!gameOver ? (
        spymasterTurn ? (
          <SpymasterInput
            socket={socket}
            themeColor={themeColor}
            maxNum={currentTeamLeft}
            words={words}
          />
        ) : (
          <Grid item>
            <Box
              className={classes.clue}
              border={1}
              display="flex"
              width="100%"
            >
              <Box className={classes.clueText} display="block" component="div">
                {gameState === GameStates.BLUE_PLAYER ||
                gameState === GameStates.RED_PLAYER ? (
                  <Typography>{clue.toString().toUpperCase()}</Typography>
                ) : (
                  <Typography color="textSecondary">
                    Waiting for spymaster...
                  </Typography>
                )}
              </Box>
              {playerTurn ? (
                <Box onClick={handlePass} className={classes.passButton}>
                  <Typography variant="button">Pass</Typography>
                </Box>
              ) : (
                ""
              )}
            </Box>
          </Grid>
        )
      ) : isAdmin ? (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={sameTeams}
            className={classes.endGameButton}
            disabled={
              !(
                blueMaster &&
                redMaster &&
                Math.abs(
                  playerList.filter(
                    (player: IPlayer) => player.team === Teams.BLUE
                  ).length -
                    playerList.filter(
                      (player: IPlayer) => player.team === Teams.RED
                    ).length
                ) <= 1 &&
                playerList.filter(
                  (player: IPlayer) => player.team === Teams.BLUE
                ).length >= 2 &&
                playerList.filter(
                  (player: IPlayer) => player.team === Teams.RED
                ).length >= 2
              )
            }
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
      ) : (
        <Box
          className={`${classes.clueText} ${classes.clue}`}
          border={1}
          display="block"
          component="div"
        >
          <Typography color="textSecondary">
            Waiting for room admin to start next game...
          </Typography>
        </Box>
      )}
    </Grid>
  );
};

export default Game;
