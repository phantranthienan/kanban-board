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

export const createNewBoard = async (boardData: Omit<TBoard, 'position'>): Promise<BoardDocument> => {
    try {
        const userBoards = await getBoardsByUserId(boardData.user.toString());
        const data = { ...boardData, position: userBoards.length };
        return await createBoard(data);
    } catch (error) {
        throw new CustomError('Failed to create board', 500);
    }
}

export const getUserBoards = async (userId: string): Promise<BoardDocument[]> => {
    try {
        return await getBoardsByUserId(userId);
    } catch (error) {
        throw new CustomError('Failed to get user boards', 500);
    }
}

export const getBoard = async (boardId: string): Promise<BoardDocument | null> => {
    const board = await getBoardById(boardId);
    if (!board) {
        throw new CustomError('Board not found', 404);
    }
    return board;
}

export const updateBoard = async (boardId: string, boardData: Partial<TBoard>): Promise<BoardDocument | null> => {
    const updatedBoard = await updateBoardById(boardId, boardData);
    if (!updatedBoard) {
        throw new CustomError('Board not found', 404);
    }
    return updatedBoard;
}

export const deleteBoard = async (boardId: string): Promise<BoardDocument | null> => {
    const deletedBoard = await deleteBoardById(boardId);
    if (!deletedBoard) {
        throw new CustomError('Board not found', 404);
    }
    return deletedBoard;
}

