import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { LoginInput, RegisterInput } from '../../../utils/zodSchemas';
import { TUser } from '../../../types/users';

import { tokenManager } from '../../../utils/tokenManager';

const baseQuery = fetchBaseQuery({
	baseUrl: 'http://localhost:3001/api/',
	prepareHeaders: (headers, { endpoint }) => {
		// Only add token to 'getUserInfo' endpoint
		if (endpoint === 'getUserInfo') {
			const token = tokenManager.getToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
		}
		return headers;
	},
});

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: baseQuery,
	endpoints: (builder) => ({
		getUserInfo: builder.query<TUser, void>({
			query: () => 'auth/me',
		}),
		login: builder.mutation<{ token: string }, LoginInput>({
			query: (credentials) => ({
				url: 'auth/login',
				method: 'POST',
				body: credentials,
			}),
		}),
		register: builder.mutation<
			{ id: string; username: string; email: string },
			RegisterInput
		>({
			query: (newUser) => ({
				url: 'auth/register',
				method: 'POST',
				body: newUser,
			}),
		}),
	}),
});

export const { useGetUserInfoQuery, useLoginMutation, useRegisterMutation } =
	authApi;
