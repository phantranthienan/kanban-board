import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const taskApi = createApi({
	reducerPath: 'taskApi',
	baseQuery: baseQuery,
	tagTypes: ['Task'],
	endpoints: (builder) => ({
		getTasks: builder.query({
			query: () => 'tasks',
			providesTags: ['Task'],
		}),
		createTask: builder.mutation({
			query: (newTask) => ({
				url: 'tasks',
				method: 'POST',
				body: newTask,
			}),
			invalidatesTags: ['Task'],
		}),
	}),
});
