import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CustomError } from '../errors';

const isDevelopment = process.env.NODE_ENV === 'development';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Log the error stack trace only in development mode for easier debugging
    if (isDevelopment) {
        console.error('Error:', error.stack || error.message);
    }

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

    // Handle custom application errors
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({
            message: error.message,
            ...(isDevelopment && { stack: error.stack }), // Include stack trace in development
        });
        return;
    }

    // Handle generic server errors
    res.status(500).json({
        message: isDevelopment ? error.message : 'Internal Server Error',
        ...(isDevelopment && { stack: error.stack }), // Include stack trace in development
    });
};
