import { createApi } from '@reduxjs/toolkit/query/react';
import { boardApi } from './boardApiSlice';
import { baseQuery } from './baseQuery';
import {
	GetSectionsRequest,
	CreateSectionRequest,
	UpdateSectionRequest,
	DeleteSectionRequest,
	GetSectionsResponse,
	CreateSectionResponse,
	UpdateSectionResponse,
	DeleteSectionResponse,
} from '../../../types/api/section';

export const sectionApi = createApi({
	reducerPath: 'sectionApi',
	baseQuery: baseQuery,
	tagTypes: ['Section', 'Board'],
	endpoints: (builder) => ({
		getSections: builder.query<GetSectionsResponse, GetSectionsRequest>({
			query: ({ boardId }) => `boards/${boardId}/sections`,
			providesTags: [{ type: 'Section', id: 'LIST' }],
		}),
		createSection: builder.mutation<
			CreateSectionResponse,
			CreateSectionRequest
		>({
			query: ({ boardId }) => ({
				url: `boards/${boardId}/sections`,
				method: 'POST',
			}),
			async onQueryStarted({ boardId }, { dispatch, queryFulfilled }) {
				await queryFulfilled;
				dispatch(
					boardApi.util.invalidateTags([{ type: 'Board', id: boardId }]),
				);
			},
			invalidatesTags: [{ type: 'Section', id: 'LIST' }],
		}),
		// In sectionApiSlice.ts
		updateSection: builder.mutation<
			UpdateSectionResponse,
			UpdateSectionRequest
		>({
			query: ({ id, board, tasks, tasksOrder }) => {
				const taskIds = tasks?.map((task) => task.id);
				return {
					url: `boards/${board}/sections/${id}`,
					method: 'PUT',
					body: { tasks: taskIds, tasksOrder },
				};
			},
			async onQueryStarted(
				{ id, board, tasks, tasksOrder },
				{ dispatch, queryFulfilled },
			) {
				// Optimistically patch the getSections query cache for this board.
				const patchResult = dispatch(
					sectionApi.util.updateQueryData(
						'getSections',
						{ boardId: board! },
						(draft) => {
							const section = draft.find((s) => s.id === id);
							if (section) {
								section.tasks = tasks!;
								section.tasksOrder = tasksOrder!;
							}
						},
					),
				);
				try {
					await queryFulfilled;
				} catch {
					// Roll back if the server update fails.
					patchResult.undo();
				}
			},
			invalidatesTags: [{ type: 'Section', id: 'LIST' }],
		}),

		deleteSection: builder.mutation<
			DeleteSectionResponse,
			DeleteSectionRequest
		>({
			query: ({ boardId, sectionId }) => ({
				url: `boards/${boardId}/sections/${sectionId}`,
				method: 'DELETE',
			}),
			invalidatesTags: [{ type: 'Section', id: 'LIST' }],
		}),
	}),
});

export const {
	useGetSectionsQuery,
	useCreateSectionMutation,
	useUpdateSectionMutation,
	useDeleteSectionMutation,
} = sectionApi;
