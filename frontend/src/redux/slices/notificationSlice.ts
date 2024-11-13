import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
	id: string | null;
	message: string | null;
	type: 'success' | 'error' | 'info' | 'warning' | null;
}

type NotificationState = Notification;

const initialState: NotificationState = {
	id: null,
	message: null,
	type: null,
};

const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducers: {
		showNotification: (_, action: PayloadAction<Omit<Notification, 'id'>>) => {
			return { id: Date.now().toString(), ...action.payload };
		},
		clearNotification: () => initialState,
	},
});

export const { showNotification, clearNotification } =
	notificationSlice.actions;
export default notificationSlice.reducer;
