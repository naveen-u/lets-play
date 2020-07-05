import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Messages from './Messages';
import ChatInput from './ChatInput';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

const socket = io('127.0.0.1:5000/chat', {autoConnect: false});

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    flexDirection: 'column',
  },
  container1: {
    marginTop: theme.spacing(2),
    height: '74vh',
    width: '100%',
    maxHeigt: '90%',
    overflowY: 'auto!important',
  },
  container2: {
    margin: theme.spacing(2, 1),
    padding: theme.spacing(2, 0),
    height: '10vh',
  },
  grow: {
    flexGrow: 1,
  },
}));

const Chat = (props) => {
  const [messages, setMessages] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    // Connect to the /chat namespace on component mount
    socket.connect();

    // Listen for messages from the server
    socket.on('chat_message', message => {
      setMessages(messages => (messages.concat(message)));
    });

    // Close socket (and leave room) when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendHandler = (message) => {
    const messageObject = {
      username: props.username,
      message
    };
    // Emit the message to the server
    socket.emit('chat_message', messageObject);
    messageObject.fromMe = true;
    addMessage(messageObject);
  }

  const addMessage = (message) => {
    // Append the message to the component state
    const messageList = messages.concat(message);
    setMessages(messageList);
  }

  return (
    <Box className={classes.root}>
      <Box className={classes.container1}>
        <Messages messages={messages} />
      </Box>
      <Box className={classes.container2}>
        <ChatInput onSend={sendHandler} />
      </Box>
    </Box>
  );
}

export default Chat;