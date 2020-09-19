import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { IMessage } from "./domain";

const useStyles = makeStyles((theme) => ({
  message: {
    maxWidth: "90%",
    border: "0.5px",
    borderRadius: "20px",
    borderBottomLeftRadius: "0px",
    backgroundColor: theme.palette.secondary.light,
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
    backgroundColor: theme.palette.text.hint,
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
