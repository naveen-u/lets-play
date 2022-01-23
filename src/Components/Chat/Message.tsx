import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { IMessage } from "./domain";

const useStyles = makeStyles((theme) => ({
  message: {
    maxWidth: "90%",
    border: "0.5px",
    borderRadius: "20px",
    borderBottomLeftRadius: "0px",
    color: "black",
    backgroundColor: theme.palette.primary.light,
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0, 2),
    display: "inline-block",
    wordWrap: "break-word",
  },
  messageFromMe: {
    maxWidth: "90%",
    border: "0.5px",
    borderRadius: "20px",
    borderBottomRightRadius: "0px",
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    padding: theme.spacing(1, 2),
    margin: theme.spacing(0, 2),
    display: "inline-block",
    textAlign: "right",
    float: "right",
    wordWrap: "break-word",
  },
  systemMessage: {
    display: "inline-block",
    width: "100%",
    textAlign: "center",
  },
  username: {
    margin: theme.spacing(0, 0, 0, 2),
  },
  list: {
    margin: 0,
    padding: 0,
  },
}));

const Message = (props: IMessage) => {
  const classes = useStyles();
  // Was the message sent by the current user. If so, add a css class
  return (
    <>
      {props.fromMe || props.username === "" ? (
        ""
      ) : (
        <li>
          <Typography
            className={classes.username}
            color="textSecondary"
            display="block"
            variant="caption"
            align="left"
          >
            {props.username}
          </Typography>
        </li>
      )}
      {props.username === "" && !props.fromMe ? (
        <ListItem dense className={classes.list}>
          <ListItemText
            primary={
              <span className={classes.systemMessage}>{props.message}</span>
            }
            primaryTypographyProps={{
              variant: "overline",
              color: "textSecondary",
            }}
          />
        </ListItem>
      ) : (
        <ListItem dense className={classes.list}>
          <ListItemText
            primary={
              <span
                className={
                  props.fromMe ? classes.messageFromMe : classes.message
                }
              >
                {props.message}
              </span>
            }
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItem>
      )}
    </>
  );
};

export default Message;
