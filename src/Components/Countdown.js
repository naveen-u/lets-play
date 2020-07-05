import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import io from 'socket.io-client';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Chat from './Chat';
import Navbar from './Navbar/Navbar';
import { getSession } from '../Utlis';

const socket = io('127.0.0.1:5000');

const useStyles = makeStyles((theme) => ({
    image: {
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    paper2: {
      margin: theme.spacing(1),
      padding: theme.spacing(1),
      display: 'flex',
      width: '50%',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(2),
      backgroundColor: theme.palette.text.secondary,
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

const Countdown = (props) => {
  const classes = useStyles();
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');

  let history = useHistory();
  
  useEffect(() => {
    
    const successCallback = (statusCode, data) => {    
      setRoom(data.room);
      setUsername(data.user);
    }
    const failureCallback = () => {
      history.push('/');
    }
    getSession(successCallback, failureCallback);
  }, []);

  return (
    <div>
      <CssBaseline />    
      <Navbar room={room} username={username} />
      <Grid container component="main">
        <Grid item xs={12} sm={8} md={9} className={classes.image} />
        <Grid item xs={false} sm={4} md={3} component={Paper}>
          <Box className={classes.paper}>
            <Chat 
              username={username} 
            />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

export default Countdown;
