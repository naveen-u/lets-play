import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Skeleton from "@material-ui/lab/Skeleton";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import { Teams } from "../domain";
import { playerListState } from "../store";
import { useRecoilValue } from "recoil";

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 275,
    maxWidth: 275,
    minHeight: 200,
    margin: theme.spacing(2),
    wordWrap: "break-word",
  },
  listItem: {
    padding: theme.spacing(1),
  },
  avatar: {
    justifyItems: "center",
  },
  username: {
    width: 175,
  },
  buttons: {
    margin: theme.spacing(1),
  },
}));

const PlayerList = () => {
  const classes = useStyles();
  const playerList = useRecoilValue(playerListState);

  const userSkeleton = [];

  for (let i = playerList.length; i < 4; ++i) {
    userSkeleton.push(
      <ListItem key={i} className={classes.listItem} alignItems="center">
        <Tooltip title="This game requires a minimum of four players">
          <Skeleton variant="circle">
            <Avatar />
          </Skeleton>
        </Tooltip>
      </ListItem>
    );
  }

  return (
    <List>
      {playerList.map((user, i) => {
        return (
          <ListItem key={i} className={classes.listItem} alignItems="center">
            <Tooltip title={user.user}>
              <Badge
                color={user.team === Teams.RED ? "secondary" : "primary"}
                overlap="circle"
                badgeContent=" "
                invisible={user.team === Teams.NEUTRAL}
              >
                <Avatar
                  alt={user.user}
                  src={`https://api.adorable.io/avatars/50/${user.id}.png`}
                />
              </Badge>
            </Tooltip>
          </ListItem>
        );
      })}
      {userSkeleton}
    </List>
  );
};

export default PlayerList;
