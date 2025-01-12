import mongoose,{ Schema, InferSchemaType, HydratedDocument } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    }, 
    password: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
});

userSchema.set('toJSON', {
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

userSchema.pre('save', async function (next) {
    if (!this.username && this.googleId) {
        this.username = this.email.split('@')[0];
    }
    next();
});

export type TUser = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<TUser>;

export const User = mongoose.model<UserDocument>('User', userSchema);

// Helper functions for user-related operations

/**
 * Create a new user.
 * @param {TUser} userData - Data for the new user document.
 * @return {Promise<UserDocument>} The created user document.
 */
export const createUser = async (userData: Partial<TUser>): Promise<UserDocument> => {
    try {
        const user = new User(userData);
        return await user.save();
    } catch (error) {
        throw new Error(`Error creating user: ${error}`);
    }
}

/**
 * Find a user by their ID.
 * @param {string} id - The ID of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */
export const getUserById = async (id: string): Promise<UserDocument | null> => {
    try {
        return await User.findById(id);
    } catch (error) {
        throw new Error(`Error finding user by ID: ${error}`);
    }
};

/**
 * Find a user by their username.
 * @param {string} username - The username of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */
export const getUserByUsername = async (username: string): Promise<UserDocument | null> => {
    try {
        return await User.findOne({ username });
    } catch (error) {
        throw new Error(`Error finding user by username: ${error}`);
    }
}

/**
 * Find a user by their email.
 * @param {string} email - The email of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */
export const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error(`Error finding user by email: ${error}`);
    }
}

/**
 * Find a user by their google ID.
 * @param {string} googleId - The google ID of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */
export const getUserByGoogleId = async (googleId: string): Promise<UserDocument | null> => {
    try {
        return await User.findOne({ googleId });
    } catch (error) {
        throw new Error(`Error finding user by google ID: ${error}`);
    }
}

/**
 * Update a user's information by id.
 * @param {string} id - The ID of the user to update.
 * @param {Partial<TUser>} updateData - Partial data to update the user document.
 * @return {Promise<UserDocument | null>}The updated user document or throws an error if not found.
 */
export const updateUserById = async (id: string, updateData: Partial<TUser>): Promise<UserDocument | null> => {
    try {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
        throw new Error(`Error updating user by ID: ${error}`);
    }
};

/**
 * Delete a user by id.
 * @param {string} id - The ID of the user to delete.
 * @return {Promise<UserDocument | null>} The deleted user document or null if not found.
 */
export const deleteUserById = async (id: string): Promise<UserDocument | null> => {
    try {
        return await User.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Error deleting user by ID: ${error}`);
    }
};

/**
 * Delete all users.
 * @return {Promise<void>} A promise that resolves when all users are deleted.
 */
export const deleteAllUsers = async (): Promise<void> => {
    try {
        await User.deleteMany({});
    } catch (error) {
        throw new Error(`Error deleting all users: ${error}`);
    }
}