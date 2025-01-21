import {
	fetchBaseQuery,
	FetchArgs,
	BaseQueryFn,
} from '@reduxjs/toolkit/query/react';
import { tokenManager } from '../../../utils/tokenManager';
import axios from '../../../services/api/axiosConfig';

const apiUrl = import.meta.env.VITE_API_URL;

export const baseQuery: BaseQueryFn<
	string | FetchArgs,
	unknown,
	unknown
> = async (args, api, extraOptions) => {
	const result = await fetchBaseQuery({
		baseUrl: apiUrl,
		prepareHeaders: (headers) => {
			const token = tokenManager.getAccessToken();
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
			return headers;
		},
	})(args, api, extraOptions);

	if (result.error && result.error.status === 401) {
		try {
			const { data } = await axios.get('/auth/access-token');
			tokenManager.setAccessToken(data.accessToken);

			const retryResult = await fetchBaseQuery({
				baseUrl: apiUrl,
				prepareHeaders: (headers) => {
					const token = tokenManager.getAccessToken();
					if (token) {
						headers.set('Authorization', `Bearer ${token}`);
					}
					return headers;
				},
			})(args, api, extraOptions);

			return retryResult;
		} catch (error) {
			tokenManager.clearAccessToken();
			window.location.href = '/login';
			throw error;
		}
	}
	return result;
};

// export const baseQuery = fetchBaseQuery({
// 	baseUrl: apiEndpoint,
// 	prepareHeaders: (headers, { endpoint }) => {
// 		if (endpoint !== 'login' && endpoint !== 'register') {
// 			const token = tokenManager.getAccessToken();
// 			if (token) {
// 				headers.set('Authorization', `Bearer ${token}`);
// 			}
// 		}
// 		return headers;
// 	},
// });
