import { useEffect } from "react";
import { atom, selector, useSetRecoilState } from "recoil";
import io from "socket.io-client";
import { IGameState, IUserData } from "./domain";

export const usernameState = atom<string>({
  key: "usernameState",
  default: "",
});

export const userIdState = atom<string>({
  key: "userIdState",
  default: "",
});

export const roomIdState = atom<string>({
  key: "roomIdState",
  default: "",
});

export const roomAdminState = atom<string>({
  key: "roomAdminState",
  default: "",
});

export const userListState = atom<IUserData[]>({
  key: "userListState",
  default: [],
});

export const gameInProgressState = atom<string>({
  key: "gameInProgressState",
  default: "",
});

export const isAdminState = selector<boolean>({
  key: "isAdminState",
  get: ({ get }) => {
    const currentUserId = get(userIdState);
    const roomAdminId = get(roomAdminState);
    return roomAdminId === currentUserId;
  },
});

const socket = io({ autoConnect: false });

export function SubscribeToStateChanges() {
  const setUsername = useSetRecoilState(usernameState);
  const setUserId = useSetRecoilState(userIdState);
  const setRoomId = useSetRecoilState(roomIdState);
  const setRoomAdmin = useSetRecoilState(roomAdminState);
  const setUserList = useSetRecoilState(userListState);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onBeforeUnload = () => {
      socket.emit("disconnecting");
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    socket.on("set_state", (state: IGameState) => {
      state.username && setUsername(state.username);
      state.userId && setUserId(state.userId);
      state.roomId && setRoomId(state.roomId);
      state.roomAdmin && setRoomAdmin(state.roomAdmin);
      state.userList && setUserList(state.userList);
    });

    return () => {
      socket.disconnect();
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [setUsername, setUserId, setRoomId, setRoomAdmin, setUserList]);

  return null;
}
