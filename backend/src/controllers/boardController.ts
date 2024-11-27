import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as boardService from '../services/boardService';
import { CustomError } from '../errors/CustomError';

/**
 * Create a new board for the authenticated user.
 * @route POST /boards
 * @param {AuthRequest} req - Express request object with authenticated user and board data.
 * @param {Response} res - Express response object.
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
 * @param {AuthRequest} req - Express request object containing boardId.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function for error handling.
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
 * @param {AuthRequest} req - Express request object with authenticated user.
 * @param {Response} res - Express response object.
 */
export const getUserBoards = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const boards = await boardService.getUserBoards(userId);
    res.status(200).json(boards);
};

/**
 * Update a specific board by its ID.
 * @route PUT /boards/:id
 * @param {Request} req - Express request object containing boardId and update data.
 * @param {Response} res - Express response object.
 */
export const updateBoard = async (req: Request, res: Response) => {
    const boardId = req.params.id;
    const updatedBoard = await boardService.updateBoard(boardId, req.body);
    res.status(200).json(updatedBoard);
};

/**
 * Delete a specific board by its ID.
 * @route DELETE /boards/:id
 * @param {Request} req - Express request object containing boardId.
 * @param {Response} res - Express response object.
 */
export const deleteBoard = async (req: Request, res: Response) => {
    const boardId = req.params.id;
    await boardService.deleteBoard(boardId);
    res.status(204).send();
};
