/* eslint-disable no-console */
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join('./.env') });
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connection from './configuration/database/database.config';
import userRoutes from './routes/user/user';
import { globalErrorHandler } from './middleware/error-handler.middleware';
import passport from 'passport';
import session from 'express-session';
import authRoutes from './routes/auth/auth';
import { localStrategy } from './strategies/localStrategy';
import { verifyToken } from './middleware/verification.middleware';
import { Server } from 'socket.io';
import { socketMiddleware } from './middleware/socket.middleware';
import { Maybe } from './types/utility';
import {
    ServerToClientEvents,
    ClientToServerEvents,
    User,
} from '../shared-types/socket';

const app: Application = express();
app.use(cors());
// parse requests of content-type - application/json

app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'asddddasdasd',
        resave: false,
        saveUninitialized: false,
    }),
);
passport.use(localStrategy);

app.get('/', (_req: Request, res: Response) => {
    res.send('Express server with TypeScript');
});
app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/protected', verifyToken, (_req: Request, res: Response) => {
    res.status(200).json({ verified: true });
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 8080;

connection
    .authenticate()
    .then(async () => {
        await connection.sync({ force: false });
        console.log('Database successfully connected');
    })
    .catch((err) => {
        console.log('Error', err);
    });

//server
const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

//socket io server
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    },
});

io.use(socketMiddleware);

const userSockets = new Map<
    string,
    { user: User; id: string; isConnected: boolean }
>();

io.on('connection', (socket) => {
    // console.log("session store",sessionStore);

    console.log('Socket connected: ', socket.id);
    const currentUser: Maybe<User> = socket.handshake.auth.user;

    if (currentUser) {
        socket.join(currentUser.id);
        userSockets.set(currentUser.id, {
            user: currentUser,
            id: socket.id,
            isConnected: true,
        });
    }
    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected: ', socket.id, 'due to', reason);
    });
    //connection state recovery
    if (socket.recovered) {
        console.log(
            'Reconnected socket server',
            socket.id,
            socket.rooms.entries(),
            socket.data,
        );
    }
    socket.on('private-message', (message, acknowledgementCallback) => {
        console.log('private-message', message.to);

        //send to self
        if (currentUser?.id === message.to) {
            socket.emit('private-message', {
                message,
                from: currentUser?.id,
                to: message.to,
            });
            acknowledgementCallback('acknowledged', null);
            return;
        }
        //send to other
        socket.to(message.to as string).emit('private-message', {
            message,
            from: currentUser?.id as string,
            to: message.to as string,
        });
        acknowledgementCallback('acknowledged', null);
    });

    const connectedUsers = Array.from(userSockets.values()).map(
        ({ user, isConnected }) => ({
            id: user.id,
            user: user,
            isConnected,
        }),
    );
    socket.emit('connected-users', connectedUsers);
    socket.broadcast.emit('new-user-connected', {
        id: socket.handshake.auth.user.id,
        user: socket.handshake.auth.user,
    });

    socket.on('disconnect', async () => {
        if (currentUser) {
            const matchingSockets = await io.in(currentUser.id).fetchSockets();

            if (matchingSockets.length === 0) {
                socket.broadcast.emit(
                    'user-disconnected',
                    socket.handshake.auth.user.id,
                );
                userSockets.set(currentUser.id, {
                    user: currentUser,
                    id: currentUser?.id,
                    isConnected: false,
                });
            }
        }
    });
});

// setInterval(() => {
//     io.emit('ping', new Date().toLocaleString());
//     console.log('ping', new Date().toLocaleString());
// }, 1000);
