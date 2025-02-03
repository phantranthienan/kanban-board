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
		createTask: builder.mutation<CreateTaskResponse, CreateTaskRequest>({
			query: (newTask) => ({
				url: `boards/${newTask.board}/sections/${newTask.section}/tasks`,
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
		updateTask: builder.mutation<UpdateTaskResponse, UpdateTaskRequest>({
			query: (updatedTask) => ({
				url: `boards/${updatedTask.board}/sections/${updatedTask.section}/tasks/${updatedTask.id}`,
				method: 'PUT',
				body: updatedTask,
			}),
			async onQueryStarted(
				{ board, section, id, ...rest },
				{ dispatch, queryFulfilled },
			) {
				// Optimistically update the getSections cache.
				const patchResult = dispatch(
					sectionApi.util.updateQueryData(
						'getSections',
						{ boardId: board! },
						(draft) => {
							const sectionDraft = draft.find((s) => s.id === section);
							if (sectionDraft) {
								const taskIndex = sectionDraft.tasks.findIndex(
									(t) => t.id === id,
								);
								if (taskIndex !== -1) {
									sectionDraft.tasks[taskIndex] = {
										...sectionDraft.tasks[taskIndex],
										...rest,
									};
								}
							}
						},
					),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
				dispatch(
					sectionApi.util.invalidateTags([{ type: 'Section', id: 'LIST' }]),
				);
			},
			invalidatesTags: ['Task'],
		}),
		deleteTask: builder.mutation<DeleteTaskResponse, DeleteTaskRequest>({
			query: ({ boardId, sectionId, taskId }) => ({
				url: `boards/${boardId}/sections/${sectionId}/tasks/${taskId}`,
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
