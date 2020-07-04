import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { postSession } from '../../Utlis/Commons';

const useStyles = makeStyles((theme) => ({
  paper2: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    display: 'flex',
    width: '50%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3),
  },
  grid: {
    margin: theme.spacing(3, 0),
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    alignItems: 'center',
  },
}));

const Form = () => {
  const classes = useStyles();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [nameError, setNameError] = useState("");
  const [roomError, setRoomError] = useState("");

  let history = useHistory();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryRoom = searchParams.get('room') || '';
    setRoom(queryRoom);
  }, []);

  const handleKeyPressOnNameField = (event) => {
    if (event.key === 'Enter') {
      if (room !== "") {
        joinRoom();
      }
      else {
        newGame();
      }
    }
  };
  
  const handleKeyPressOnRoomField = (event) => {
    if (event.key === 'Enter') {
      joinRoom();
    }
  };

  const checkName = () => {
    if (name === "") {
      setNameError("Please enter a display nick!");
      return false;
    }
    return true;
  }

  const checkNameAndRoom = () => {
    let flag = true;
    if (room === "") {
      setRoomError("Please enter a room code!");
      flag = false;
    }
    if (!checkName()) {
      flag = false;
    }
    return flag;
  }

  const joinRoom = () => {
    setNameError("");
    setRoomError("");
    
    if (!checkNameAndRoom()) {
      return;
    }
  
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: name, room: room })
    };
  
    const successCallback = (statusCode, data) => {
      history.push('/play');
    }
  
    const failureCallback = (statusCode, data) => {
      if (statusCode === 400) {
        const errorData = JSON.parse(data);
        if (errorData.error === 'user') {
          setNameError("Someone's already using that name in the room. Please pick another one!");
        }
        else if (errorData.error === 'room') {
          setRoomError('That room does not exist!');
        }
      }
    }

    postSession({
        'requestOptions': requestOptions, 
        'successCallback': successCallback, 
        'failureCallback': failureCallback
      });
  }

  const newGame = () => {
    setNameError("");
    setRoomError("");
    
    if (!checkName()) {
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: name})
    };

    const successCallback = (statusCode, data) => {
      setRoom(data.room);
      history.push('/play');
    }

    const failureCallback = (statusCode, data) => {
      console.log('ERROR: recieved response ', statusCode, data)
    }
    
    postSession({
      'requestOptions': requestOptions, 
      'successCallback': successCallback, 
      'failureCallback': failureCallback
    });
  }
  
  return (
    <form className={classes.form} noValidate>
      <TextField
      error={nameError !== ""}
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="displayName"
      label="Display Name"
      id="displayName"
      autoComplete="off"
      value={name || ''}
      helperText={nameError}
      autoFocus
      onChange={(event) => setName(event.target.value)}
      onKeyPress={handleKeyPressOnNameField}
      />
      <Grid container direction="row" alignItems="center" justify="center" className={classes.grid}>
        <Grid item xs className={classes.paper2}>

          <Typography>
            Join a game room
          </Typography>

          <TextField
          error={roomError !== ""}
          variant="outlined"
          margin="normal"
          value={room || ''}
          required
          fullWidth
          id="room"
          label="Room Code"
          name="room"
          autoComplete="off"
          helperText={roomError}
          onChange={(event) => setRoom(event.target.value)}
          onKeyPress={handleKeyPressOnRoomField}
          />

          <Button
          type="button"
          fullWidth
          variant="outlined"
          color="primary"
          className={classes.submit}
          onClick={joinRoom}
          >
            Join
          </Button>

        </Grid>

        <Divider orientation="vertical" flexItem />

        <Grid item xs className={classes.paper2}>

          <Typography>
            Or create a new one and invite your friends
          </Typography>

          <Button
          type="button"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          onClick={newGame}
          >
          Start a new game   
          </Button>

        </Grid>
      </Grid>
    </form>
  );
}


export default Form;