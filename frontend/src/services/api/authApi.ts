import axios from './axiosConfig';
import {
	GetAccessTokenResponse,
	GetMeResponse,
	LoginRequest,
	LoginResponse,
	RegisterRequest,
	RegisterResponse,
} from '../../types/api/auth';
import { tokenManager } from '../../utils/tokenManager';

export const login = async (
	credentials: LoginRequest,
): Promise<LoginResponse> => {
	try {
		const { data } = await axios.post<LoginResponse>(
			'/auth/login',
			credentials,
		);
		tokenManager.setAccessToken(data.accessToken);
		return data;
	} catch (error) {
		console.error('Error logging in:', error);
		throw error; // Ensure it rejects properly
	}
};

export const register = async (
	registerData: RegisterRequest,
): Promise<RegisterResponse> => {
	try {
		const { data } = await axios.post<RegisterResponse>(
			'/auth/register',
			registerData,
		);
		return data;
	} catch (error) {
		console.error('Error registering:', error);
		throw error; // Ensure it rejects properly
	}
};
/**
 * Redirect to Google OAuth login.
 */
export const googleLogin = () => {
	window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
};

/**
 * Fetch accessToken from server and store it.
 */
export const getAccessToken = async (): Promise<GetAccessTokenResponse> => {
	try {
		const { data } =
			await axios.get<GetAccessTokenResponse>('/auth/access-token');
		tokenManager.setAccessToken(data.accessToken);
		return data;
	} catch (error) {
		console.log('Error fetching access token:', error);
		throw error; // Ensure it rejects properly
	}
};

/**
 * Logout user and clear accessToken.
 */
export const logout = async (): Promise<void> => {
	try {
		await axios.post('/auth/logout');
		tokenManager.clearAccessToken();
	} catch (error) {
		console.error('Error logging out:', error);
		throw error; // Ensure it rejects properly
	}
};

/**
 * Get user info from accessToken.
 */
export const getMyInfo = async (): Promise<GetMeResponse> => {
	try {
		const { data } = await axios.get<GetMeResponse>('/auth/me');
		return data;
	} catch (error) {
		console.error('Error fetching user info:', error);
		throw error; // Ensure it rejects properly
	}
};
