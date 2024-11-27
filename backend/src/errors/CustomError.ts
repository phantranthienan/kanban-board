/**
 * CustomError class
 * @class CustomError
 * @extends {Error}
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
export class CustomError extends Error {
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}