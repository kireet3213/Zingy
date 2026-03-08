import { io, Socket } from 'socket.io-client';
import {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../../shared-types/socket';

const getSocketUrl = (): string => {
    if (import.meta.env.PROD) {
        return '';
    }
    return localStorage.getItem('serverUrl') || import.meta.env.VITE_API_URL || '';
};

let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents>;

const createSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
    const url = getSocketUrl();
    return io(url, {
        autoConnect: false,
        ackTimeout: 1000,
        reconnection: true,
        upgrade: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });
};

socketInstance = createSocket();

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = socketInstance;

export const recreateSocket = () => {
    socketInstance?.close();
    socketInstance = createSocket();
    return socketInstance;
};
