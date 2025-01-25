import express from 'express';

import { getUserBoards, createBoard, getBoardById, reorderBoards, updateBoard, deleteBoard} from '@/controllers/board.controller';
import  sectionRoutes from '@/routes/section.routes';
 
const router = express.Router();

/** GET /boards - Get all boards for the authenticated user */
router.get('/', getUserBoards);

/** POST /boards - Create a new board */
router.post('/', createBoard);

/** GET /boards/:id - Get a specific board by its ID */
router.get('/:id', getBoardById);

/** POST /boards/reorder - Update positions of boards */
router.post('/reorder', reorderBoards);

/** PUT /boards/:id - Update a specific board by its ID */
router.put('/:id', updateBoard);

/** DELETE /boards/:id - Delete a specific board by its ID */
router.delete('/:id', deleteBoard);

/** Nested routes for sections */
router.use('/:boardId/sections', sectionRoutes);

export default router;