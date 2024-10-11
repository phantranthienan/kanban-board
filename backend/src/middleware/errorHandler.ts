import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/CustomError';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", error);

    if (error instanceof CustomError) {
        const { statusCode, message, errors } = error;
        res.status(statusCode).json({ 
            error: { 
                message, 
                ...(errors && { errors })
            } 
        });
    } else {
        res.status(500).json({ 
            error: { 
                message: 'Internal server error' 
            } 
        });
    }

}; 