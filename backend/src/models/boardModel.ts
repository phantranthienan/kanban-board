import mongoose, { Schema, InferSchemaType, HydratedDocument } from "mongoose"; 
import { SectionDocument } from "./sectionModel";

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
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
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
    return await Board.findById(id).populate('sections');
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
 * Add a section to a board.
 * @param {string} boardId - The ID of the board to add the section to.
 * @param {string} sectionId - The ID of the section to add to the board.
 * @return {Promise<void>} The updated board document.
 */
export const addSectionToBoard = async (boardId: string, sectionId: string): Promise<void> => {
    await Board.findByIdAndUpdate(boardId, { $push: { sections: sectionId } }); 
};

/**
 * Remove a section from a board.
 * @param {string} boardId - The ID of the board to remove the section from.
 * @param {string} sectionId - The ID of the section to remove from the board.
 * @return {Promise<void>} The updated board document.
 */
export const removeSectionFromBoard = async (boardId: string, sectionId: string): Promise<void> => {
    await Board.findByIdAndUpdate(boardId, { $pull: { sections: sectionId } });
};
