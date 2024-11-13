import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TBoard, TBoards } from '../../../types/boards';

export const boardApi = createApi({
	reducerPath: 'boardApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://localhost:3001/api/',
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('token');
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['Board'],
	endpoints: (builder) => ({
		getBoards: builder.query<TBoards, void>({
			query: () => 'boards',
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
		getBoard: builder.query<TBoard, string>({
			query: (id) => `boards/${id}`,
			providesTags: ['Board'],
		}),
	}),
});

export const {
	useGetBoardsQuery,
	useCreateBoardMutation,
	useUpdateBoardMutation,
	useGetBoardQuery,
} = boardApi;
