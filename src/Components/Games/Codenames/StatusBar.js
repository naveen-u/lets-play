import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import Instructions from "./Instructions";
import { TEAMS, CONSTANTS } from "./Constants";

const useStyles = makeStyles((theme) => ({
  turnBox: {
    margin: theme.spacing(0, 4),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    borderColor: (props) => props.currentColor,
  },
  turnAvatar: {
    margin: theme.spacing(1),
    backgroundColor: (props) => props.currentColor,
  },
  margin: {
    marginLeft: theme.spacing(1),
  },
  leftBox: {
    margin: theme.spacing(0, 4),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
  },
  blueLeft: {
    margin: theme.spacing(1),
    backgroundColor: "DeepSkyBlue",
  },
  redLeft: {
    margin: theme.spacing(1),
    backgroundColor: "FireBrick",
  },
  red: {
    color: "Red",
  },
  blue: {
    color: "DeepSkyBlue",
  },
}));

const StatusBar = (props) => {
  const classes = useStyles(props);

  const winMessage =
    props.details === TEAMS.BLUE
      ? TEAMS.BLUE + " TEAM WINS!"
      : props.details === TEAMS.RED
      ? TEAMS.RED + " TEAM WINS!"
      : props.details === TEAMS.BLUE + CONSTANTS.SPYMASTER
      ? TEAMS.BLUE + " SPYMASTER LEFT!"
      : props.details === TEAMS.RED + CONSTANTS.SPYMASTER
      ? TEAMS.RED + " SPYMASTER LEFT!"
      : props.details === TEAMS.BLUE + CONSTANTS.PLAYER
      ? "ALL THE BLUE PLAYERS LEFT!"
      : props.details === TEAMS.RED + CONSTANTS.PLAYER
      ? "ALL THE RED PLAYERS LEFT!"
      : "";

  const winColor =
    props.details === TEAMS.BLUE
      ? TEAMS.BLUE
      : props.details === TEAMS.RED
      ? TEAMS.RED
      : "";

  return (
    <Grid item container direction="row" alignItems="center">
      {!props.gameOver ? (
        <>
          <Tooltip title="Words left">
            <Box border={1} className={classes.leftBox}>
              <Avatar className={classes.blueLeft}>{props.blueLeft}</Avatar>
              <Avatar className={classes.redLeft}>{props.redLeft}</Avatar>
            </Box>
          </Tooltip>
          <div style={{ flexGrow: 1 }} />
          <Instructions />
          <div style={{ flexGrow: 1 }} />
          <Box border={1} className={classes.turnBox}>
            <Typography variant="button" className={classes.margin}>
              TURNS
            </Typography>
            <Avatar className={classes.turnAvatar}>{props.turns}</Avatar>
          </Box>
        </>
      ) : (
        <>
          <div style={{ flexGrow: 1 }} />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="overline">Game Over</Typography>
            <Typography variant="h4" className={`${classes[winColor]}`}>
              {winMessage.toUpperCase()}
            </Typography>
          </Box>
          <div style={{ flexGrow: 1 }} />
        </>
      )}
    </Grid>
  );
};

export default StatusBar;
