import React from "react";
import { useHistory } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import Tooltip from "@mui/material/Tooltip";
import { postSession } from "../../Utils";

const LeaveRoom = () => {
  let history = useHistory();

  const leaveRoom = () => {
    postSession({
      successCallback: () => {
        history.push("/");
      },
    });
  };

  return (
    <Tooltip title="Leave room">
      <IconButton
        edge="end"
        aria-label="leave room"
        aria-haspopup="true"
        color="primary"
        onClick={leaveRoom}
        size="large">
        <MeetingRoomIcon />
      </IconButton>
    </Tooltip>
  );
};

export default LeaveRoom;
