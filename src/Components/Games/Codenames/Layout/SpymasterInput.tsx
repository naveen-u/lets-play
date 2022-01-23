import React, { useState } from "react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import makeStyles from '@mui/styles/makeStyles';

import NumberPicker from "./NumberPicker";

interface IClue {
  clue: string;
  number: number;
}

interface ISpymasterInputProps {
  words: string[];
  socket: SocketIOClient.Socket;
  themeColor: TThemeColor;
  maxNum: number;
}

type TThemeColor = "primary" | "secondary";

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

const SpymasterInput = (props: ISpymasterInputProps) => {
  const classes = useStyles();

  const [clue, setClue] = useState("");
  const [clueNumber, setClueNumber] = useState(1);
  const [clueError, setClueError] = useState("");

  const changeClue = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (/^[a-z]*$/i.test(event.target.value)) {
      setClue(event.target.value);
      setClueError("");
    } else {
      setClueError("The clue has to be a single word");
    }
  };

  const sendClue = () => {
    if (clue === "") {
      setClueError("You can't not give a clue!");
      return;
    }
    const isSubstring = (word: string) => {
      if (["R", "B", "N", "A"].includes(word)) {
        return false;
      }
      if (clue.toLowerCase().includes(word.toLowerCase())) {
        setClueError("The clue cannot contain any codewords!");
        return true;
      }
      return false;
    };
    if (props.words.some(isSubstring)) {
      return;
    }
    const data = {} as IClue;
    data["clue"] = clue;
    data["number"] = clueNumber;
    props.socket.emit("clue", data);
  };

  return (
    <Grid item>
      <TextField
        id="clue"
        label="Clue Word"
        variant="outlined"
        color={props.themeColor}
        value={clue}
        required
        error={clueError !== ""}
        helperText={clueError}
        onChange={changeClue}
        className={classes.margin}
      />
      <NumberPicker
        number={clueNumber}
        setNumber={setClueNumber}
        maxNum={props.maxNum}
      />
      <Button
        variant="contained"
        onClick={sendClue}
        color={props.themeColor}
        className={classes.margin}
      >
        Submit
      </Button>
    </Grid>
  );
};

export default SpymasterInput;
