import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';

import banner from "../../assets/logo.png";
import { getSession } from "../../Utils";
import Contribute from "./Contribute";
import Form from "./Form";
import Header from "./Header";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
  leftGrid: {
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  image: {
    maxHeight: "100%",
    maxWidth: "100%",
  },
  text: {
    width: "100%",
    position: "absolute",
    bottom: 100,
    overflowWrap: "break-word",
    fontFamily: "Monospace",
  },
  paper: {
    margin: theme.spacing(4, 4, 15, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const Login = () => {
  const classes = useStyles();
  let history = useHistory();

  useEffect(() => {
    // Checking if user is already logged in. If yes, redirect to room.
    const redirect = () => {
      history.push("/play");
    };
    getSession(redirect);
  }, [history]);

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.leftGrid}>
        <Box className={classes.imageContainer} width="100%" height="100vh">
          <img src={banner} alt="Let's Play!" className={classes.image} />
          <Typography variant="h5" align="center" className={classes.text}>
            Step 1: Create a room
            <br />
            Step 2: Invite friends
            <br />
            Step 3: Profit
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper}>
        <div className={classes.paper}>
          <Header />

          <Form />
        </div>

        <Contribute />
      </Grid>
    </Grid>
  );
};

export default Login;
