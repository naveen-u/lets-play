import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { Avatar as MuiAvatar } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import MuiAlert, { Color } from "@material-ui/lab/Alert";
import Slide from "@material-ui/core/Slide";
import Snackbar from "@material-ui/core/Snackbar";
import Tooltip from "@material-ui/core/Tooltip";
import { makeStyles } from "@material-ui/core/styles";
import { roomIdState } from "../store";

const useStyles = makeStyles((theme) => ({
  menuItem: {
    borderRadius: "16px",
    margin: theme.spacing(1),
    display: "flex",
    flexDirection: "row",
    backgroundColor: theme.palette.primary.main,
  },
  copyButton: {
    backgroundColor: theme.palette.background.default,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const Share = () => {
  const classes = useStyles();

  const room = useRecoilValue(roomIdState);

  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [severity, setSeverity] = useState("info" as Color);

  const copyRoomCode = () => {
    navigator.clipboard
      .writeText(room)
      .then(() => {
        setToastMessage("Room code copied to clipboard!");
        setSeverity("success" as Color);
        setOpenToast(true);
      })
      .catch((err) => {
        // This can happen if the user denies clipboard permissions
        setToastMessage("Could not copy!");
        setSeverity("error" as Color);
        setOpenToast(true);
        console.error("Could not copy text: ", err);
      });
  };

  const copyURL = () => {
    navigator.clipboard
      .writeText(window.location.origin + "?room=" + room)
      .then(() => {
        setToastMessage("URL copied to clipboard!");
        setSeverity("success");
        setOpenToast(true);
      })
      .catch((err) => {
        // This can happen if the user denies clipboard permissions
        setToastMessage("Could not copy!");
        setSeverity("error");
        setOpenToast(true);
        console.error("Could not copy text: ", err);
      });
  };

  const handleClose = () => {
    setOpenToast(false);
  };

  function TransitionLeft(props: object) {
    return <Slide {...props} direction="left" />;
  }

  return (
    <>
      <Box border={1} borderColor="primary.main" className={classes.menuItem}>
        <Tooltip title="Copy room code">
          <Button
            onClick={copyRoomCode}
            size="small"
            className={classes.copyButton}
          >
            Code
          </Button>
        </Tooltip>

        <MuiAvatar className={classes.avatar}>
          <GroupAddIcon />
        </MuiAvatar>

        <Tooltip title="Copy URL">
          <Button onClick={copyURL} size="small" className={classes.copyButton}>
            URL
          </Button>
        </Tooltip>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={openToast}
        autoHideDuration={2000}
        onClose={handleClose}
        key="topright"
        TransitionComponent={TransitionLeft}
      >
        <MuiAlert elevation={6} variant="filled" severity={severity}>
          {toastMessage}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default Share;
