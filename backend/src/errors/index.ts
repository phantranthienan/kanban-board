/**
 * CustomError class for generic errors
 * @class CustomError
 * @extends {Error}
 */
export class CustomError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}

/**
 * NotFoundError class for 404 errors
 * @class NotFoundError
 * @extends {CustomError}
 */
export class NotFoundError extends CustomError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * UnauthorizedError class for 401 errors
 * @class UnauthorizedError
 * @extends {CustomError}
 */
export class UnauthorizedError extends CustomError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

/**
 * BadRequestError class for 400 errors
 * @class BadRequestError
 * @extends {CustomError}
 */
export class BadRequestError extends CustomError {
    constructor(message: string = 'Bad request') {
        super(message, 400);
    }
}
