import { CustomError } from "@/errors";
import { 
    BoardDocument, 
    TBoard, 
    createBoard, 
    getBoardsByUserId, 
    getBoardById,
    updateBoardById,
    deleteBoardById,
    bulkUpdatePositions, 
} from "@/models/board.model";

/**
 * Create a new board for a user.
 * @param {Omit<TBoard, 'position'>} boardData - New board data without position.
 * @return {Promise<BoardDocument>} The created board.
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
 * Retrieve all boards for a user.
 * @param {string} userId - User ID.
 * @return {Promise<BoardDocument[]>} User's boards.
 */
export const getUserBoards = async (userId: string): Promise<BoardDocument[]> => {
    try {
        return await getBoardsByUserId(userId);
    } catch (error) {
        throw new CustomError('Failed to get user boards', 500);
    }
}

/**
 * Retrieve a board by its ID.
 * @param {string} boardId - Board ID.
 * @return {Promise<BoardDocument | null>} The board or null.
 */
export const getBoard = async (boardId: string): Promise<BoardDocument | null> => {
    const board = await getBoardById(boardId);
    if (!board) {
        throw new CustomError('Board not found', 404);
    }
    return board;
}

/**
 * Update a board by its ID.
 * @param {string} boardId - Board ID.
 * @param {Partial<TBoard>} boardData - Data to update.
 * @return {Promise<BoardDocument | null>} The updated board or null.
 */
export const updateBoard = async (boardId: string, boardData: Partial<TBoard>): Promise<BoardDocument | null> => {
    const updatedBoard = await updateBoardById(boardId, boardData);
    if (!updatedBoard) {
        throw new CustomError('Board not found', 404);
    }
    return updatedBoard;
}

/**
 * Delete a board and reorder remaining boards.
 * @param userId - User ID.
 * @param boardId - Board ID.
 * @returns A promise that resolves when done.
 * @throws {CustomError} If the board is not found.
 */
export const deleteAndReorderBoards = async (
    userId: string,
    boardId: string
): Promise<void> => {
    const boardToDelete = await getBoardById(boardId);
    if (!boardToDelete) {
        throw new CustomError('Board not found', 404);
    }
    await deleteBoardById(boardId);
    const boardsToUpdate = await getBoardsByUserId(userId);
    const updates = boardsToUpdate
        .filter((board) => board.position > boardToDelete.position)
        .map((board) =>
            updateBoardById(board.id, { position: board.position - 1 })
        );
    await Promise.all(updates);
};

/**
 * Update board positions for a user.
 * @param {string} userId - User ID.
 * @param {string[]} boardIds - Board IDs in new order.
 * @return {Promise<BoardDocument[]>} Updated boards.
 */
export const reorderBoards = async (userId: string, boards: {id: string, position: number}[]): Promise<void> => {
    await bulkUpdatePositions(userId, boards);
};
