import { Request, Response, NextFunction } from 'express';
import { ContextRunner, validationResult } from 'express-validator';

import { ValidationError } from '../errors/ValidationError';

export const validate = (validations: ContextRunner[]) => {
    return async(req: Request, res: Response, next: NextFunction) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError(errors.array()));
        }
        next();
    };
};