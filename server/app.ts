/* eslint-disable no-console */
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join('../.env') });
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
    })
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
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
