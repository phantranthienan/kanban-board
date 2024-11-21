import { createApi } from '@reduxjs/toolkit/query/react';
import { LoginInput, RegisterInput } from '../../../utils/zodSchemas';
import { baseQuery } from './baseQuery';
import { TUser } from '../../../types/users';

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
