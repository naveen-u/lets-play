import React from "react";
import { useRecoilValue } from "recoil";
import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import Instructions from "./Instructions";
import TeamCard from "./TeamCard";
import { GameStates, Teams } from "../domain";
import {
  blueMasterState,
  blueTeamState,
  currentTeamState,
  gameConditionState,
  playerListState,
  redMasterState,
  redTeamState,
  socket,
} from "../store";

const useStyles = makeStyles((theme) => ({
  headerText: {
    margin: theme.spacing(3, 0),
  },
  teamImbalancedAlert: {
    margin: theme.spacing(3),
    maxWidth: 662,
  },
}));

const PickTeams = () => {
  const classes = useStyles();

  const playerList = useRecoilValue(playerListState);
  const blueTeam = useRecoilValue(blueTeamState);
  const redTeam = useRecoilValue(redTeamState);
  const blueMaster = useRecoilValue(blueMasterState);
  const redMaster = useRecoilValue(redMasterState);
  const currentTeam = useRecoilValue(currentTeamState);
  const gameState = useRecoilValue(gameConditionState);

  const allowReady =
    Math.abs(blueTeam.length - redTeam.length) <= 1 &&
    blueTeam.length >= 2 &&
    redTeam.length >= 2;

  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Instructions />
      <Typography
        variant="overline"
        align="center"
        color="textSecondary"
        className={classes.headerText}
      >
        Split into two teams.
      </Typography>
      <Box display="flex" justifyContent="center">
        <Grid container justify="center" spacing={4} alignItems="center">
          <Grid item>
            <TeamCard
              team={Teams.BLUE}
              list={blueTeam}
              spymaster={blueMaster}
              percentOfMembers={Math.min(
                (blueTeam.length / playerList.length) * 200,
                100
              )}
              socket={socket}
              currentTeam={currentTeam}
              ready={gameState === GameStates.BLUE_READY}
              allowReady={allowReady}
            />
          </Grid>
          <Grid item>
            <TeamCard
              team={Teams.RED}
              list={redTeam}
              spymaster={redMaster}
              percentOfMembers={Math.min(
                (redTeam.length / playerList.length) * 200,
                100
              )}
              socket={socket}
              currentTeam={currentTeam}
              ready={gameState === GameStates.RED_READY}
              allowReady={allowReady}
            />
          </Grid>
        </Grid>
      </Box>
      {blueTeam.length > redTeam.length + 1 ? (
        <Alert
          variant="outlined"
          severity="warning"
          className={classes.teamImbalancedAlert}
        >
          Blue team has way too many players. Someone's gotta join the Reds.
        </Alert>
      ) : redTeam.length > blueTeam.length + 1 ? (
        <Alert
          variant="outlined"
          severity="warning"
          className={classes.teamImbalancedAlert}
        >
          Red team has way too many players. Someone's gotta join the blues.
        </Alert>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default PickTeams;
