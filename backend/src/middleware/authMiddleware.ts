import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';
import { CustomError } from '../errors/CustomError';
import { config } from '../config';

export interface AuthRequest extends Request {
    user?: {
        id: string;
    }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new CustomError('Access denied. No token provided', 401));
    }

    try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
        const { id } = decodedToken;
        req.user = { id }; 
        next(); 
    } catch (error: Error | any) {
        if (error.name === 'TokenExpiredError') {
          next(new CustomError('Token has expired', 401));
        } else if (error.name === 'JsonWebTokenError') {
          next(new CustomError('Invalid token', 401));
        } else {
          next(new CustomError('Failed to authenticate token', 401));
        } 
    }
};