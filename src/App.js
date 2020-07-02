import React, { useState, useEffect } from 'react';
import './App.css';

import Entry from './Components/Entry';
import Countdown from './Components/Countdown';
import darkTheme from './Themes/DarkTheme';
import { MuiThemeProvider } from '@material-ui/core';

function App() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [nameError, setNameError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const searchParams = new URLSearchParams(window.location.search);
    const queryRoom = searchParams.get('room') || '';
    setRoom(queryRoom);
    
    fetch('/session', requestOptions)
      .then(response => {
        const statusCode = response.status;
        const data = response.text();
        return Promise.all([statusCode, data]);
      })
      .then(([statusCode, data]) => {
        if (statusCode === 401) {
          return;
        }
        else if (data.room !== '' && data.user !== '') {
          console.log(statusCode);
          console.log(data);
          data = JSON.parse(data);
          setName(data.user);
          setRoom(data.room);
          console.log("Already logged in. User: " + data.user + " and Room: " + data.room);
          setConnected(true); 
          return;
        }
      });
    }, []);

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
    fetch('/session', requestOptions)
      .then(response => {
        const statusCode = response.status;
        const data = response.text();
        return Promise.all([statusCode, data]);
      })
      .then(([statusCode, data]) => {
        if (statusCode === 200 || statusCode === 204) {
          const roomData = JSON.parse(data);
          setRoom(roomData.room);
          console.log("Joined room: " + roomData.room);
          setConnected(true);
        }
        else {
          console.log('ERROR: recieved response ', statusCode, data)
        }
      });
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
    fetch('/session', requestOptions)
      .then(response => {
        const statusCode = response.status;
        const data = response.text();
        return Promise.all([statusCode, data]);
      })
      .then(([statusCode, data]) => {
        console.log(statusCode)
        console.log(data)
        if (statusCode === 200 || statusCode === 204) {
          console.log("Joined room: " + room);
          setConnected(true);
        }
        else if (statusCode === 400) {
          const errorData = JSON.parse(data);
          if (errorData.error === 'user') {
            setNameError("Someone's already using that name in the room. Please pick another one!");
          }
          else if (errorData.error === 'room') {
            setRoomError('That room does not exist!');
          }
        }
      });
  }

  const quitGame = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: ''

    };
    fetch('/session', requestOptions)
      .then(response => {
        const status = response.status;
        if (status === 204) {
          setRoom('');
          setConnected(false);
        }
        else {
          console.log("There was an error while logging out: ", response);
        }
      })
  }

  if (connected) {
    return (
      <MuiThemeProvider theme={darkTheme}>
        <div className="App">
          <Countdown
            username={name}
            room={room}
            quitGame={quitGame}
          />
        </div>
      </MuiThemeProvider>
    );
  }
  else {
    return (
      <MuiThemeProvider theme={darkTheme}>
        <div className="App">
          <Entry
            setName={setName}
            newGame={newGame}
            name={name}
            room={room}
            setRoom={setRoom}
            joinRoom={joinRoom}
            nameError={nameError}
            roomError={roomError}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
