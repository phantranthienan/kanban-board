import { Router } from 'express';
import { createTask, getTaskById, updateTask, deleteTask, getTasksBySectionId } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true }); // Enable access to parent route parameters

/** POST /boards/:boardId/sections/:sectionId/tasks - Create a new task in a specific section */
router.post('/', authMiddleware, createTask);

/** GET /boards/:boardId/sections/:sectionId/tasks - Get all tasks for a section */
router.get('/', authMiddleware, getTasksBySectionId);

/** GET /boards/:boardId/sections/:sectionId/tasks/:taskId - Get a specific task by its ID */
router.get('/:taskId', authMiddleware, getTaskById);

/** PUT /boards/:boardId/sections/:sectionId/tasks/:taskId - Update a task by its ID */
router.put('/:taskId', authMiddleware, updateTask);

/** DELETE /boards/:boardId/sections/:sectionId/tasks/:taskId - Delete a task by its ID */
router.delete('/:taskId', authMiddleware, deleteTask);

export default router;
