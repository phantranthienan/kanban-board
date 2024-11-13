import React, { useState, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { clearNotification } from '../redux/slices/notificationSlice';

import { Snackbar, Alert } from '@mui/material';

interface NotificationsProps {
	vertical: 'top' | 'bottom';
	horizontal: 'left' | 'center' | 'right';
}

const Notifications: React.FC<NotificationsProps> = ({
	vertical,
	horizontal,
}) => {
	const notification = useAppSelector((state) => state.notification);
	const dispatch = useAppDispatch();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (notification.message) {
			setOpen(true);
		}
	}, [notification]);

	const handleClose = () => {
		setOpen(false);
		dispatch(clearNotification());
	};

	if (!notification.message) return null;

	return (
		<Snackbar
			key={notification.id}
			open={open}
			autoHideDuration={3000}
			onClose={handleClose}
			anchorOrigin={{ vertical, horizontal }}
		>
			<Alert
				onClose={handleClose}
				severity={notification.type || 'info'}
				sx={{ width: '100%' }}
			>
				{notification.message}
			</Alert>
		</Snackbar>
	);
};

export default Notifications;
