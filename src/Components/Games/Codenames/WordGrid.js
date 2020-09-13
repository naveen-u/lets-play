import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  wordBox: {
    textAlign: "center",
  },
  word: {
    textAlign: "center",
    wordWrap: "break-word",
    width: "100%",
  },
  wordRow: {
    display: "flex",
    textAlign: "center",
  },
  grid: {
    width: "100%",
    height: "100%",
  },
  paper: {
    height: 80,
    margin: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    wordWrap: "break-word",
    opacity: (props) => (props.gameOver ? 0.6 : 1),
  },
  clickable: {
    "&:hover": {
      cursor: (props) => (props.playerTurn ? "pointer" : ""),
      position: "relative",
      zIndex: (props) => (props.playerTurn ? 2 : ""),
      boxShadow: (props) => (props.playerTurn ? "0px 0px 5px 5px #000000" : ""),
    },
  },
  notch: {
    width: "50%",
    borderRadius: "10px",
    height: "16px",
    display: "block",
    position: "absolute",
    bottom: 10,
  },
  B: {
    backgroundColor: "DeepSkyBlue",
  },
  R: {
    backgroundColor: "FireBrick",
  },
  N: {
    backgroundColor: "Beige",
  },
  A: {
    backgroundColor: "Black",
  },
}));

const WordGrid = (props) => {
  const classes = useStyles(props);

  const handleClick = (i) => {
    props.socket.emit("word_click", i);
  };

  const generateOnClickMethod = (i, j) => {
    if (
      props.playerTurn &&
      !["R", "B", "N", "A"].includes(props.words[i * 5 + j])
    ) {
      return () => handleClick(i * 5 + j);
    }
  };

  const wordRows = [];

  for (let i = 0; i < 5; ++i) {
    const wordRow = [];
    for (let j = 0; j < 5; ++j) {
      wordRow.push(
        <Grid
          item
          xs={2}
          key={i * 5 + j}
          className={classes.wordBox}
          onClick={generateOnClickMethod(i, j)}
        >
          <Paper
            square
            className={`${classes.paper} ${
              ["R", "B", "N", "A"].includes(props.words[i * 5 + j])
                ? classes[props.words[i * 5 + j]]
                : classes.clickable
            }`}
            elevation={3}
          >
            {["R", "B", "N", "A"].includes(props.words[i * 5 + j]) ? (
              ""
            ) : (
              <Typography className={classes.word} variant="body2">
                {props.words[i * 5 + j]}
              </Typography>
            )}
            {props.isSpymaster ? (
              <span
                className={`${classes.notch} ${classes[props.grid[i * 5 + j]]}`}
              />
            ) : (
              ""
            )}
          </Paper>
        </Grid>
      );
    }
    wordRows.push(
      <Grid container key={`row${i}`} justify="center" alignItems="center">
        {wordRow}
      </Grid>
    );
  }

  return (
    <Grid item container alignItems="center" justify="center">
      {wordRows}
    </Grid>
  );
};

export default WordGrid;
