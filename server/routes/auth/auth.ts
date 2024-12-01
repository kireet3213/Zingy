import { Router } from 'express';
import passport from 'passport';
import { authenticateUser } from '../../controllers/auth/auth';
import {
    AuthorizationError,
    UnprocessableError,
} from '../../helper/error-helpers';
import { ValidationError } from 'class-validator';
import { User } from '../../database/models/user.model';

const authRoutes = Router();

authRoutes.post(
    '/login',
    (req, _res, next) => {
        passport.authenticate(
            'local',
            {
                failureMessage: true,
                session: false,
            },
            (err: string | Array<ValidationError>, user: User) => {
                if (Array.isArray(err)) {
                    const message = Object.values(
                        err[0].constraints || {
                            message: 'Unexpected error occurred.',
                        }
                    )[0];
                    next(new UnprocessableError(message));
                }
                if (typeof err === 'string') {
                    next(new AuthorizationError(err));
                } else {
                    req.user = user;
                    next();
                }
            }
        )(req, _res, next);
    },
    authenticateUser
);

export default authRoutes;
