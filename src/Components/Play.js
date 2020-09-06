import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import io from 'socket.io-client';

import CssBaseline from '@material-ui/core/CssBaseline';
import Codenames from './Games/Codenames'
import Navbar from './Navbar/Navbar';
import { getSession } from '../Utlis';

const socket = io('/', {autoConnect: false});

const Play = (props) => {
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [admin, setAdmin] = useState(false);

  let history = useHistory();
  
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('set_admin', data => {
      setAdmin(data);
    });

    const onBeforeUnload = (e) => {
      socket.emit('disconnecting');
    }

    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      socket.disconnect();
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    
    const successCallback = (statusCode, data) => {
      setRoom(data.room);
      setUsername(data.user);
      setUserId(data.id);
      if (data.admin != null) {
        setAdmin(data.admin);
      }
    }
    const failureCallback = () => {
      history.push('/');
    }
    getSession(successCallback, failureCallback);
  }, [history]);

  return (
    <div>
      <CssBaseline />    
      <Navbar room={room} username={username} userId={userId}/>

          <Codenames
            userId={userId}
            admin={admin}
          />

    </div>
  );
}

export default Play;
