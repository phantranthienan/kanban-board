import { UserDocument, TUser, createUser, getUserByEmail, getUserByUsername, getUserByGoogleId, getUserById } from '../models/user.model';
import { CustomError } from '@/errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/token.util';
import { comparePassword, encryptPassword } from '@/utils/password.util';
import { generateAuthUrl, getTokenInfo } from '@/utils/googleAuth.util';

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

    const hashedPassword = await encryptPassword(userData.password as string);
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

    const passwordMatch = await comparePassword(password, user.password!);
    if (!passwordMatch) {
        throw new CustomError('Wrong username or password', 401);
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    return { accessToken, refreshToken, user };
};

/**
 * Generate Google Consent Screen URL
 */
export const getGoogleAuthUrl = (): string => {
    return generateAuthUrl();
};

/**
 * Handle Google OAuth2 Callback
 */
export const handleGoogleCallback = async (code: string) => {
    const { tokens: _, userInfo } = await getTokenInfo(code);
    const { sub: googleId, email } = userInfo;

    let user = await getUserByGoogleId(googleId) || await getUserByEmail(email);
    if (!user) {
        user = await createUser({
            googleId,
            email,
            username: email.split('@')[0],
            provider: 'google',
        });
    }

    return {
        accessToken: generateAccessToken(user._id.toString()),
        refreshToken: generateRefreshToken(user._id.toString()),
        user,
    };
};

/**
 * Refreshes the user's access token.
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
    try {
        const decoded = verifyRefreshToken(refreshToken);
        return generateAccessToken(decoded.id);
    } catch (err) {
        throw new CustomError('Invalid or expired refresh token', 401);
    }
};

/**
 * Get user information by ID.
 */
export const getMyInfo = async (userId: string): Promise<UserDocument> => {
    const user = await getUserById(userId);
    if (!user) {
        throw new CustomError('User not found', 404);
    }

    return user;
};