import { CustomError } from "../errors/CustomError";
import { 
    BoardDocument, 
    TBoard, 
    createBoard, 
    getBoardsByUserId, 
    getBoardById,
    updateBoardById,
    deleteBoardById 
} from "../models/boardModel";

/**
 * Create a new board for a user.
 * The position of the new board is set based on the number of existing boards the user has.
 * @param {Omit<TBoard, 'position'>} boardData - The data for the new board without the position field.
 * @return {Promise<BoardDocument>} The created board document.
 */
export const createNewBoard = async (boardData: Omit<TBoard, 'position'>): Promise<BoardDocument> => {
    try {
        const userBoards = await getBoardsByUserId(boardData.user.toString());
        const data = { ...boardData, position: userBoards.length };
        return await createBoard(data);
    } catch (error) {
        throw new CustomError('Failed to create board', 500);
    }
}

/**
 * Retrieve all boards for a given user.
 * @param {string} userId - The ID of the user whose boards need to be fetched.
 * @return {Promise<BoardDocument[]>} An array of the user's boards.
 */
export const getUserBoards = async (userId: string): Promise<BoardDocument[]> => {
    try {
        return await getBoardsByUserId(userId);
    } catch (error) {
        throw new CustomError('Failed to get user boards', 500);
    }
}

/**
 * Retrieve a specific board by its ID.
 * @param {string} boardId - The ID of the board to fetch.
 * @return {Promise<BoardDocument | null>} The board document if found, otherwise null.
 */
export const getBoard = async (boardId: string): Promise<BoardDocument | null> => {
    const board = await getBoardById(boardId);
    if (!board) {
        throw new CustomError('Board not found', 404);
    }
    return board;
}

/**
 * Update an existing board by its ID.
 * @param {string} boardId - The ID of the board to update.
 * @param {Partial<TBoard>} boardData - The data to update the board with.
 * @return {Promise<BoardDocument | null>} The updated board document if found, otherwise null.
 */
export const updateBoard = async (boardId: string, boardData: Partial<TBoard>): Promise<BoardDocument | null> => {
    const updatedBoard = await updateBoardById(boardId, boardData);
    if (!updatedBoard) {
        throw new CustomError('Board not found', 404);
    }
    return updatedBoard;
}

/**
 * Delete a specific board by its ID.
 * @param {string} boardId - The ID of the board to delete.
 * @return {Promise<BoardDocument | null>} The deleted board document if found, otherwise null.
 */
export const deleteBoard = async (boardId: string): Promise<BoardDocument | null> => {
    const deletedBoard = await deleteBoardById(boardId);
    if (!deletedBoard) {
        throw new CustomError('Board not found', 404);
    }
    return deletedBoard;
}
