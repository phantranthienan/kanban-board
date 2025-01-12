import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose"; 
import { Section } from "@/models/section.model";
import { Task } from "@/models/task.model";

export const boardSchema = new Schema({
    title: {
        type: String,
        default: 'Untitled Board',
    },
    icon: {
        type: String,
        default: '📃',
    },
    description: {
        type: String,
        default: 'Add description here',
    },
    favorite: {
        type: Boolean,
        default: false,
    },
    position: {
        type: Number,
        default: 0,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sections: [{
        type: Schema.Types.ObjectId,
        ref: 'Section',
        default: [],
    }],
});

boardSchema.set('toJSON', {
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

boardSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Section.deleteMany({ board: doc._id });
        await Task.deleteMany({ board: doc._id });
    }
});

export type TBoard = InferSchemaType<typeof boardSchema>;

export type BoardDocument = HydratedDocument<TBoard>;

export const Board = mongoose.model<BoardDocument>('Board', boardSchema);

// Helper functions for board-related operations

/**
 * Create a new board.
 * @param {TBoard} data - Data for the new board document.
 * @return {Promise<BoardDocument>} The newly created board document
 */
export const createBoard = async (data: Partial<TBoard>): Promise<BoardDocument> => {
    const board = new Board(data);
    return await board.save();
}

/**
 * Find a board by its id, with populated sections.
 * @param {string} id - The ID of the board to find
 * @return {Promise<BoardDocument | null>} The board document if found, otherwise null
 */
export const getBoardById = async (id: string): Promise<BoardDocument | null> => {
    return await Board.findById(id);
};

/**
 * Find all boards of a user by user's id.
 * @param {string} userId - The ID of the user to find boards for.
 * @return {Promise<BoardDocument[]>} An array of board documents.
 */
export const getBoardsByUserId = async (userId: string): Promise<BoardDocument[]> => {
    return await Board.find({ user: userId }).sort({ position: 1 });
}

/**
 * Get number of Sections in a Board.
 * @param {string} boardId - The ID of the board to get the number of sections for.
 * @return {Promise<number>} The number of sections in the board.
 */
export const getNumberOfSectionsInBoard = async (boardId: string): Promise<number> => {
    const board = await Board.findById(boardId);
    return board ? board.sections.length : 0;
}


/**
 * Update a board by id.
 * @param {string} id - The ID of the board to update.
 * @param {Partial<TBoard>} data - Data to update the board with.
 * @return {Promise<BoardDocument | null>} The updated board document.
 */
export const updateBoardById = async (id: string, data: Partial<TBoard>): Promise<BoardDocument | null> => {
    const board = await Board.findByIdAndUpdate(id, data, { new: true });
    return board;
}

/**
 * Delete a board by id.
 * @param {string} id - The ID of the board to delete.
 * @return {Promise<BoardDocument | null>} The deleted board document.
 */
export const deleteBoardById = async (id: string): Promise<BoardDocument | null> => {
    return await Board.findByIdAndDelete(id);
}

/**
 * Bulk update positions of boards.
 * @param {string} userId - The ID of the user whose boards need to be updated.
 * @param {Array<{ id: string, position: number }>} boards - Array of board IDs and positions.
 * @return {Promise<void>}
 */
export const bulkUpdatePositions = async (userId: string, boards: Array<{ id: string, position: number }>): Promise<void> => {
    const bulkOps = boards.map(board => ({
        updateOne: {
            filter: { user: userId, _id: board.id },
            update: { position: board.position },
        }
    }));
    Board.bulkWrite(bulkOps);
};