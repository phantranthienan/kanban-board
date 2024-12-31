import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { showNotification } from '../redux/slices/notificationSlice';
import useAuth from './useAuth';

export const useErrorHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleError = useCallback(
		(error: unknown) => {
			if (error && typeof error === 'object') {
				if ('status' in error) {
					// Handle RTK Query FetchBaseQueryError
					const fetchError = error as FetchBaseQueryError;
					let message = 'An error occurred';

					if ('data' in fetchError && typeof fetchError.data === 'object') {
						message =
							(fetchError.data as { message?: string })?.message || message;
					} else if (fetchError.status) {
						message = `HTTP Error: ${fetchError.status}`;
					}

					if (fetchError.status === 401) {
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
		},
		[dispatch, navigate],
	);

	return handleError;
};
