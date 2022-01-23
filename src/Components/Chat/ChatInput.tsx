import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import { IChatInputProps } from "./domain";

const ChatInput = (props: IChatInputProps) => {
  const [chatInput, setChatInput] = useState("");

  const submitHandler = (event: React.FormEvent) => {
    // Stop the form from refreshing the page on submit
    event.preventDefault();

    // Clear the input box
    setChatInput("");

    // Call the onSend callback with the chatInput message
    props.onSend(chatInput);
  };

  const textChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(event.target.value);
  };

  return (
    <form onSubmit={submitHandler}>
      <TextField
        type="text"
        onChange={textChangeHandler}
        value={chatInput}
        placeholder="Write a message..."
        variant="filled"
        margin="dense"
        fullWidth
        required
        autoFocus
      />
    </form>
  );
};

export default ChatInput;
