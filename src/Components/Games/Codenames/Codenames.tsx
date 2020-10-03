import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";

import Chat from "../../Chat";
import Game from "./Game";
import PickTeams from "./PickTeams";
import PlayerList from "./PlayerList";
import { userIdState } from "../../stores/gameDataStore";
import { GameStates, IPlayer, ITeamList, Teams } from "./domain";

const socket = io("/codenames", { autoConnect: false });

const Codenames = () => {
  const [playerList, setPlayerList] = useState([] as IPlayer[]);
  const [blueMaster, setBlueMaster] = useState(
    undefined as IPlayer | undefined
  );
  const [redMaster, setRedMaster] = useState(undefined as IPlayer | undefined);
  const [currentTeam, setCurrentTeam] = useState(Teams.NEUTRAL);
  const [gameState, setGameState] = useState(GameStates.JOIN);
  const userId = useRecoilValue(userIdState);

  useEffect(() => {
    // Connect to the /codenames namespace on component mount
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("game_state", (data: GameStates) => {
      setGameState(data);
    });

    // team_list event rewrites present team list.
    socket.on("team_list", (data: ITeamList) => {
      if (typeof data.blueSpymaster !== "undefined") {
        setBlueMaster(data.blueSpymaster || undefined);
      }
      if (typeof data.redSpymaster !== "undefined") {
        setRedMaster(data.redSpymaster || undefined);
      }
      if (data.currentTeam === Teams.BLUE) {
        setCurrentTeam(Teams.BLUE);
      } else if (data.currentTeam === Teams.RED) {
        setCurrentTeam(Teams.RED);
      } else {
        setCurrentTeam(Teams.NEUTRAL);
      }
      setPlayerList(data.players);
    });

    // leave_game event signifies that a user left the game.
    socket.on("leave_game", (data: IPlayer) => {
      setPlayerList((list) => list.filter((player) => player.id !== data.id));
      setBlueMaster((blueMaster) =>
        blueMaster?.id === data.id ? undefined : blueMaster
      );
      setRedMaster((redMaster) =>
        redMaster?.id === data.id ? undefined : redMaster
      );
    });

    // Close socket (and leave room) when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const ongoing = !(
    gameState === GameStates.JOIN ||
    gameState === GameStates.BLUE_READY ||
    gameState === GameStates.RED_READY
  );

  const teamChatEnabled =
    ongoing &&
    ((currentTeam === Teams.BLUE && blueMaster?.id !== userId) ||
      (currentTeam === Teams.RED && redMaster?.id !== userId));

  return (
    <Grid container component="main">
      <Grid item xs={12} sm={9} md={9}>
        <Box
          height="100%"
          display="flex"
          flexDirection="row"
          justifyContent="left"
          alignContent="center"
        >
          <PlayerList list={playerList} />
          <Divider orientation="vertical" light />

          {gameState != null && ongoing ? (
            <Game
              socket={socket}
              gameState={gameState}
              setGameState={setGameState}
              playerList={playerList}
              blueMaster={blueMaster!}
              redMaster={redMaster!}
              currentTeam={currentTeam}
            />
          ) : ongoing === false ? (
            <PickTeams
              socket={socket}
              playerList={playerList}
              setPlayerList={setPlayerList}
              blueMaster={blueMaster}
              setBlueMaster={setBlueMaster}
              redMaster={redMaster}
              setRedMaster={setRedMaster}
              currentTeam={currentTeam}
              setCurrentTeam={setCurrentTeam}
              blueTeamReady={gameState === GameStates.BLUE_READY}
              redTeamReady={gameState === GameStates.RED_READY}
            />
          ) : (
            <></>
          )}
        </Box>
      </Grid>
      <Grid item xs={false} sm={3} md={3} component={Paper}>
        <Chat teamSocket={teamChatEnabled ? socket : undefined} />
      </Grid>
    </Grid>
  );
};

export default Codenames;
