import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { AppDispatch } from '../redux/store';
import { showNotification } from '../redux/slices/notificationSlice';
import { NavigateFunction } from 'react-router-dom';

export const handleError = (
	error: unknown,
	dispatch: AppDispatch,
	navigate: NavigateFunction, // Pass the navigate function
	logout: () => void, // Pass the logout function
) => {
	if (error && typeof error === 'object') {
		if ('status' in error) {
			// Handle RTK Query FetchBaseQueryError
			const fetchError = error as FetchBaseQueryError;
			let message = 'An error occurred';

			if ('data' in fetchError && typeof fetchError.data === 'object') {
				message = (fetchError.data as { message?: string })?.message || message;
			} else if (fetchError.status) {
				message = `HTTP Error: ${fetchError.status}`;
			}

			if (fetchError.status === 401) {
				// Redirect to login if status is 401
				logout();
			}

			dispatch(
				showNotification({
					message,
					type: 'error',
				}),
			);
		} else if (error instanceof Error) {
			dispatch(
				showNotification({
					message: error.message,
					type: 'error',
				}),
			);
		} else {
			dispatch(
				showNotification({
					message: 'An unknown error occurred.',
					type: 'error',
				}),
			);
		}
	}
};
