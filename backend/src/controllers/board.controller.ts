import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import * as boardService from '@/services/board.service';
import { CustomError } from '@/errors';

/**
 * Create a new board for the authenticated user.
 * @route POST /boards
 */
export const createBoard = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const boardData = { ...req.body, user: userId };
    const boardCreated = await boardService.createNewBoard(boardData);
    res.status(201).json(boardCreated);
};

/**
 * Get a specific board by its ID.
 * @route GET /boards/:id
 */
export const getBoardById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const boardId = req.params.id;
    const board = await boardService.getBoard(boardId);

    if (board?.user.toString() !== req.user!.id) {
        return next(new CustomError('Unauthorized access', 403));
    }
    res.status(200).json(board);
};

/**
 * Get all boards for the authenticated user.
 * @route GET /boards
 */
export const getUserBoards = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const boards = await boardService.getUserBoards(userId);
    res.status(200).json(boards);
};

/**
 * Update a specific board by its ID.
 * @route PUT /boards/:id
 */
export const updateBoard = async (req: Request, res: Response) => {
    const boardId = req.params.id;
    const updatedBoard = await boardService.updateBoard(boardId, req.body);
    res.status(200).json(updatedBoard);
};

/**
 * Delete a specific board by its ID.
 * @route DELETE /boards/:id
 */
export const deleteBoard = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const boardId = req.params.id;
    await boardService.deleteAndReorderBoards(userId, boardId);
    res.status(204).send();
};

/**
 * Update positions of boards.
 * @route PUT /boards/updatePositions
 */
export const reorderBoards = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const boards = req.body.boards;
    await boardService.reorderBoards(userId, boards);
    res.status(200).send();
};