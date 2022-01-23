import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { Avatar as MuiAvatar } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import makeStyles from "@mui/styles/makeStyles";
import { roomIdState } from "../stores/gameDataStore";

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
    "&:hover": {
      color: theme.palette.background.default,
    },
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
  const [severity, setSeverity] = useState<AlertColor>("info");

  const copyRoomCode = () => {
    navigator.clipboard
      .writeText(room)
      .then(() => {
        setToastMessage("Room code copied to clipboard!");
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

        {openToast && (
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={openToast}
            autoHideDuration={2000}
            onClose={handleClose}
            key="topright"
          >
            <MuiAlert elevation={6} variant="filled" severity={severity}>
              {toastMessage}
            </MuiAlert>
          </Snackbar>
        )}
      </Box>
    </>
  );
};

export default Share;
