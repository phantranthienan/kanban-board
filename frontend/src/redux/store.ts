import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import { boardApi } from './slices/api/boardApiSlice';
import { authApi } from './slices/api/authApiSlice';

export const store = configureStore({
	reducer: {
		notification: notificationReducer,
		[boardApi.reducerPath]: boardApi.reducer,
		[authApi.reducerPath]: authApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(boardApi.middleware)
			.concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
