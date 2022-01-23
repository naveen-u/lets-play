import React, { Suspense, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useHistory } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import Navbar from "./Navbar/Navbar";
import { getSession } from "../Utils";
import {
  usernameState,
  userIdState,
  roomIdState,
  SubscribeToStateChanges,
  roomAdminState,
  userListState,
  gameInProgressState,
} from "./stores/gameDataStore";
import { IGameState } from "./domain";
import GameSelectionScreen from "./GameSelectionScreen";
import gameData from "./Games/config";
import LoadingScreen from "./LoadingScreen";

const Play = () => {
  const setUsername = useSetRecoilState(usernameState);
  const setUserId = useSetRecoilState(userIdState);
  const setRoom = useSetRecoilState(roomIdState);
  const setRoomAdmin = useSetRecoilState(roomAdminState);
  const setUserList = useSetRecoilState(userListState);
  const [gameInProgress, setGameInProgress] = useRecoilState(
    gameInProgressState
  );
  const [
    GameComponent,
    setGameComponent,
  ] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  let history = useHistory();

  useEffect(() => {
    const successCallback = (statusCode: number, data: IGameState) => {
      data.username && setUsername(data.username);
      data.userId && setUserId(data.userId);
      data.roomId && setRoom(data.roomId);
      data.roomAdmin && setRoomAdmin(data.roomAdmin);
      data.userList && setUserList(data.userList);
      data.game ? setGameInProgress(data.game) : setGameInProgress("");
      setIsLoading(false);
    };
    const failureCallback = () => {
      history.push("/");
    };
    setIsLoading(true);
    getSession(successCallback, failureCallback);
  }, [
    history,
    setUsername,
    setUserId,
    setRoom,
    setRoomAdmin,
    setUserList,
    setGameInProgress,
  ]);

  useEffect(() => {
    setGameComponent(loadGame(gameInProgress));
  }, [gameInProgress]);

  return (
    <div>
      <CssBaseline />
      <SubscribeToStateChanges />
      <Navbar />
      {isLoading ? (
        <LoadingScreen />
      ) : gameInProgress && GameComponent ? (
        <Suspense fallback={<LoadingScreen />}>
          <GameComponent />
        </Suspense>
      ) : (
        <GameSelectionScreen />
      )}
    </div>
  );
};

function loadGame(name: string) {
  if (name && Object.keys(gameData).includes(name)) {
    const Component = React.lazy(
      () => import(`./Games/${gameData[name].importLocation}`)
    );
    return Component;
  }
  return null;
}

export default Play;
