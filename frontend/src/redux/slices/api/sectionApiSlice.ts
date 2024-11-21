import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';

export const sectionApi = createApi({
	reducerPath: 'sectionApi',
	baseQuery: baseQuery,
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
