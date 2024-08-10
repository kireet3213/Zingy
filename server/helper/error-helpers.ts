export class AuthorizationError extends Error {
    constructor(
        public message: string = 'Unauthorized',
        public statusCode: number = 401
    ) {
        super();
    }
}
