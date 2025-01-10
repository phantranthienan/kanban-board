import mongoose,{ Schema, InferSchemaType, HydratedDocument } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }, 
    password: {
        type: String,
        required: true,
    },
});

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
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
export const createUser = async (userData: TUser): Promise<UserDocument> => {
    const user = new User(userData);
    return await user.save();
}

/**
 * Find a user by their ID.
 * @param {string} id - The ID of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */
export const getUserById = async (id: string): Promise<UserDocument | null> => {
    return await User.findById(id);
};

/**
 * Find a user by their username.
 * @param {string} username - The username of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */
export const getUserByUsername = async (username: string): Promise<UserDocument | null> => {
    return await User.findOne({ username });
}

/**
 * Find a user by their email.
 * @param {string} email - The email of the user to find.
 * @return {Promise<UserDocument | null>} The found user document or null if not found.
 */

export const getUserByEmail = async (email: string): Promise<UserDocument | null> => {
    return await User.findOne({ email });
}

/**
 * Update a user's information by id.
 * @param {string} id - The ID of the user to update.
 * @param {Partial<TUser>} updateData - Partial data to update the user document.
 * @return {Promise<UserDocument | null>}The updated user document or throws an error if not found.
 */
export const updateUserById = async (id: string, updateData: Partial<TUser>): Promise<UserDocument | null> => {
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    return user;
};

/**
 * Delete a user by id.
 * @param {string} id - The ID of the user to delete.
 * @return {Promise<UserDocument | null>} The deleted user document or null if not found.
 */
export const deleteUserById = async (id: string): Promise<UserDocument | null> => {
    return await User.findByIdAndDelete(id);
};
