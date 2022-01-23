import React, { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

import Chat from "../../../Chat";
import Game from "./Game";
import PickTeams from "./PickTeams";
import PlayerList from "./PlayerList";
import { userIdState, userListState } from "../../../stores/gameDataStore";
import { GameStates, Teams } from "../domain";
import {
  blueMasterState,
  currentTeamState,
  gameConditionState,
  playerListState,
  redMasterState,
  socket,
  SubscribeToStateChanges,
} from "../store";

const Codenames = () => {
  const blueMaster = useRecoilValue(blueMasterState);
  const redMaster = useRecoilValue(redMasterState);
  const currentTeam = useRecoilValue(currentTeamState);
  const gameState = useRecoilValue(gameConditionState);
  const userId = useRecoilValue(userIdState);
  const userList = useRecoilValue(userListState);
  const setPlayerList = useSetRecoilState(playerListState);

  const ongoing = !(
    gameState === GameStates.JOIN ||
    gameState === GameStates.BLUE_READY ||
    gameState === GameStates.RED_READY
  );

  const teamChatEnabled =
    ongoing &&
    ((currentTeam === Teams.BLUE && blueMaster?.id !== userId) ||
      (currentTeam === Teams.RED && redMaster?.id !== userId));

  useEffect(() => {
    setPlayerList(
      userList.map((it) => ({
        id: it.userId,
        user: it.username,
        team: Teams.NEUTRAL,
      }))
    );
  }, []);

  return (
    <>
      <SubscribeToStateChanges />
      <Grid container component="main">
        <Grid item xs={12} sm={9} md={9}>
          <Box
            height="100%"
            display="flex"
            flexDirection="row"
            justifyContent="left"
            alignContent="center"
          >
            <PlayerList />
            <Divider orientation="vertical" light />

            {gameState != null && ongoing ? (
              <Game />
            ) : ongoing === false ? (
              <PickTeams />
            ) : (
              <></>
            )}
          </Box>
        </Grid>
        <Grid item xs={false} sm={3} md={3} component={Paper}>
          <Chat teamSocket={teamChatEnabled ? socket : undefined} />
        </Grid>
      </Grid>
    </>
  );
};

export default Codenames;
