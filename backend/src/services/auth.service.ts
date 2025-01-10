import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserDocument, TUser, createUser, getUserByEmail, getUserByUsername, getUserById } from '../models/user.model';
import { CustomError } from '../errors';
import { config } from '../config';

// Generate access token
const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, config.JWT_SECRET, { expiresIn: '1h' });
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // 7 days
};

/**
 * Registers a new user.
 */
export const registerUser = async (userData: TUser): Promise<UserDocument> => {
    const existingUser = await getUserByUsername(userData.username);
    if (existingUser) {
        throw new CustomError('Username already exists', 400);
    }

    const existingEmail = await getUserByEmail(userData.email);
    if (existingEmail) {
        throw new CustomError('Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    return await createUser({ ...userData, password: hashedPassword });
};


/**
 * Logs in a user.
 */
export const loginUser = async (username: string, password: string): Promise<{ token: string, refreshToken: string, user: UserDocument }> => {
    const user = await getUserByUsername(username);
    if (!user) {
        throw new CustomError('Wrong username or password', 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new CustomError('Wrong username or password', 401);
    }

    const token = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return { token, refreshToken, user };
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