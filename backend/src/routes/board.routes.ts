import express from 'express';

import { getUserBoards, createBoard, getBoardById, updateBoardPositions, updateBoard, deleteBoard} from '@/controllers/board.controller';
import { getTasksByBoardId, moveTask } from '@/controllers/task.controller';
import  sectionRoutes from '@/routes/section.routes';
 
const router = express.Router();

/** GET /boards - Get all boards for the authenticated user */
router.get('/', getUserBoards);

/** POST /boards - Create a new board */
router.post('/', createBoard);

/** GET /boards/:id - Get a specific board by its ID */
router.get('/:id', getBoardById);

/** POST /boards/updatePositions - Update positions of boards */
router.post('/updatePositions', updateBoardPositions);

/** PUT /boards/:id - Update a specific board by its ID */
router.put('/:id', updateBoard);

/** DELETE /boards/:id - Delete a specific board by its ID */
router.delete('/:id', deleteBoard);

/** GET /boards/:boardId/tasks - Get all tasks for a board */
router.get('/:boardId/tasks', getTasksByBoardId);

/** PUT /boards/:boardId/tasks/:taskId/move - Move a task to a different board */
router.put('/:boardId/tasks/:taskId/move', moveTask);

/** Nested routes for sections */
router.use('/:boardId/sections', sectionRoutes);

export default router;