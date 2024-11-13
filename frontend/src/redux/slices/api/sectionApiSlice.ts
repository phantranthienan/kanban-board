import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const sectionApi = createApi({
	reducerPath: 'sectionApi',
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
	tagTypes: ['Section'],
	endpoints: (builder) => ({
		getSections: builder.query({
			query: () => 'sections',
			providesTags: ['Section'],
		}),
		createSection: builder.mutation({
			query: (newSection) => ({
				url: 'sections',
				method: 'POST',
				body: newSection,
			}),
			invalidatesTags: ['Section'],
		}),
	}),
});
