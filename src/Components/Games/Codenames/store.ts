import { useEffect } from "react";
import { atom, selector, useResetRecoilState, useSetRecoilState } from "recoil";
import io from "socket.io-client";
import { userIdState } from "../../stores/gameDataStore";
import {
  GameStates,
  ICodenamesState,
  IPlayer,
  NAMESPACE,
  Teams,
} from "./domain";

export const playerListState = atom<IPlayer[]>({
  key: "codenamesPlayerListState",
  default: [],
});

export const blueMasterState = atom<IPlayer | null>({
  key: "codenamesBlueMasterState",
  default: null,
});

export const redMasterState = atom<IPlayer | null>({
  key: "codenamesRedMasterState",
  default: null,
});

export const gameConditionState = atom<GameStates>({
  key: "codenamesGameConditionState",
  default: GameStates.JOIN,
});

export const currentTeamState = selector<Teams>({
  key: "codenamesCurrentTeamState",
  get: ({ get }) => {
    const currentUserId = get(userIdState);
    const playerList = get(playerListState);
    return (
      playerList.find((player) => player.id === currentUserId)?.team ||
      Teams.NEUTRAL
    );
  },
});

export const blueTeamState = selector<IPlayer[]>({
  key: "blueTeamState",
  get: ({ get }) => {
    const playerList = get(playerListState);
    return playerList.filter((player) => player.team === Teams.BLUE);
  },
});

export const redTeamState = selector<IPlayer[]>({
  key: "redTeamState",
  get: ({ get }) => {
    const playerList = get(playerListState);
    return playerList.filter((player) => player.team === Teams.RED);
  },
});

export const socket = io(NAMESPACE, { autoConnect: false });

export const useResetCodenamesState = () => {
  const resetPlayerList = useResetRecoilState(playerListState);
  const resetBlueMaster = useResetRecoilState(blueMasterState);
  const resetRedMaster = useResetRecoilState(redMasterState);
  const resetGameState = useResetRecoilState(gameConditionState);

  return () => {
    resetPlayerList();
    resetBlueMaster();
    resetRedMaster();
    resetGameState();
  };
};

export function SubscribeToStateChanges() {
  const setPlayerList = useSetRecoilState(playerListState);
  const setBlueMaster = useSetRecoilState(blueMasterState);
  const setRedMaster = useSetRecoilState(redMasterState);
  const setGameState = useSetRecoilState(gameConditionState);

  const resetState = useResetCodenamesState();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const onBeforeUnload = () => {
      socket.emit("disconnecting");
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    socket.on("set_state", (state: ICodenamesState) => {
      console.log("Got set_state: ", state);
      state.playerList && setPlayerList(state.playerList);
      state.blueMaster && setBlueMaster(state.blueMaster);
      state.redMaster && setRedMaster(state.redMaster);
      state.gameState && setGameState(state.gameState);
    });

    socket.on("leave_game", (data: IPlayer) => {
      setPlayerList((list) => list.filter((player) => player.id !== data.id));
      setBlueMaster((blueMaster) =>
        blueMaster?.id === data.id ? null : blueMaster
      );
      setRedMaster((redMaster) =>
        redMaster?.id === data.id ? null : redMaster
      );
    });

    socket.on("join_team", (data: IPlayer) => {
      console.log("Got join_team: ", data);
      if (data.team === Teams.NEUTRAL) {
        setBlueMaster((blueMaster) =>
          blueMaster?.id === data.id ? null : blueMaster
        );
        setRedMaster((redMaster) =>
          redMaster?.id === data.id ? null : redMaster
        );
      } else if (data.team === Teams.BLUE) {
        setRedMaster((redMaster) =>
          redMaster?.id === data.id ? null : redMaster
        );
      } else if (data.team === Teams.RED) {
        setBlueMaster((blueMaster) =>
          blueMaster?.id === data.id ? null : blueMaster
        );
      }
      setPlayerList((list) => list.filter((user) => user.id !== data.id));
      setPlayerList((list) => list.concat(data));
    });

    socket.on("set_spymaster", (data: IPlayer) => {
      if (data.team === Teams.RED) {
        setRedMaster(data);
      } else if (data.team === Teams.BLUE) {
        setBlueMaster(data);
      }
    });

    return () => {
      socket.disconnect();
      window.removeEventListener("beforeunload", onBeforeUnload);
      resetState();
    };
  }, []);

  return null;
}
