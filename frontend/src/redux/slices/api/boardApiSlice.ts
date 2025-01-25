import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import {
	GetBoardDetailsRequest,
	GetBoardsRequest,
	CreateBoardRequest,
	UpdateBoardRequest,
	DeleteBoardRequest,
	ReorderBoardsRequest,
	GetBoardsResponse,
	CreateBoardResponse,
	UpdateBoardResponse,
	DeleteBoardResponse,
	GetBoardDetailsResponse,
	ReorderBoardsResponse,
} from '../../../types/api/board';

export const boardApi = createApi({
	reducerPath: 'boardApi',
	baseQuery: baseQuery,
	tagTypes: ['Board'],
	endpoints: (builder) => ({
		getBoards: builder.query<GetBoardsResponse, GetBoardsRequest>({
			query: () => 'boards',
			providesTags: [{ type: 'Board', id: 'LIST' }],
		}),
		getBoardDetails: builder.query<
			GetBoardDetailsResponse,
			GetBoardDetailsRequest
		>({
			query: ({ id }) => `boards/${id}`,
			providesTags: (_result, _error, { id }) => [{ type: 'Board', id }],
		}),
		createBoard: builder.mutation<CreateBoardResponse, CreateBoardRequest>({
			query: (newBoard) => ({
				url: 'boards',
				method: 'POST',
				body: newBoard,
			}),
			invalidatesTags: [{ type: 'Board', id: 'LIST' }],
		}),
		updateBoard: builder.mutation<UpdateBoardResponse, UpdateBoardRequest>({
			query: (updatedBoard) => ({
				url: `boards/${updatedBoard.id}`,
				method: 'PUT',
				body: updatedBoard,
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: 'Board', id },
				{ type: 'Board', id: 'LIST' },
			],
		}),
		deleteBoard: builder.mutation<DeleteBoardResponse, DeleteBoardRequest>({
			query: ({ id }) => ({
				url: `boards/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (_result, _error, { id }) => [
				{ type: 'Board', id },
				{ type: 'Board', id: 'LIST' },
			],
		}),
		// Update multiple boards' positions in a single request
		reorderBoards: builder.mutation<
			ReorderBoardsResponse,
			ReorderBoardsRequest
		>({
			query: (boards) => ({
				url: 'boards/updatePositions',
				method: 'POST',
				body: { boards },
			}),
			invalidatesTags: [{ type: 'Board', id: 'LIST' }],
		}),
	}),
});

export const {
	useGetBoardsQuery,
	useCreateBoardMutation,
	useUpdateBoardMutation,
	useDeleteBoardMutation,
	useGetBoardDetailsQuery,
	useReorderBoardsMutation,
} = boardApi;
