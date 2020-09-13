import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { useHistory } from "react-router-dom";

import CssBaseline from "@material-ui/core/CssBaseline";
import Codenames from "./Games/Codenames";
import Navbar from "./Navbar/Navbar";
import { getSession } from "../Utils";
import {
  usernameState,
  userIdState,
  roomIdState,
  SubscribeToStateChanges,
  roomAdminState,
  userListState,
} from "./store";
import { IGameState } from "./domain";

const Play = () => {
  const setUsername = useSetRecoilState(usernameState);
  const setUserId = useSetRecoilState(userIdState);
  const setRoom = useSetRecoilState(roomIdState);
  const setRoomAdmin = useSetRecoilState(roomAdminState);
  const setUserList = useSetRecoilState(userListState);

  let history = useHistory();

  useEffect(() => {
    const successCallback = (statusCode: number, data: IGameState) => {
      data.username && setUsername(data.username);
      data.userId && setUserId(data.userId);
      data.roomId && setRoom(data.roomId);
      data.roomAdmin && setRoomAdmin(data.roomAdmin);
      data.userList && setUserList(data.userList);
    };
    const failureCallback = () => {
      history.push("/");
    };
    getSession(successCallback, failureCallback);
  }, [history, setUsername, setUserId, setRoom, setRoomAdmin, setUserList]);

  return (
    <div>
      <CssBaseline />
      <SubscribeToStateChanges />
      <Navbar />
      <Codenames />
    </div>
  );
};

export default Play;
