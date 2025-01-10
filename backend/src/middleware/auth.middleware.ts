import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from '../errors';
import { config } from '../config';

export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new CustomError('Access denied. No token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
        req.user = { id: decoded.id };
        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            next(new CustomError('Token has expired', 401));
        } else if (error.name === 'JsonWebTokenError') {
            next(new CustomError('Invalid token', 401));
        } else {
            next(new CustomError('Failed to authenticate token', 401));
        }
    }
};
