import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { secret } from '../controllers/auth/auth';
import { User } from '../database/models/user.model';
import { AuthorizationError } from '../helper/error-helpers';

export function verifyToken(
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
): void {
    validateBearerToken(req.header('Authorization'))
        .then(() => next())
        .catch((error) => next(error));
}

export async function validateBearerToken(authHeader: string | undefined) {
    if (!authHeader || !authHeader.includes('Bearer ')) {
        throw new AuthorizationError('Invalid Bearer Token');
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
            throw new AuthorizationError('Token Expired');
        }
        if (error instanceof jwt.NotBeforeError) {
            throw new AuthorizationError('Invalid Token');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AuthorizationError('Invalid Token');
        }
        throw new AuthorizationError(JSON.stringify(error));
    }
}
