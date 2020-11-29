import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Tooltip from "@material-ui/core/Tooltip";
import Skeleton from "@material-ui/lab/Skeleton";

export default function UserAvatar(props: {
  username: string;
  userId: string;
}) {
  const { username, userId } = props;
  return (
    <Tooltip title={username}>
      {userId ? (
        <Avatar
          alt={username}
          src={`https://robohash.org/${userId}.png?set=set4&size=50x50`}
        />
      ) : (
        <Skeleton variant="circle">
          <Avatar />
        </Skeleton>
      )}
    </Tooltip>
  );
}
