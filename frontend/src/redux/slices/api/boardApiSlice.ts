import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import {
	GetBoardRequest,
	GetBoardsRequest,
	CreateBoardRequest,
	UpdateBoardRequest,
	DeleteBoardRequest,
	UpdateBoardsPositionsRequest,
	GetBoardsResponse,
	CreateBoardResponse,
	UpdateBoardResponse,
	DeleteBoardResponse,
	GetBoardResponse,
	UpdateBoardsPositionsResponse,
} from '../../../types/api/board';

export const boardApi = createApi({
	reducerPath: 'boardApi',
	baseQuery: baseQuery,
	tagTypes: ['Board'],
	endpoints: (builder) => ({
		getBoards: builder.query<GetBoardsResponse, GetBoardsRequest>({
			query: () => 'boards',
			providesTags: ['Board'],
		}),
		getBoard: builder.query<GetBoardResponse, GetBoardRequest>({
			query: ({ id }) => `boards/${id}`,
			providesTags: ['Board'],
		}),
		createBoard: builder.mutation<CreateBoardResponse, CreateBoardRequest>({
			query: (newBoard) => ({
				url: 'boards',
				method: 'POST',
				body: newBoard,
			}),
			invalidatesTags: ['Board'],
		}),
		updateBoard: builder.mutation<UpdateBoardResponse, UpdateBoardRequest>({
			query: (updatedBoard) => ({
				url: `boards/${updatedBoard.id}`,
				method: 'PUT',
				body: updatedBoard,
			}),
			invalidatesTags: ['Board'],
		}),
		deleteBoard: builder.mutation<DeleteBoardResponse, DeleteBoardRequest>({
			query: ({ id }) => ({
				url: `boards/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Board'],
		}),
		// Update multiple boards' positions in a single request
		updateBoardsPositions: builder.mutation<
			UpdateBoardsPositionsResponse,
			UpdateBoardsPositionsRequest
		>({
			query: (boards) => ({
				url: 'boards/updatePositions',
				method: 'POST',
				body: { boards },
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
	useUpdateBoardsPositionsMutation,
} = boardApi;
