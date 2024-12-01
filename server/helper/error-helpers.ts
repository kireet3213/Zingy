export class AuthorizationError extends Error {
    constructor(
        public message: string = 'Unauthorized',
        public statusCode: number = 401
    ) {
        super();
    }
}

export class UnprocessableError extends Error {
    constructor(
        public message: string = 'Validation Error',
        public statusCode: number = 422
    ) {
        super();
    }
}

export class UnknownError extends Error {
    constructor(
        public message: string = 'UnknownError',
        public statusCode: number = 400
    ) {
        super();
    }
}
