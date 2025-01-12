import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserDocument, TUser, createUser, getUserByEmail, getUserByUsername, getUserByGoogleId } from '../models/user.model';
import { CustomError } from '../errors';
import { config } from '../config';

/**
 * Generate an access token.
 */
const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate a refresh token.
 */
const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // 7 days
};

/**
 * Register a new user with email and password.
 */
export const register = async (userData: Partial<TUser>): Promise<UserDocument> => {
    const existingEmail = await getUserByEmail(userData.email as string);
    if (existingEmail) {
        throw new CustomError('Email already exists', 400);
    }

    if (userData.username) {
        const existingUsername = await getUserByUsername(userData.username);
        if (existingUsername) {
            throw new CustomError('Username already exists', 400);
        }
    }

    const hashedPassword = await bcrypt.hash(userData.password!, 12);
    return await createUser({ ...userData, password: hashedPassword });
};


/**
 * Logs in a user.
 */
export const login = async (username: string, password: string): Promise<{ accessToken: string, refreshToken: string, user: UserDocument }> => {
    const user = await getUserByUsername(username);
    if (!user) {
        throw new CustomError('Wrong username or password', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password!);
    if (!passwordMatch) {
        throw new CustomError('Wrong username or password', 401);
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return { accessToken, refreshToken, user };
};

/**
 * Google login.
 */

export const googleLogin = async (googleId: string, email: string): Promise<{ accessToken: string, refreshToken: string, user: UserDocument }> => {
    let user = await getUserByGoogleId(googleId);

    if (!user) {
        user = await createUser({ 
            googleId, 
            email, 
            provider: 'google',        
        });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return { accessToken, refreshToken, user };
};

/**
 * Refreshes the user's access token.
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as jwt.JwtPayload;
        return generateAccessToken(decoded.id);
    } catch (err) {
        throw new CustomError('Invalid or expired refresh token', 401);
    }
};