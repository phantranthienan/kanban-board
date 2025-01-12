import jwt from 'jsonwebtoken';
import config from '@/config';

/**
 * Generate an access token
 * @param userId - User ID
 */
export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a refresh token
 * @param userId - User ID
 */
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verify an access token
 * @param token - Access token
 */
export const verifyAccessToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
};

/**
 * Verify a refresh token
 * @param token - Refresh token
 */
export const verifyRefreshToken = (token: string): jwt.JwtPayload => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as jwt.JwtPayload;
};