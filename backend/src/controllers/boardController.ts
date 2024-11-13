import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as boardService from '../services/boardService';

export const createBoard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const boardData = { ...req.body, user: userId };
    const boardCreated = await boardService.createNewBoard(boardData);
    res.status(201).json(boardCreated);
};

export const getBoardById = async (req: Request, res: Response, next: NextFunction) => {
    const boardId = req.params.id;
    const board = await boardService.getBoard(boardId);
    res.status(200).json(board);

};

export const getUserBoards = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const boards = await boardService.getUserBoards(userId);
    res.status(200).json(boards);
};

export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
    const boardId = req.params.id;
    const updatedBoard = await boardService.updateBoard(boardId, req.body);
    res.status(200).json(updatedBoard);
}