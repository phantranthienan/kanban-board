import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { AppDispatch } from '../redux/store';
import { showNotification } from '../redux/slices/notificationSlice';

export const handleError = (error: unknown, dispatch: AppDispatch) => {
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
