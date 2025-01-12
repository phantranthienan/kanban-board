import { Router } from 'express';
import { createTask, getTaskById, updateTask, deleteTask, getTasksBySectionId } from '@/controllers/task.controller';

const router = Router({ mergeParams: true }); // Enable access to parent route parameters

/** POST /boards/:boardId/sections/:sectionId/tasks - Create a new task in a specific section */
router.post('/', createTask);

/** GET /boards/:boardId/sections/:sectionId/tasks - Get all tasks for a section */
router.get('/', getTasksBySectionId);

/** GET /boards/:boardId/sections/:sectionId/tasks/:taskId - Get a specific task by its ID */
router.get('/:taskId', getTaskById);

/** PUT /boards/:boardId/sections/:sectionId/tasks/:taskId - Update a task by its ID */
router.put('/:taskId', updateTask);

/** DELETE /boards/:boardId/sections/:sectionId/tasks/:taskId - Delete a task by its ID */
router.delete('/:taskId', deleteTask);

export default router;
