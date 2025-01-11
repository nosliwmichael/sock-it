import React, { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext(null);

export const SocketProvider = ({ socket, children }) => {
    const [currentSocket, setCurrentSocket] = useState(socket);

    useEffect(() => {
        setCurrentSocket(socket);
    }, [socket]);

    const setSocket = (newSocket) => {
        setCurrentSocket(newSocket);
    };

    return (
        <SocketContext.Provider value={{ currentSocket, setSocket }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
