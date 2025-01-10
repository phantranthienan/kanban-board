import { CustomError } from "../errors";
import { 
    BoardDocument, 
    TBoard, 
    createBoard, 
    getBoardsByUserId, 
    getBoardById,
    updateBoardById,
    deleteBoardById,
    bulkUpdatePositions, 
} from "../models/board.model";

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
 * Deletes a board and reorders the remaining boards for a user.
 * @param userId - The ID of the user whose board is to be deleted.
 * @param boardId - The ID of the board to be deleted.
 * @returns A promise that resolves when the board is deleted and the remaining boards are reordered.
 * @throws {CustomError} If the board to be deleted is not found.
 */
export const deleteAndReorderBoards = async (
    userId: string,
    boardId: string
): Promise<void> => {
    // Fetch the board to be deleted
    const boardToDelete = await getBoardById(boardId);

    if (!boardToDelete) {
        throw new CustomError('Board not found', 404);
    }

    // Delete the board
    await deleteBoardById(boardId);

    // Fetch and reorder boards with positions greater than the deleted board
    const boardsToUpdate = await getBoardsByUserId(userId);
    const updates = boardsToUpdate
        .filter((board) => board.position > boardToDelete.position)
        .map((board) =>
            updateBoardById(board.id, { position: board.position - 1 })
        );

    // Perform updates in parallel
    await Promise.all(updates);
};


/**
 * Update the positions of boards for a user.
 * @param {string} userId - The ID of the user whose boards need to be updated.
 * @param {string[]} boardIds - An array of board IDs in the order they should be positioned.
 * @return {Promise<BoardDocument[]>} An array of the updated board documents.
 */
export const updateBoardPositions = async (userId: string, boards: {id: string, position: number}[]): Promise<void> => {
    await bulkUpdatePositions(userId, boards);
};
    