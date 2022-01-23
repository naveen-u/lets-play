import React from "react";
import { useRecoilValue } from "recoil";
import Alert from '@mui/material/Alert';
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from '@mui/material/Skeleton';
import StarsIcon from "@mui/icons-material/Stars";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import makeStyles from '@mui/styles/makeStyles';

import { userIdState } from "../../../stores/gameDataStore";
import { IPlayer, Teams } from "../domain";
import UserAvatar from "../../../UserAvatar";

interface ITeamCardProps {
  socket: SocketIOClient.Socket;
  team: Teams;
  currentTeam: Teams;
  list: IPlayer[];
  allowReady: boolean;
  ready: boolean;
  percentOfMembers: number;
  spymaster: IPlayer | null;
}

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 275,
    maxWidth: 275,
    minHeight: 200,
    wordWrap: "break-word",
  },
  listItem: {
    padding: theme.spacing(1, 0),
  },
  username: {
    width: 175,
  },
  buttons: {
    margin: theme.spacing(1),
  },
  readyBadge: {
    color: "lime",
  },
}));

const TeamCard = (props: ITeamCardProps) => {
  const classes = useStyles();

  const userId = useRecoilValue(userIdState);

  const color = props.team === Teams.RED ? "Crimson" : "SteelBlue";

  const themeColor = props.team === Teams.RED ? "secondary" : "primary";

  const handleJoin = () => {
    props.socket.emit("join_team", props.team);
  };

  const handleLeave = () => {
    props.socket.emit("join_team", Teams.NEUTRAL);
  };

  const handleSpymaster = () => {
    props.socket.emit("set_spymaster");
  };

  const handleReady = () => {
    props.socket.emit("team_ready");
  };

  const userSkeleton = [];

  for (let i = props.list.length; i < 2; ++i) {
    userSkeleton.push(
      <Tooltip key={i} title="Each team needs a minimum of two players">
        <ListItem className={classes.listItem}>
          <ListItemAvatar>
            <Skeleton variant="circular">
              <Avatar />
            </Skeleton>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Skeleton width="100%">
                <Typography>.</Typography>
              </Skeleton>
            }
            className={classes.username}
          />
        </ListItem>
      </Tooltip>
    );
  }

  if (userSkeleton.length > 0) {
    userSkeleton.push(
      <ListItem key="warning" className={classes.listItem}>
        <Alert
          variant="outlined"
          color={props.team === Teams.BLUE ? "info" : "error"}
          severity="info"
        >
          Each team needs at least two players!
        </Alert>
      </ListItem>
    );
  }

  return (
    <Badge
      badgeContent={props.ready ? <CheckCircleIcon /> : ""}
      className={classes.readyBadge}
    >
      <Card
        className={classes.card}
        color="white"
        raised
        variant={props.team !== Teams.NEUTRAL ? "outlined" : "elevation"}
        style={{ borderColor: color }}
      >
        <CardContent>
          <LinearProgress
            variant="determinate"
            value={props.percentOfMembers}
            color={themeColor}
          />
          <List>
            {props.spymaster != null ? (
              <>
                <ListItem className={classes.listItem}>
                  <ListItemAvatar>
                    <UserAvatar
                      username={props.spymaster.user}
                      userId={props.spymaster.id}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={props.spymaster.user}
                    secondary="Spymaster"
                    className={classes.username}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              </>
            ) : (
              <>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyItems="center"
                  justifyContent="center"
                  width="100%"
                >
                  <Button
                    variant="text"
                    color={themeColor}
                    size="large"
                    startIcon={<StarsIcon />}
                    onClick={handleSpymaster}
                    className={classes.buttons}
                    disabled={props.team !== props.currentTeam}
                  >
                    Become Spymaster
                  </Button>
                </Box>
              </>
            )}
            <Divider component="li" variant="middle" />
            {props.list.map((user, i) => {
              return props.spymaster?.id !== user.id ? (
                <ListItem key={i} className={classes.listItem}>
                  <ListItemAvatar key={i}>
                    <UserAvatar username={user.user} userId={user.id} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.user}
                    className={classes.username}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </ListItem>
              ) : (
                ""
              );
            })}
            {userSkeleton}
          </List>
        </CardContent>
        <CardActions>
          {props.currentTeam !== props.team ? (
            <Button
              type="button"
              fullWidth
              variant="contained"
              color={themeColor}
              onClick={handleJoin}
              disabled={props.percentOfMembers === 100}
            >
              Join Team
            </Button>
          ) : (
            <Button
              type="button"
              fullWidth
              variant="outlined"
              color={themeColor}
              onClick={handleLeave}
            >
              Leave Team
            </Button>
          )}
          {props.spymaster?.id === userId && props.allowReady ? (
            <Tooltip title="Click when your team is ready">
              <Button
                type="button"
                fullWidth
                variant="contained"
                color={themeColor}
                onClick={handleReady}
              >
                {`${props.ready ? "Not " : ""}Ready`}
              </Button>
            </Tooltip>
          ) : (
            <></>
          )}
        </CardActions>
      </Card>
    </Badge>
  );
};

export default TeamCard;
