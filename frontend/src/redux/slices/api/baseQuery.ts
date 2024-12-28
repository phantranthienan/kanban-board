import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenManager } from '../../../utils/tokenManager';

const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;

export const baseQuery = fetchBaseQuery({
	baseUrl: apiEndpoint,
	prepareHeaders: (headers, { endpoint }) => {
		if (endpoint !== 'login' && endpoint !== 'register') {
			const token = tokenManager.getToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
		}
		return headers;
	},
});
