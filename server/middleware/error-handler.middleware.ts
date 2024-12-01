//global error handler middleware

import * as express from 'express';
import { BaseError } from 'sequelize';
import {
    AuthorizationError,
    UnknownError,
    UnprocessableError,
} from '../helper/error-helpers';

export function globalErrorHandler(
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
): void {
    // eslint-disable-next-line no-console
    console.error('here', err);
    if (Array.isArray(err)) {
        const error = err[0].constraints || {
            message: 'Unexpected error occurred.',
        };
        const message = Object.values(error)[0] as string;
        res.status(422).send(new UnprocessableError(message));
    } else if (err instanceof AuthorizationError) {
        res.status(401).json(err);
    } else if (err instanceof BaseError) {
        res.status(422).json(new UnprocessableError(err.name));
    } else {
        res.status(500).send(new UnknownError(JSON.stringify(err)));
    }
}
