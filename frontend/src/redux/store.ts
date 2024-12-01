import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import { authApi } from './slices/api/authApiSlice';
import { boardApi } from './slices/api/boardApiSlice';
import { sectionApi } from './slices/api/sectionApiSlice';
import { taskApi } from './slices/api/taskApiSlice';

export const store = configureStore({
	reducer: {
		notification: notificationReducer,
		[authApi.reducerPath]: authApi.reducer,
		[boardApi.reducerPath]: boardApi.reducer,
		[sectionApi.reducerPath]: sectionApi.reducer,
		[taskApi.reducerPath]: taskApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware()
			.concat(authApi.middleware)
			.concat(boardApi.middleware)
			.concat(sectionApi.middleware)
			.concat(taskApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
