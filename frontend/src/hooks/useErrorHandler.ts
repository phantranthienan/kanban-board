import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AxiosError } from 'axios';
import { showNotification } from '../redux/slices/notificationSlice';

export const useErrorHandler = () => {
	const dispatch = useDispatch();
	// const { logout } = useAuth();

	const handleError = useCallback(
		(error: unknown) => {
			if (error instanceof AxiosError) {
				const message = error.response?.data?.message || error.message;
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
		},
		[dispatch],
	);

	return handleError;
};

// if ('status' in error) {
// 	// Handle RTK Query FetchBaseQueryError
// 	const fetchError = error as FetchBaseQueryError;
// 	let message = 'An error occurred';

// 	if ('data' in fetchError && typeof fetchError.data === 'object') {
// 		message =
// 			(fetchError.data as { message?: string })?.message || message;
// 	} else if (fetchError.status) {
// 		message = `HTTP Error: ${fetchError.status}`;
// 	}

// 	if (fetchError.status === 401) {
// 		logout();
// 	}

// 	dispatch(
// 		showNotification({
// 			message,
// 			type: 'error',
// 		}),
// 	);
// }
