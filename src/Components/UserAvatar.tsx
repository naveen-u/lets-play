import React from "react";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from '@mui/material/Skeleton';

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
        <Skeleton variant="circular">
          <Avatar />
        </Skeleton>
      )}
    </Tooltip>
  );
}
