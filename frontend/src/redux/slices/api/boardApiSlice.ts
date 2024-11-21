import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { TBoard, TBoards } from '../../../types/boards';

export const boardApi = createApi({
	reducerPath: 'boardApi',
	baseQuery: baseQuery,
	tagTypes: ['Board'],
	endpoints: (builder) => ({
		getBoards: builder.query<TBoards, void>({
			query: () => 'boards',
			providesTags: ['Board'],
		}),
		getBoard: builder.query<TBoard, string>({
			query: (id) => `boards/${id}`,
			providesTags: ['Board'],
		}),
		createBoard: builder.mutation<TBoard, Partial<TBoard>>({
			query: (newBoard) => ({
				url: 'boards',
				method: 'POST',
				body: newBoard,
			}),
			invalidatesTags: ['Board'],
		}),
		updateBoard: builder.mutation<TBoard, Partial<TBoard>>({
			query: (updatedBoard) => ({
				url: 'boards/' + updatedBoard.id,
				method: 'PUT',
				body: updatedBoard,
			}),
			invalidatesTags: ['Board'],
		}),
		deleteBoard: builder.mutation<void, string>({
			query: (id) => ({
				url: 'boards/' + id,
				method: 'DELETE',
			}),
			invalidatesTags: ['Board'],
		}),
	}),
});

export const {
	useGetBoardsQuery,
	useCreateBoardMutation,
	useUpdateBoardMutation,
	useDeleteBoardMutation,
	useGetBoardQuery,
} = boardApi;