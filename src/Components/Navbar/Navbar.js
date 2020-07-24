import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Skeleton from '@material-ui/lab/Skeleton';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import LeaveRoom from './LeaveRoom';
import Share from './Share';
import { Avatar } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'flex',
    alignItems: 'center'
  },
  divider: {
    margin: theme.spacing(1, 2, 1, 3),
  },
}));

const Navbar = (props) => {
  const classes = useStyles();

  return (
      <AppBar position="sticky" color="default">
        <Toolbar variant="dense">
          <Typography variant="subtitle1">Let's Play!</Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>

            <Share room={props.room} />

            <Divider orientation="vertical" flexItem className={classes.divider}/>

            <LeaveRoom />

            <Divider orientation="vertical" flexItem className={classes.divider}/>

            {props.userId ?
              <Tooltip title={props.username}>
                <Avatar src={`https://api.adorable.io/avatars/50/${props.userId}.png`} />
              </Tooltip>
              : <Skeleton variant="circle"><Avatar /></Skeleton>
            }

          </div>
        </Toolbar>
      </AppBar>
  );
}

export default Navbar;
