import axios from 'axios';
import { tokenManager } from '../../utils/tokenManager';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	timeout: 10000,
});

// Add request interceptor to attach the access token
api.interceptors.request.use(
	(config) => {
		const accessToken = tokenManager.getAccessToken();
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Add response interceptor for error handling
api.interceptors.response.use(
	(response) => response, // Pass through successful responses
	async (error) => {
		const originalRequest = error.config;
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			(error.response?.data?.message === 'Token expired' ||
				error.response?.data?.message === 'Invalid token')
		) {
			originalRequest._retry = true;
			try {
				const { data } = await api.get('/auth/access-token');
				tokenManager.setAccessToken(data.accessToken);
				axios.defaults.headers.common['Authorization'] =
					`Bearer ${data.accessToken}`;
				return api(originalRequest);
			} catch (err) {
				tokenManager.clearAccessToken();
				window.location.href = '/login';
				return Promise.reject(err);
			}
		}
		return Promise.reject(error);
	},
);

export default api;
