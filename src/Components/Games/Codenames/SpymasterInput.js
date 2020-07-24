import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import NumberPicker from './NumberPicker';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

const SpymasterInput = (props) => {
  const classes = useStyles();

  const [clue, setClue] = useState('');
  const [clueNumber, setClueNumber] = useState(1);
  const [clueError, setClueError] = useState('');

  const changeClue = (event) => {
    if (/^[a-z]*$/i.test(event.target.value)) {
      setClue(event.target.value);
      setClueError('');
    }
    else {
      setClueError('The clue has to be a single word');
    }
  }

  const sendClue = () => {
    if (clue === '') {
      setClueError('You can\'t not give a clue!');
      return
    }
    const data = {}
    data['clue'] = clue
    data['number'] = clueNumber
    props.socket.emit('clue', data);
  }

  return(
    <Grid item>
      <form noValidate autoComplete="off" >
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
          className={classes.margin}
        />
        <Button
          variant="contained"
          onClick={sendClue}
          color={props.themeColor}
          className={classes.margin}
        >
          Submit
        </Button>
      </form>
    </Grid>
  );
}

export default SpymasterInput;