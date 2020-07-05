import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar } from 'react-avataaars';
import LeaveRoom from './LeaveRoom';
import Share from './Share';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'flex',
  },
  divider: {
    margin: theme.spacing(1, 2, 1, 3),
  },
}));

const Navbar = (props) => {
  const classes = useStyles();

  return (
      <AppBar position="sticky" color="transparent">
        <Toolbar variant="dense">
          <Typography variant="subtitle1">Let's Play Countdown!</Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>

            <Share room={props.room} />

            <Divider orientation="vertical" flexItem className={classes.divider}/>

            <LeaveRoom />

            <Divider orientation="vertical" flexItem className={classes.divider}/>

            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              color="primary"
            >
              <Avatar options={ {"style":"circle" } } hash={'nesnesoubeawfawsfoubasc'} size="34px"/>
            </IconButton>
            
          </div>
        </Toolbar>
      </AppBar>
  );
}

export default Navbar;
