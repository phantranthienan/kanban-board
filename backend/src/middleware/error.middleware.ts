import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CustomError } from '../errors';

const isDevelopment = process.env.NODE_ENV === 'development';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    // Log the error (structured logging can be used here)
    console.error({
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
        path: req.path,
        method: req.method,
    });

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        res.status(400).json({
            message: 'Validation Error',
            errors: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        });
        return;
    }

    // Handle CustomError instances
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({
            message: error.message,
        });
        return;
    }

    // Handle generic errors
    res.status(500).json({
        message: isDevelopment ? error.message : 'Internal server error',
    });
};
