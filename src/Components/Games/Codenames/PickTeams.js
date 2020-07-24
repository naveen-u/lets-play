import React, { useState, useEffect } from 'react';
import Alert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import TeamCard from './TeamCard';
import { TEAMS } from './Constants';

const useStyles = makeStyles((theme) => ({
  headerText: {
    margin: theme.spacing(3,0),
  },
  teamImbalancedAlert: {
    margin: theme.spacing(3),
    maxWidth: 662,
  }
}));

const PickTeams = (props) => {
  const classes = useStyles();

  useEffect(() => {
    // join_team signifies that a user has joined a team. Update list of players.
    props.socket.on('join_team', data => {
      if (data.team === TEAMS.NEUTRAL) {
        props.setBlueMaster(blueMaster => blueMaster?.id === data.id ? '' : blueMaster);
        props.setRedMaster(redMaster => redMaster?.id === data.id ? '' : redMaster);
      }
      else if (data.team === TEAMS.BLUE) {
        props.setRedMaster(redMaster => redMaster?.id === data.id ? '' : redMaster);
      }
      else if (data.team === TEAMS.RED) {
        props.setBlueMaster(blueMaster => blueMaster?.id === data.id ? '' : blueMaster);
      }
      props.setPlayerList(list => list.filter(user => user.id !== data.id));
      props.setPlayerList(list => list.concat(data));
    });

    // set a user as spymaster
    props.socket.on('set_spymaster', data => {
      if (data.team === TEAMS.RED) {
        props.setRedMaster(data);
      }
      else if (data.team === TEAMS.BLUE) {
        props.setBlueMaster(data);
      }
    });
  }, [props.socket]);

  const blueTeam = props.playerList.filter(player => player.team === TEAMS.BLUE);
  const redTeam = props.playerList.filter(player => player.team === TEAMS.RED);
  const allowReady = Math.abs(blueTeam.length - redTeam.length) <= 1 && blueTeam.length >= 2 && redTeam.length >= 2

  return(
      <Box height="100%" width="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Typography variant="overline" align="center" color="textSecondary" className={classes.headerText}>
          Split into two teams.
        </Typography>
        <Box display="flex" justifyContent="center">
          <Grid container justify="center" spacing={4} alignItems="center">
            <Grid item>

              <TeamCard 
              team={TEAMS.BLUE} 
              list={blueTeam} 
              spymaster={props.blueMaster}
              percentOfMembers={Math.min((blueTeam.length)/(props.playerList.length)*200,100)}
              socket={props.socket}
              currentTeam={props.currentTeam}
              setCurrentTeam={props.setCurrentTeam}
              userId={props.userId}
              ready={props.blueTeamReady}
              allowReady={allowReady}
              />

            </Grid>
            <Grid item>

              <TeamCard
              team={TEAMS.RED}
              list={redTeam}
              spymaster={props.redMaster}
              percentOfMembers={Math.min((redTeam.length)/(props.playerList.length)*200, 100)}
              socket={props.socket}
              currentTeam={props.currentTeam}
              setCurrentTeam={props.setCurrentTeam}
              userId={props.userId}
              ready={props.redTeamReady}
              allowReady={allowReady}
              />

            </Grid>
          </Grid>
        </Box>
        {blueTeam.length > redTeam.length + 1 ?
        <Alert 
          variant="outlined"
          severity="warning"
          className={classes.teamImbalancedAlert}
        >
          Blue team has way too many players. Someone's gotta join the Reds.
        </Alert>
        : redTeam.length > blueTeam.length + 1 ?
        <Alert 
          variant="outlined"
          severity="warning"
          className={classes.teamImbalancedAlert}
        >
          Red team has way too many players. Someone's gotta join the blues.
        </Alert> : <></>
        }
      </Box>
  );
}

export default PickTeams;