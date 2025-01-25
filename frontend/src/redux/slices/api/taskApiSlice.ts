import { createApi } from '@reduxjs/toolkit/query/react';
import { sectionApi } from './sectionApiSlice';
import { baseQuery } from './baseQuery';
import {
	CreateTaskRequest,
	CreateTaskResponse,
	UpdateTaskRequest,
	UpdateTaskResponse,
	DeleteTaskRequest,
	DeleteTaskResponse,
} from '../../../types/api/task';

export const taskApi = createApi({
	reducerPath: 'taskApi',
	baseQuery: baseQuery,
	tagTypes: ['Task'],
	endpoints: (builder) => ({
		// Create a new task in a section
		createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
			query: (newTask) => ({
				url: `boards/${newTask.board}/sections/${newTask.section}/tasks`, // Endpoint for creating a task
				method: 'POST',
				body: newTask,
			}),
			async onQueryStarted(_args, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(
					sectionApi.util.invalidateTags([{ type: 'Section', id: 'LIST' }]),
				);
			},
			invalidatesTags: ['Task'],
		}),

		// Update a task by ID
		updateTask: builder.mutation<UpdateTaskResponse, UpdateTaskRequest>({
			query: (updatedTask) => ({
				url: `boards/${updatedTask.board}/sections/${updatedTask.section}/tasks/${updatedTask.id}`, // Endpoint for updating a task
				method: 'PUT',
				body: updatedTask,
			}),
			async onQueryStarted(_args, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(
					sectionApi.util.invalidateTags([{ type: 'Section', id: 'LIST' }]),
				);
			},
			invalidatesTags: ['Task'],
		}),

		// Delete a task by ID
		deleteTask: builder.mutation<DeleteTaskResponse, DeleteTaskRequest>({
			query: ({ boardId, sectionId, taskId }) => ({
				url: `boards/${boardId}/sections/${sectionId}/tasks/${taskId}`, // Endpoint for deleting a task
				method: 'DELETE',
			}),
			async onQueryStarted(_args, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(
					sectionApi.util.invalidateTags([{ type: 'Section', id: 'LIST' }]),
				);
			},
			invalidatesTags: ['Task'],
		}),
	}),
});

export const {
	useCreateTaskMutation,
	useUpdateTaskMutation,
	useDeleteTaskMutation,
} = taskApi;
