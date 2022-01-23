import React from "react";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';

type TColors = "red" | "blue" | "beige" | "black";

const useStyles = makeStyles((theme) => ({
  text: {
    margin: theme.spacing(2, 3),
  },
  bold: {
    fontWeight: "bold",
  },
  box: {
    display: "inline-block",
    height: theme.typography.body2.fontSize,
    width: theme.typography.body2.fontSize,
    clear: "both",
  },
  red: {
    backgroundColor: "FireBrick",
  },
  blue: {
    backgroundColor: "DeepSkyBlue",
  },
  beige: {
    backgroundColor: "Beige",
  },
  black: {
    backgroundColor: "Black",
  },
}));

function InstructionText() {
  const classes = useStyles();

  return (
    <Typography className={classes.text} align="justify" variant="body2">
      <Text />
    </Typography>
  );
}

function Text() {
  return (
    <>
      Codenames is a game of guessing which codenames (i.e., words) in a set are
      related to a hint-word given by another player.
      <br />
      <br />
      Players split into two teams: red <TinyBox color="red" /> and blue{" "}
      <TinyBox color="blue" />. One player of each team is selected as the
      team's spymaster; the others are field operatives.
      <br />
      <br />
      Twenty-five Codename cards, each bearing a word, are laid out in a 5×5
      rectangular grid, in random order. A number of these words represent red
      agents <TinyBox color="red" />, a number represent blue agents{" "}
      <TinyBox color="blue" />, one represents an assassin{" "}
      <TinyBox color="black" />, and the others represent innocent bystanders{" "}
      <TinyBox color="beige" />.<br />
      <br />
      The teams' spymasters are given a randomly-generated map showing a 5×5
      grid of 25 squares of various colors, each corresponding to one of the
      code name cards on the table. Teams take turns. On each turn, the
      appropriate spymaster gives a hint about the words on the respective
      cards. Each hint may only consist of one single word and a number. The
      spymaster gives a hint that is related to as many of the words on his/her
      own agents' cards as possible, but not to any others – lest they
      accidentally lead their team to choose a card representing an innocent
      bystander, an opposing agent, or the assassin.
      <br />
      <br />
      The hint's word can be chosen freely, as long as it is not (and does not
      contain) any of the words on the code name cards still showing at that
      time. Code name cards are covered as guesses are made.
      <br />
      <br />
      The hint's number tells the field operatives how many words in the grid
      are related to the word of the clue. It also determines the maximum number
      of guesses the field operatives may make on that turn, which is the hint's
      number plus one. Field may also end their turn voluntarily (pass) at any
      point.
      <br />
      <br />
      After a spymaster gives the hint with its word and number, their field
      operatives make guesses about which code name cards bear words related to
      the hint and point them out, one at a time. When a code name card is
      clicked, that card is replaced with a color denoting the type of card —{" "}
      <TinyBox color="blue" /> for a blue agent, <TinyBox color="red" /> for a
      red agent, <TinyBox color="beige" /> beige for an innocent bystander, or{" "}
      <TinyBox color="black" /> for the assassin. If the assassin is clicked,
      the game ends immediately, with the team who identified him losing. If an
      agent of the other team is pointed out, the turn ends immediately, and
      that other team is also one agent closer to winning. If an innocent
      bystander is pointed out, the turn simply ends.
      <br />
      <br />
      The game ends when all of one team's agents are identified (winning the
      game for that team), or when one team has identified the assassin (losing
      the game).
    </>
  );
}

function TinyBox(props: { color: TColors }) {
  const classes = useStyles();
  return <div className={`${classes.box} ${classes[props.color]}`} />;
}

export default InstructionText;
