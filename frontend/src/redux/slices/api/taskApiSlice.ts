import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { TTask } from '../../../types/tasks';

type TaskTag = { type: 'Task'; id: string | 'BOARD' | `SECTION_${string}` };

export const taskApi = createApi({
	reducerPath: 'taskApi',
	baseQuery: baseQuery,
	tagTypes: ['Task'],
	endpoints: (builder) => ({
		// Fetch all tasks for a specific board
		getTasksOfBoard: builder.query<TTask[], string>({
			query: (boardId) => `boards/${boardId}/tasks`, // Endpoint for fetching tasks
			providesTags: (result) =>
				result
					? [
							...result.map(
								(task) => ({ type: 'Task', id: task.id }) as TaskTag,
							),
							{ type: 'Task', id: 'BOARD' }, // Tag for board-level cache
						]
					: [{ type: 'Task', id: 'BOARD' }],
		}),

		// Fetch all tasks for a specific section
		getTasksOfSection: builder.query<
			TTask[],
			{ boardId: string; sectionId: string }
		>({
			query: ({ boardId, sectionId }) =>
				`boards/${boardId}/sections/${sectionId}/tasks`, // Endpoint for fetching tasks
			providesTags: (result, error, { sectionId }) =>
				result
					? [
							...result.map(
								(task) => ({ type: 'Task', id: task.id }) as TaskTag,
							),
							{ type: 'Task', id: `SECTION_${sectionId}` }, // Tag for section-level cache
						]
					: [{ type: 'Task', id: `SECTION_${sectionId}` }],
		}),

		// Fetch a specific task by ID
		getTaskById: builder.query<
			TTask,
			{ boardId: string; sectionId: string; taskId: string }
		>({
			query: ({ boardId, sectionId, taskId }) =>
				`boards/${boardId}/sections/${sectionId}/tasks/${taskId}`, // Endpoint for fetching a specific task
			providesTags: (result, error, { taskId }) => [
				{ type: 'Task', id: taskId },
			],
		}),

		// Create a new task in a section
		createTask: builder.mutation<TTask, Omit<TTask, 'id' | 'position'>>({
			query: (newTask) => ({
				url: `boards/${newTask.board}/sections/${newTask.section}/tasks`, // Endpoint for creating a task
				method: 'POST',
				body: newTask,
			}),
			invalidatesTags: (result, error, { section }) => [
				{ type: 'Task', id: `SECTION_${section}` },
				{ type: 'Task', id: 'BOARD' }, // Invalidate board-level cache
			],
		}),

		// Update a task by ID
		updateTask: builder.mutation<TTask, Partial<TTask>>({
			query: (updatedTask) => ({
				url: `boards/${updatedTask.board}/sections/${updatedTask.section}/tasks/${updatedTask.id}`, // Endpoint for updating a task
				method: 'PUT',
				body: updatedTask,
			}),
			invalidatesTags: (result, error, { id, section }) => [
				{ type: 'Task', id },
				{ type: 'Task', id: `SECTION_${section}` },
				{ type: 'Task', id: 'BOARD' }, // Invalidate board-level cache
			],
		}),

		// Delete a task by ID
		deleteTask: builder.mutation<
			void,
			{ boardId: string; sectionId: string; taskId: string }
		>({
			query: ({ boardId, sectionId, taskId }) => ({
				url: `boards/${boardId}/sections/${sectionId}/tasks/${taskId}`, // Endpoint for deleting a task
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, { sectionId, taskId }) => [
				{ type: 'Task', id: taskId }, // Invalidate the deleted task
				{ type: 'Task', id: `SECTION_${sectionId}` }, // Invalidate section-level cache
				{ type: 'Task', id: 'BOARD' }, // Invalidate board-level cache
			],
		}),

		// Move a task to another section or reorder tasks
		moveTask: builder.mutation<
			void,
			{
				taskId: string;
				boardId: string;
				fromSection: string;
				toSection: string;
				position: number;
			}
		>({
			query: ({ taskId, boardId, fromSection, toSection, position }) => ({
				url: `boards/${boardId}/tasks/${taskId}/move`, // Backend endpoint for moving tasks
				method: 'PUT',
				body: { fromSection, toSection, position },
			}),
			invalidatesTags: (result, error, { fromSection, toSection }) => [
				{ type: 'Task', id: `SECTION_${fromSection}` }, // Invalidate source section cache
				{ type: 'Task', id: `SECTION_${toSection}` }, // Invalidate target section cache
				{ type: 'Task', id: 'BOARD' }, // Invalidate board-level cache
			],
		}),
	}),
});

export const {
	useGetTasksOfBoardQuery,
	useGetTasksOfSectionQuery,
	useGetTaskByIdQuery,
	useCreateTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
	useMoveTaskMutation,
} = taskApi;
