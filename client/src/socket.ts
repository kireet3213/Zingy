import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL =
    process.env.NODE_ENV === 'production' ? '' : import.meta.env.VITE_API_URL;

export const socket = io(URL, {
    auth: {
        token: `Bearer ${localStorage.getItem('jwt_secret')}`,
    },
    autoConnect: false,
    ackTimeout: 1000,
    reconnection: true,
    upgrade: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 4000,
});
