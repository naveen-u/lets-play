import React, { useState, useEffect } from 'react';
import Chat from './Chat/Chat';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import openSocket from 'socket.io-client';
import Navbar from './Navbar';


const useStyles = makeStyles((theme) => ({
    image: {
      // backgroundImage: `url(${wallpaper})`,
      backgroundRepeat: 'no-repeat',
      // backgroundColor:
      //   theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
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
  const socket = openSocket('127.0.0.1:5000');
  const [inRoom, setInRoom] = useState(true);

  useEffect(() => {
    return (() => socket.close());
  });
  
  useEffect(() => {
    socket.emit('joinRoom', {'user':props.username, 'room':props.room});
  }, []);

  useEffect(() => {
    if (inRoom === false) {
      socket.emit('leaveRoom');
      socket.on('leftRoom', () => {
        console.log('Got disconnect!');
        props.quitGame();
      })
    }
  },[inRoom]);

  return (
    <div>
      <CssBaseline />    
      <Navbar room={props.room} username={props.username} setInRoom={setInRoom}/>
      <Grid container component="main">
        <Grid item xs={12} sm={8} md={9} className={classes.image} />
        <Grid item xs={false} sm={4} md={3} component={Paper}>
          <Box className={classes.paper}>
            <Chat 
              username={props.username} 
              socket={socket}  
            />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

export default Countdown;
