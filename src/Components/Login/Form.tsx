import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';

import { postSession } from "../../Utils/Commons";
import { IPostResponse, IRequestOptions, TRequestMethods } from "../domain";

const useStyles = makeStyles((theme) => ({
  paper2: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    display: "flex",
    width: "50%",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3),
  },
  grid: {
    margin: theme.spacing(3, 0),
    width: "100%",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    alignItems: "center",
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
    const queryRoom = searchParams.get("room") || "";
    setRoom(queryRoom);
  }, []);

  const handleKeyPressOnNameField = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      if (room !== "") {
        joinRoom();
      } else {
        newGame();
      }
    }
  };

  const handleKeyPressOnRoomField = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      joinRoom();
    }
  };

  const checkName = () => {
    if (name === "") {
      setNameError("Please enter a display nick!");
      return false;
    }
    return true;
  };

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
  };

  const joinRoom = () => {
    setNameError("");
    setRoomError("");

    if (!checkNameAndRoom()) {
      return;
    }

    const requestOptions: IRequestOptions = {
      method: "POST" as TRequestMethods,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: name, room: room }),
    };

    const successCallback = () => {
      history.push("/play");
    };

    const failureCallback = (statusCode: number, data: string) => {
      if (statusCode === 400) {
        const errorData = JSON.parse(data);
        if (errorData.error === "user") {
          setNameError(
            "Someone's already using that name in the room. Please pick another one!"
          );
        } else if (errorData.error === "room") {
          setRoomError("That room does not exist!");
        }
      }
    };

    postSession({
      requestOptions: requestOptions,
      successCallback: successCallback,
      failureCallback: failureCallback,
    });
  };

  const newGame = () => {
    setNameError("");
    setRoomError("");

    if (!checkName()) {
      return;
    }

    const requestOptions = {
      method: "POST" as TRequestMethods,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: name }),
    };

    const successCallback = (
      statusCode: number,
      data: IPostResponse | null
    ) => {
      if (data != null) {
        setRoom(data.room);
        history.push("/play");
      }
    };

    postSession({
      requestOptions: requestOptions,
      successCallback: successCallback,
    });
  };

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
        value={name || ""}
        helperText={nameError}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyPress={handleKeyPressOnNameField}
      />
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="center"
        className={classes.grid}
      >
        <Grid item xs className={classes.paper2}>
          <Typography>Join a game room</Typography>

          <TextField
            error={roomError !== ""}
            variant="outlined"
            margin="normal"
            value={room || ""}
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
          <Typography align="center">
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
};

export default Form;
