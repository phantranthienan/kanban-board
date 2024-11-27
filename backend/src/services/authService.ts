import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { UserDocument, TUser, createUser, getUserByEmail, getUserByUsername, getUserById } from '../models/userModel';
import { CustomError } from '../errors/CustomError';
import { config } from '../config';

/**
 * Registers a new user.
 * Validates that the username and email are unique, hashes the user's password,
 * and creates a new user document in the database.
 * @param {TUser} userData - The user data for registration.
 * @return {Promise<UserDocument>} The created user document.
 * @throws {CustomError} Throws an error if the username or email already exists.
 */
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

/**
 * Logs in a user.
 * Authenticates the user by comparing the provided password with the hashed password
 * in the database, and generates a JWT token for the session.
 * @param {string} username - The username of the user attempting to log in.
 * @param {string} password - The user's password.
 * @return {Promise<string>} The JWT token for the user session.
 * @throws {CustomError} Throws an error if the username does not exist or the password is incorrect.
 */
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

/**
 * Retrieves user information by user ID.
 * Fetches the user document from the database based on the provided ID.
 * @param {string} userId - The ID of the user to retrieve.
 * @return {Promise<UserDocument | null>} The user document if found.
 * @throws {CustomError} Throws an error if the user is not found.
 */
export const getUserInfo = async (userId: string): Promise<UserDocument | null> => {
    const user = await getUserById(userId);
    if (!user) {
        throw new CustomError('User not found', 404);
    }
    return user;
};
