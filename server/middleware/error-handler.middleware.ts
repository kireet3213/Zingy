//global error handler middleware

import * as express from 'express';
import { ValidationError } from 'sequelize';
import { AuthorizationError } from '../helper/error-helpers';

export function globalErrorHandler(
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
): void {
    // eslint-disable-next-line no-console
    console.error(err);
    if (Array.isArray(err)) {
        const errorObj = err.map((e) => {
            return e.constraints;
        });
        res.status(401).send(errorObj);
    } else if (err instanceof AuthorizationError) {
        res.status(401).json(err);
    } else if (err instanceof ValidationError) {
        const error = JSON.parse(JSON.stringify(err.errors[0]));
        delete error.instance;
        res.status(422).json(error);
    } else {
        res.status(500).send(err);
    }
}
