import { Request, Response, NextFunction } from 'express';

import { ZodError } from 'zod';
import { CustomError } from '../errors/CustomError';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", error);

    if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
        }))
        res.status(400).json({
            message: 'Validation Error',
            issues: formattedErrors,
        });
    } else if (error instanceof CustomError) {
        const { statusCode, message} = error;
        res.status(statusCode).json({ 
            message, 
        });
    } else if (error instanceof Error) {
        res.status(400).json({ 
            message: error.message
        });
    } else {
        res.status(500).json({ 
            message: 'Internal server error' 
        });
    }

}; 