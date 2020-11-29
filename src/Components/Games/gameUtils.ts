import { useEffect } from "react";
import io from "socket.io-client";

export const useSocketIO = (namespace: string) => {
  const socket = io(namespace, { autoConnect: false });

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  });

  return socket;
};
