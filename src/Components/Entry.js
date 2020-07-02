import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import AlarmOutlined from '@material-ui/icons/AlarmOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import wallpaper from '../assets/wallpaper.jpg';

const useStyles = makeStyles((theme) => ({
    root: {
      height: '100vh',
    },
    image: {
      backgroundImage: `url(${wallpaper})`,
      backgroundRepeat: 'no-repeat',
      backgroundColor:
        theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    paper: {
      margin: theme.spacing(4, 4),
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
      backgroundColor: theme.palette.primary.main,
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

const Entry = (props) => {
  const classes = useStyles();

  const handleKeyPressOnNameField = (event) => {
    if (event.key === 'Enter') {
      if (props.room !== "") {
        props.joinRoom();
      }
      else {
        props.newGame();
      }
    }
  };

  const handleKeyPressOnRoomField = (event) => {
    if (event.key === 'Enter') {
      props.joinRoom();
    }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper}>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <AlarmOutlined />
          </Avatar>
          <form className={classes.form} noValidate>
            <TextField
            error={props.nameError !== ""}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="displayName"
            label="Display Name"
            id="displayName"
            autoComplete="off"
            value={props.name || ''}
            helperText={props.nameError}
            autoFocus
            onChange={(event) => props.setName(event.target.value)}
            onKeyPress={handleKeyPressOnNameField}
            />
            <Grid container direction="row" alignItems="center" justify="center" className={classes.grid}>
              <Grid item xs className={classes.paper2}>
                <Typography>
                  Join a game room
                </Typography>
                <TextField
                error={props.roomError !== ""}
                variant="outlined"
                margin="normal"
                value={props.room || ''}
                required
                fullWidth
                id="room"
                label="Room Code"
                name="room"
                autoComplete="off"
                helperText={props.roomError}
                onChange={(event) => props.setRoom(event.target.value)}
                onKeyPress={handleKeyPressOnRoomField}
                />
                <Button
                type="button"
                fullWidth
                variant="outlined"
                color="primary"
                className={classes.submit}
                onClick={props.joinRoom}
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
                onClick={props.newGame}
                >
                Start a new game   
                </Button>
              </Grid>
            </Grid>
          </form>
        </div>
        <Box mt={5}>
          <Typography variant="body2" color="textSecondary" align="center">
            {'Contribute at '}
            <Link color="inherit" href="https://github.com/naveen-u">
              github/naveen-u/countdown-app
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Entry;