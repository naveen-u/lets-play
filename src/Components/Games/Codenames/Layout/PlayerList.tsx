import React from "react";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Skeleton from '@mui/material/Skeleton';
import Tooltip from "@mui/material/Tooltip";
import makeStyles from '@mui/styles/makeStyles';
import { Teams } from "../domain";
import { playerListState } from "../store";
import { useRecoilValue } from "recoil";
import UserAvatar from "../../../UserAvatar";

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
          <Skeleton variant="circular">
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
                overlap="circular"
                badgeContent=" "
                invisible={user.team === Teams.NEUTRAL}
              >
                <UserAvatar username={user.user} userId={user.id} />
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
