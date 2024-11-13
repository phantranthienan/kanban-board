import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const taskApi = createApi({
	reducerPath: 'taskApi',
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
