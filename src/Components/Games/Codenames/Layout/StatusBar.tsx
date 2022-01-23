import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Theme } from "@mui/material/styles";

import makeStyles from '@mui/styles/makeStyles';

import Instructions from "./Instructions";
import { Teams, PlayerType } from "../domain";

interface StatusBarProps {
  currentColor: string;
  details: string;
  gameOver: boolean;
  blueLeft: number;
  redLeft: number;
  turns: number;
}

const useStyles = makeStyles<Theme, StatusBarProps>((theme) => ({
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

const StatusBar = (props: StatusBarProps) => {
  const classes = useStyles(props);

  const winMessage =
    props.details === Teams.BLUE
      ? Teams.BLUE + " TEAM WINS!"
      : props.details === Teams.RED
      ? Teams.RED + " TEAM WINS!"
      : props.details === Teams.BLUE + PlayerType.SPYMASTER
      ? Teams.BLUE + " SPYMASTER LEFT!"
      : props.details === Teams.RED + PlayerType.SPYMASTER
      ? Teams.RED + " SPYMASTER LEFT!"
      : props.details === Teams.BLUE + PlayerType.PLAYER
      ? "ALL THE BLUE PLAYERS LEFT!"
      : props.details === Teams.RED + PlayerType.PLAYER
      ? "ALL THE RED PLAYERS LEFT!"
      : "";

  const winColor =
    props.details === Teams.BLUE
      ? Teams.BLUE
      : props.details === Teams.RED
      ? Teams.RED
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
