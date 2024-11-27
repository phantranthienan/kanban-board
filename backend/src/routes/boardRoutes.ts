import express from 'express';

import * as boardController from '../controllers/boardController';
import  sectionRoutes from './sectionRoutes';
import { authMiddleware } from '../middleware/authMiddleware';
 
const router = express.Router();

/** GET /boards - Get all boards for the authenticated user */
router.get('/', authMiddleware, boardController.getUserBoards);

/** POST /boards - Create a new board */
router.post('/', authMiddleware, boardController.createBoard);

/** GET /boards/:id - Get a specific board by its ID */
router.get('/:id', authMiddleware, boardController.getBoardById);

/** PUT /boards/:id - Update a specific board by its ID */
router.put('/:id', authMiddleware, boardController.updateBoard);

/** DELETE /boards/:id - Delete a specific board by its ID */
router.delete('/:id', authMiddleware, boardController.deleteBoard);

/** Nested routes for sections */
router.use('/:boardId/sections', sectionRoutes);

export default router;