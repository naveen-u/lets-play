import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Box from "@material-ui/core/Box";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { makeStyles } from "@material-ui/core/styles";

import Messages from "./Messages";
import ChatInput from "./ChatInput";
import { IChatProps, IMessage, TChatType } from "./domain";

let socket = io("/chat", { autoConnect: false });

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    flexDirection: "column",
  },
  container1: {
    marginTop: theme.spacing(2),
    height: (teamChatEnabled) => (teamChatEnabled ? "66vh" : "73vh"),
    width: "100%",
    maxHeight: "90%",
    overflowY: "auto!important" as "auto",
  },
  container2: {
    margin: theme.spacing(2, 1),
    padding: theme.spacing(2, 0),
    height: "10vh",
  },
  grow: {
    flexGrow: 1,
  },
  toggleGroup: {
    width: "100%",
  },
  toggleButton: {
    width: "50%",
  },
}));

const Chat = (props: IChatProps) => {
  const [messages, setMessages] = useState([] as IMessage[]);
  const [teamMessages, setTeamMessages] = useState([] as IMessage[]);
  const [chatType, setChatType] = useState("global");

  useEffect(() => {
    if (props.socket != null) {
      socket = props.socket;
    }
    // Connect to the /chat namespace on component mount
    if (!socket.connected) {
      socket.connect();
    }

    // Listen for messages from the server
    socket.on("chat_message", (message: IMessage) => {
      setMessages((messages) => messages.concat(message));
    });

    // Close socket (and leave room) when component unmounts
    return () => {
      socket.disconnect();
    };
  }, [props.socket]);

  useEffect(() => {
    if (typeof props.teamSocket !== "undefined" && props.teamSocket !== null) {
      props.teamSocket.on("chat_message", (message: IMessage) => {
        setTeamMessages((teamMessages) => teamMessages.concat(message));
      });
    }
  }, [props.teamSocket]);

  const sendHandler = (message: string) => {
    const messageObject: IMessage = {
      message,
    };
    // Emit the message to the server
    socket.emit("chat_message", messageObject);
    messageObject.fromMe = true;
    addMessage(messageObject);
  };

  const sendTeamHandler = (message: string) => {
    if (props.teamSocket == null) {
      return;
    }
    const messageObject: IMessage = {
      message,
    };
    // Emit the message to the server
    props.teamSocket.emit("chat_message", messageObject);
    messageObject.fromMe = true;
    addTeamMessage(messageObject);
  };

  const addMessage = (message: IMessage) => {
    // Append the message to the component state
    const messageList = messages.concat(message);
    setMessages(messageList);
  };

  const addTeamMessage = (message: IMessage) => {
    // Append the message to the component state
    const messageList = teamMessages.concat(message);
    setTeamMessages(messageList);
  };

  const handleChatChange = (event: object, newValue: TChatType) => {
    setChatType(newValue);
  };

  const teamChatEnabled = props.teamSocket != null;

  const classes = useStyles(teamChatEnabled);

  return (
    <Box className={classes.root}>
      {chatType === "global" ? (
        <>
          <Box className={classes.container1}>
            <Messages messages={messages} />
          </Box>
          <Box className={classes.container2}>
            <ChatInput onSend={sendHandler} />
          </Box>
        </>
      ) : (
        <>
          <Box className={classes.container1}>
            <Messages messages={teamMessages} />
          </Box>
          <Box className={classes.container2}>
            <ChatInput onSend={sendTeamHandler} />
          </Box>
        </>
      )}
      {teamChatEnabled ? (
        <ToggleButtonGroup
          value={chatType}
          exclusive
          onChange={handleChatChange}
          aria-label="chat type"
          className={classes.toggleGroup}
        >
          <ToggleButton
            value="global"
            aria-label="global chat"
            className={classes.toggleButton}
          >
            Global
          </ToggleButton>
          <ToggleButton
            value="team"
            aria-label="team chat"
            className={classes.toggleButton}
          >
            Team
          </ToggleButton>
        </ToggleButtonGroup>
      ) : (
        ""
      )}
    </Box>
  );
};

export default Chat;
