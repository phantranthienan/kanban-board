import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { showNotification } from '../redux/slices/notificationSlice';

export const useErrorHandler = () => {
	const dispatch = useDispatch();

	const handleError = useCallback(
		(error: unknown) => {
			let message = 'An unknown error occurred.';
			if (error instanceof AxiosError) {
				message = error.response?.data?.message || error.message;
			} else if (error instanceof Error) {
				message = error.message;
			}
			dispatch(
				showNotification({
					message,
					type: 'error',
				}),
			);
		},
		[dispatch],
	);

	return handleError;
};
