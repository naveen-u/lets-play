import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';
import MuiAlert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';


const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'flex',
  },
  menuItem: {
    borderRadius: '16px',
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.primary.main,
  },
  copyButton: {
    backgroundColor: theme.palette.background.default,
  },
  divider: {
    margin: theme.spacing(1, 2, 1, 3),
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const Navbar = (props) => {
  const classes = useStyles();
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [severity, setSeverity] = useState('');

  const copyRoomCode = () => {
    navigator.clipboard.writeText(props.room)
      .then(() => {
        setToastMessage('Room code copied to clipboard!');
        setSeverity("success");
        setOpenToast(true);
      })
      .catch(err => {
        // This can happen if the user denies clipboard permissions
        setToastMessage('Could not copy!');
        setSeverity("error");
        setOpenToast(true);
        console.error('Could not copy text: ', err);
      });
  };

  const copyURL = () => {
    navigator.clipboard.writeText(window.location.origin + "?room=" + props.room)
      .then(() => {
        setToastMessage('URL copied to clipboard!');
        setSeverity("success");
        setOpenToast(true);
      })
      .catch(err => {
        // This can happen if the user denies clipboard permissions
        setToastMessage('Could not copy!');
        setSeverity("error");
        setOpenToast(true);
        console.error('Could not copy text: ', err);
      });
  }

  const handleClose = () => {
    setOpenToast(false);
  }

  function TransitionLeft(props) {
    return <Slide {...props} direction="left" />;
  }

  const leaveRoom = () => {
    props.setInRoom(false);
  }

  return (
      <AppBar position="sticky" color="transparent">
        <Toolbar variant="dense">
          <Typography variant="subtitle1">Let's Play Countdown!</Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <Box border={1} borderColor="primary.main" className={classes.menuItem}>
              <Tooltip title="Copy room code">
                <Button onClick={copyRoomCode} size="small" className={classes.copyButton}>
                  Code
                </Button>
              </Tooltip>
              <Avatar className={classes.avatar}>
                <GroupAddIcon/>
              </Avatar>
              <Tooltip title="Copy URL">
                <Button onClick={copyURL} size="small" className={classes.copyButton}>
                  URL
                </Button>
              </Tooltip>
            </Box>
            <Snackbar
              anchorOrigin={ {'vertical':'top', 'horizontal': 'right'} }
              open={openToast}
              autoHideDuration={2000}
              onClose={handleClose}
              key='topright'
              TransitionComponent={TransitionLeft}
            >
              <MuiAlert elevation={6} variant="filled" severity={severity}>
                {toastMessage}
              </MuiAlert>
            </Snackbar>
            <Divider orientation="vertical" flexItem className={classes.divider}/>
            <Tooltip title="Leave room">
              <IconButton
                edge="end"
                aria-label="leave room"
                aria-haspopup="true"
                color="primary"
                onClick={leaveRoom}
              >
                <MeetingRoomIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem className={classes.divider}/>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              color="primary"
            >
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
  );
}

export default Navbar;
