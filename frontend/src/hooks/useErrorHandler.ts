import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { showNotification } from '../redux/slices/notificationSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useErrorHandler = () => {
	const dispatch = useDispatch();

	const handleError = useCallback(
		(error: unknown) => {
			let message = 'An unknown error occurred.';

			if (error instanceof AxiosError) {
				message = error.response?.data?.message || error.message;
			} else if (
				error &&
				typeof error === 'object' &&
				'status' in error &&
				'data' in error
			) {
				const fetchError = error as FetchBaseQueryError;
				if (typeof fetchError.data === 'string') {
					message = fetchError.data;
				} else if (fetchError.data && typeof fetchError.data === 'object') {
					message =
						(fetchError.data as { message?: string }).message ||
						JSON.stringify(fetchError.data);
				} else {
					message = fetchError.status ? `Error ${fetchError.status}` : message;
				}
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
