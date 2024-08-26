import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { AuthorizationError } from '../helper/error-helpers';
import * as jwt from 'jsonwebtoken';
import { secret } from '../controllers/auth/auth';
import { User } from '../database/models/user.model';
import { EmptyResultError } from 'sequelize';

export async function socketMiddleware(
    socket: Socket,
    next: (err?: ExtendedError) => void
) {
    const authHeader = socket.handshake.auth.token;
    if (!authHeader || !authHeader.includes('Bearer ')) {
        return next(new AuthorizationError('Invalid Bearer Token'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, secret) as jwt.JwtPayload;
        await User.findOne({
            where: {
                id: payload.userId,
            },
            rejectOnEmpty: true,
        });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AuthorizationError('Token Expired'));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AuthorizationError('Invalid Token'));
        }
        if (error instanceof EmptyResultError) {
            return next(new AuthorizationError('User does not exist'));
        }
        return next(new AuthorizationError(JSON.stringify(error)));
    }
    return next();
}
