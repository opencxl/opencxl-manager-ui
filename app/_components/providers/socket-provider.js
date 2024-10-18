'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';
import { io as IoClient } from 'socket.io-client';

const SocketContext = createContext({
    socket: null,
    connected: false
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = IoClient(`http://10.40.10.84:8200`);
        // const socket = IoClient(`http://${window.location.hostname}:8200`);
        socket.on('connect', () => {
            setConnected(true);
        });
        socket.on('disconnect', () => {
            setConnected(false);
        });
        setSocket(socket);

        return () => {
            socket.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={{
            socket,
            connected
        }}>
            {children}
        </SocketContext.Provider>
    )
}
