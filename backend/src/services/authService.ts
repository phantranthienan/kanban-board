import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserDocument, TUser, createUser, getUserByEmail, getUserByUsername, getUserById } from '../models/userModel';
import { CustomError } from '../errors/CustomError';
import { config } from '../config';

export const registerUser = async (userData: TUser): Promise<UserDocument> => {
    const existingUser = await getUserByUsername(userData.username);
    if (existingUser) {
        throw new CustomError('Username already exists', 400);
    };
    
    const existingEmail = await getUserByEmail(userData.email);
    if (existingEmail) {
        throw new CustomError('Email already exists', 400);
    };

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return await createUser({ ...userData, password: hashedPassword });
};

export const loginUser = async (username: string, password: string): Promise<string> => {
    const user = await getUserByUsername(username);
    if (!user) {
        throw new CustomError('Wrong username or password', 401);
    };

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new CustomError('Wrong username or password', 401);
    };

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '1d' });
    return token;
};

export const getUserInfo = async (userId: string): Promise<UserDocument | null> => {
    const user = await getUserById(userId);
    if (!user) {
        throw new CustomError('User not found', 404);
    }
    return user;
};