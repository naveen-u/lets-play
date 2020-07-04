import React from 'react';
import { useHistory } from "react-router-dom";
import IconButton from '@material-ui/core/IconButton';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Tooltip from '@material-ui/core/Tooltip';
import { postSession } from '../../Utlis';

const LeaveRoom = (props) => {
  let history = useHistory();

  const leaveRoom = () => {
    props.socket.emit('leave_room');
    props.socket.on('left_room', () => {
      history.push('/');
    });
  }

  return (
    <Tooltip title="Leave room">
      <IconButton
        edge="end"
        aria-label="leave room"
        aria-haspopup="true"
        color="primary"
        onClick={leaveRoom}
      >
          <MeetingRoomIcon />
      </IconButton>
    </Tooltip>
  )
}

export default LeaveRoom;