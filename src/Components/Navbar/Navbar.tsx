import React from "react";
import { useRecoilValue } from "recoil";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import LeaveRoom from "./LeaveRoom";
import Share from "./Share";
import { userIdState, usernameState } from "../stores/gameDataStore";
import dice from "../../assets/dice.png";
import UserAvatar from "../UserAvatar";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: "flex",
    alignItems: "center",
  },
  divider: {
    margin: theme.spacing(1, 2, 1, 3),
  },
  logo: {
    height: "100%",
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const username = useRecoilValue(usernameState);
  const userId = useRecoilValue(userIdState);

  return (
    <AppBar position="sticky" color="default">
      <Toolbar variant="dense">
        <Box height="4vh" marginRight={2}>
          <img src={dice} alt="Let's Play!" className={classes.logo} />
        </Box>
        <Typography variant="h6">
          <pre>Let's Play!</pre>
        </Typography>
        <div className={classes.grow} />
        <div className={classes.sectionDesktop}>
          <Share />

          <Divider
            orientation="vertical"
            flexItem
            className={classes.divider}
          />

          <LeaveRoom />

          <Divider
            orientation="vertical"
            flexItem
            className={classes.divider}
          />

          <UserAvatar username={username} userId={userId} />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
