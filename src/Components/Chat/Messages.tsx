import React, { useEffect } from "react";
import List from "@mui/material/List";
import Message from "./Message";
import { IMessage } from "./domain";

const Messages = (props: { messages: IMessage[] }) => {
  useEffect(() => {
    // There is a new message in the state, scroll to bottom of list
    const objDiv = document.getElementById("messageList")!.parentElement;
    objDiv!.scrollTop = objDiv!.scrollHeight;
  });

  // Loop through all the messages in the state and create a Message component
  const messages = props.messages.map((message, i) => {
    return (
      <Message
        key={i}
        username={message.username || ""}
        message={message.message}
        fromMe={message.fromMe}
      />
    );
  });
  return <List id="messageList">{messages}</List>;
};

export default Messages;
