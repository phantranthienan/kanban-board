import { CustomError } from "./CustomError";

export class ValidationError extends CustomError {
    constructor(errors: any[]) {
        super('Validation Error', 400, errors);
    }
}