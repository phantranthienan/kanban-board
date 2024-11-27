import { Router } from 'express';
import { createSection, getSectionById, updateSection, deleteSection } from '../controllers/sectionController';
import taskRoutes from './taskRoutes';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true }); // Enable access to boardId in params

/** POST /boards/:boardId/sections - Create a new section */
router.post('/', authMiddleware, createSection);

/** GET /boards/:boardId/sections/:sectionId - Get a specific section by its ID */
router.get('/:sectionId', authMiddleware, getSectionById);

/** PUT /boards/:boardId/sections/:sectionId - Update a specific section by its ID */
router.put('/:sectionId', authMiddleware, updateSection);

/** DELETE /boards/:boardId/sections/:sectionId - Delete a specific section by its ID */
router.delete('/:sectionId', authMiddleware, deleteSection);

/** Nested routes for tasks */
router.use('/:sectionId/tasks', taskRoutes);

export default router;