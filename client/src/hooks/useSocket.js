import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userInfo, selectedRecipient, onMessage, onGroupMessage) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        if (userInfo) {
            newSocket.emit("register", userInfo.displayName);
        }

        newSocket.on("chat-message", onMessage);
        newSocket.on("group-message", onGroupMessage);

        return () => {
            newSocket.disconnect();
        };
    }, [userInfo, onMessage, onGroupMessage]);

    return socket;
};
