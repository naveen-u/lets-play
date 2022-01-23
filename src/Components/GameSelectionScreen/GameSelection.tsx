import React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import makeStyles from '@mui/styles/makeStyles';

import Chat from "../Chat";
import gameData from "../Games/config";
import GameCard from "./GameCard";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: "90vh",
    overflow: "auto",
    position: "relative",
  },
}));

export default function GameSelectionScreen() {
  const styles = useStyles();

  return (
    <Grid container component="main" direction="row" justifyContent="space-between">
      <Grid
        item
        container
        direction="row"
        xs={12}
        sm={9}
        md={9}
        className={styles.root}
      >
        {Object.entries(gameData).map(([key, game]) => {
          return (
            <Grid item key={key}>
              <GameCard
                name={game.name}
                description={game.description}
                image={game.imageLocation}
                gameKey={key}
              />
            </Grid>
          );
        })}
      </Grid>
      <Grid item xs={false} sm={3} md={3} component={Paper}>
        <Chat />
      </Grid>
    </Grid>
  );
}
