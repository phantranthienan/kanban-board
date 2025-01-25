import { TTask } from '../common/task';

// Create a new task
export type CreateTaskRequest = Omit<TTask, 'id'>;
export type CreateTaskResponse = TTask;

// Update a task
export type UpdateTaskRequest = Partial<TTask> & { id: string }; // Ensure `id` is included
export type UpdateTaskResponse = TTask;

// Delete a task
export type DeleteTaskRequest = {
	boardId: string;
	sectionId: string;
	taskId: string;
};
export type DeleteTaskResponse = void;
