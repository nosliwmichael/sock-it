import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextProps {
  socket: Socket;
  setSocket: (socket: Socket) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = (): SocketContextProps => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = (props) => {
  const [socket, setSocket] = useState<Socket>(io());

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket, setSocket }), [socket]);

  return (
    <SocketContext.Provider value={value}>
      {props.children}
    </SocketContext.Provider>
  );
};
