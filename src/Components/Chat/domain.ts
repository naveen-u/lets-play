export interface IChatProps {
  socket?: SocketIOClient.Socket;
  teamSocket?: SocketIOClient.Socket;
}

export interface IChatInputProps {
  onSend: (input: string) => void;
}

export interface IMessage {
  message: string;
  username?: string;
  fromMe?: boolean;
}

export type TChatType = "global" | "team";
