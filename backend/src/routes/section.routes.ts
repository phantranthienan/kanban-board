import { Router } from 'express';
import { createSection, getSectionById, updateSection, deleteSection, getSectionsByBoardId } from '@/controllers/section.controller';
import taskRoutes from '@/routes/task.routes';

const router = Router({ mergeParams: true }); // Enable access to boardId in params

/** POST /boards/:boardId/sections - Create a new section */
router.post('/', createSection);

/** GET /boards/:boardId/sections - Get all sections for a board */
router.get('/', getSectionsByBoardId);

/** GET /boards/:boardId/sections/:sectionId - Get a specific section by its ID */
router.get('/:sectionId', getSectionById);

/** PUT /boards/:boardId/sections/:sectionId - Update a specific section by its ID */
router.put('/:sectionId', updateSection);

/** DELETE /boards/:boardId/sections/:sectionId - Delete a specific section by its ID */
router.delete('/:sectionId', deleteSection);

/** Nested routes for tasks */
router.use('/:sectionId/tasks', taskRoutes);

export default router;