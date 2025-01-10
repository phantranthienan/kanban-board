import express from 'express';

import * as boardController from '../controllers/board.controller';
import { getTasksByBoardId, moveTask } from '../controllers/task.controller';
import  sectionRoutes from './section.routes';
import { authMiddleware } from '../middleware/auth.middleware';
 
const router = express.Router();

/** GET /boards - Get all boards for the authenticated user */
router.get('/', authMiddleware, boardController.getUserBoards);

/** POST /boards - Create a new board */
router.post('/', authMiddleware, boardController.createBoard);

/** GET /boards/:id - Get a specific board by its ID */
router.get('/:id', authMiddleware, boardController.getBoardById);

/** POST /boards/updatePositions - Update positions of boards */
router.post('/updatePositions', authMiddleware, boardController.updateBoardPositions);

/** PUT /boards/:id - Update a specific board by its ID */
router.put('/:id', authMiddleware, boardController.updateBoard);

/** DELETE /boards/:id - Delete a specific board by its ID */
router.delete('/:id', authMiddleware, boardController.deleteBoard);

/** GET /boards/:boardId/tasks - Get all tasks for a board */
router.get('/:boardId/tasks', authMiddleware, getTasksByBoardId);

/** PUT /boards/:boardId/tasks/:taskId/move - Move a task to a different board */
router.put('/:boardId/tasks/:taskId/move', authMiddleware, moveTask);

/** Nested routes for sections */
router.use('/:boardId/sections', sectionRoutes);

export default router;