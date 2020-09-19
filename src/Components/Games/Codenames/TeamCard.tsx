import React, { SetStateAction } from "react";
import { useRecoilValue } from "recoil";
import Alert from "@material-ui/lab/Alert";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import Divider from "@material-ui/core/Divider";
import LinearProgress from "@material-ui/core/LinearProgress";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Skeleton from "@material-ui/lab/Skeleton";
import StarsIcon from "@material-ui/icons/Stars";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

import { userIdState } from "../../store";
import { IPlayer, Teams } from "./domain";

interface ITeamCardProps {
  socket: SocketIOClient.Socket;
  team: Teams;
  currentTeam: Teams;
  setCurrentTeam: React.Dispatch<SetStateAction<Teams>>;
  list: IPlayer[];
  allowReady: boolean;
  ready: boolean;
  percentOfMembers: number;
  spymaster: IPlayer | undefined;
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
    props.setCurrentTeam(props.team);
  };

  const handleLeave = () => {
    props.socket.emit("join_team", Teams.NEUTRAL);
    props.setCurrentTeam(Teams.NEUTRAL);
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
            <Skeleton variant="circle">
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
            {props.spymaster !== undefined ? (
              <>
                <ListItem className={classes.listItem}>
                  <ListItemAvatar>
                    <Avatar
                      alt={props.spymaster.user}
                      src={`https://api.adorable.io/avatars/50/${props.spymaster.id}.png`}
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
                    <Avatar
                      alt={user.user}
                      src={`https://api.adorable.io/avatars/50/${user.id}.png`}
                    />
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
