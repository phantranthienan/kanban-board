import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './baseQuery';
import { TSection } from '../../../types/sections';

type SectionTag = { type: 'Section'; id: string | 'LIST' };

export const sectionApi = createApi({
	reducerPath: 'sectionApi',
	baseQuery: baseQuery,
	tagTypes: ['Section'],
	endpoints: (builder) => ({
		// Fetch all sections for a board
		getSections: builder.query<TSection[], string>({
			query: (boardId) => `boards/${boardId}/sections`,
			providesTags: (result) =>
				result
					? [
							...result.map(
								({ id }) => ({ type: 'Section', id }) as SectionTag,
							), // Add individual sections
							{ type: 'Section' as const, id: 'LIST' } as SectionTag, // Tag for the list of sections
						]
					: [{ type: 'Section' as const, id: 'LIST' } as SectionTag], // Tag for the list of sections
		}),
		// Fetch a single section by ID
		getSectionById: builder.query<
			TSection,
			{ boardId: string; sectionId: string }
		>({
			query: ({ boardId, sectionId }) =>
				`boards/${boardId}/sections/${sectionId}`, // Include both board and section IDs
			providesTags: (result, error, { sectionId }) => [
				{ type: 'Section', id: sectionId } as SectionTag,
			],
		}),
		// Create a new section
		createSection: builder.mutation<TSection, string>({
			query: (boardId) => ({
				url: `boards/${boardId}/sections`, // Endpoint for creating a new section
				method: 'POST',
			}),
			invalidatesTags: [{ type: 'Section', id: 'LIST' } as SectionTag], // Invalidate the list to trigger a re-fetch
		}),
		// Update an existing section
		updateSection: builder.mutation<TSection, Partial<TSection>>({
			query: (updatedSection) => ({
				url: `boards/${updatedSection.board}/sections/${updatedSection.id}`, // Endpoint for updating a section
				method: 'PUT',
				body: updatedSection,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Section', id } as SectionTag,
			], // Invalidate the specific section
		}),

		// Delete an existing section
		deleteSection: builder.mutation<
			void,
			{ boardId: string; sectionId: string }
		>({
			query: ({ boardId, sectionId }) => ({
				url: `boards/${boardId}/sections/${sectionId}`, // Endpoint for deleting a section
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, { sectionId }) => [
				{ type: 'Section', id: sectionId } as SectionTag,
				{ type: 'Section', id: 'LIST' } as SectionTag, // Invalidate the list and the specific section
			],
		}),
	}),
});

export const {
	useGetSectionsQuery,
	useGetSectionByIdQuery,
	useCreateSectionMutation,
	useUpdateSectionMutation,
	useDeleteSectionMutation,
} = sectionApi;
