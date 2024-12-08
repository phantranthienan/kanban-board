import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { tokenManager } from '../../../utils/tokenManager';

export const baseQuery = fetchBaseQuery({
	baseUrl: 'https://kanban-board-backend-zr7m.onrender.com/api/',
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
