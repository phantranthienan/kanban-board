import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenManager } from '../../../utils/tokenManager';

const apiEndpoint = import.meta.env.VITE_API_URL;

export const baseQuery = fetchBaseQuery({
	baseUrl: apiEndpoint,
	prepareHeaders: (headers, { endpoint }) => {
		if (endpoint !== 'login' && endpoint !== 'register') {
			const token = tokenManager.getAccessToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
		}
		return headers;
	},
});
