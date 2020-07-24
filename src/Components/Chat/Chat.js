import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import Box from '@material-ui/core/Box';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import Messages from './Messages';
import ChatInput from './ChatInput';

let socket = io('/chat', {autoConnect: false});

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    flexDirection: 'column',
  },
  container1: {
    marginTop: theme.spacing(2),
    height: teamChatEnabled => teamChatEnabled ? '66vh' : '73vh',
    width: '100%',
    maxHeight: '90%',
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
  toggleGroup: {
    width: '100%',
  },
  toggleButton: {
    width: '50%',
  }
}));

const Chat = (props) => {
  const [messages, setMessages] = useState([]);
  const [teamMessages, setTeamMessages] = useState([]);
  const [chatType, setChatType] = useState('global');

  useEffect(() => {
    if (typeof props.socket !== 'undefined' && props.socket !== null) {
      socket = props.socket;
    }
    // Connect to the /chat namespace on component mount
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for messages from the server
    socket.on('chat_message', message => {
      setMessages(messages => (messages.concat(message)));
    });

    // Close socket (and leave room) when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [props.socket]);

  useEffect(() => {
    if (typeof props.teamSocket !== 'undefined' && props.teamSocket !== null) {
      console.log('Setting up listener');
      props.teamSocket.on('chat_message', message => {
        console.log('Got team chat message');
        console.log(message);
        setTeamMessages(teamMessages => (teamMessages.concat(message)))
      });
    }
  }, [props.teamSocket]);

  const sendHandler = (message) => {
    const messageObject = {
      message
    };
    // Emit the message to the server
    socket.emit('chat_message', messageObject);
    messageObject.fromMe = true;
    addMessage(messageObject);
  }

  const sendTeamHandler = (message) => {
    const messageObject = {
      message
    };
    // Emit the message to the server
    props.teamSocket.emit('chat_message', messageObject);
    messageObject.fromMe = true;
    addTeamMessage(messageObject);
  }

  const addMessage = (message) => {
    // Append the message to the component state
    const messageList = messages.concat(message);
    setMessages(messageList);
  }

  const addTeamMessage = (message) => {
    // Append the message to the component state
    const messageList = teamMessages.concat(message);
    setTeamMessages(messageList);
  }

  const handleChatChange = (event, newValue) => {
    setChatType(newValue);
  };

  const teamChatEnabled = (typeof props.teamSocket !== 'undefined' && props.teamSocket !== null);

  const classes = useStyles(teamChatEnabled);

  return (
    <Box className={classes.root}>
      {chatType === 'global' ?
        <>
        <Box className={classes.container1}>
          <Messages messages={messages} />
        </Box>
        <Box className={classes.container2}>
          <ChatInput onSend={sendHandler} />
        </Box>
        </>
        : 
        <>
        <Box className={classes.container1}>
          <Messages messages={teamMessages} />
        </Box>
        <Box className={classes.container2}>
          <ChatInput onSend={sendTeamHandler} />
        </Box>
        </>
      }
      {teamChatEnabled ? 
        <ToggleButtonGroup
          value={chatType}
          exclusive
          onChange={handleChatChange}
          aria-label="chat type"
          className={classes.toggleGroup}
        >
          <ToggleButton value="global" aria-label="global chat" className={classes.toggleButton}>
            Global
          </ToggleButton>
          <ToggleButton value="team" aria-label="team chat" className={classes.toggleButton}>
            Team
          </ToggleButton>
        </ToggleButtonGroup>
        : ''
      }
    </Box>
  );
}

export default Chat;