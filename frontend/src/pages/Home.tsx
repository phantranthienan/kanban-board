import React from 'react';

import { useCreateBoardMutation } from '../redux/slices/api/boardApiSlice';
import { useAppDispatch } from '../hooks/storeHooks';
import { showNotification } from '../redux/slices/notificationSlice';

import { Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const Home: React.FC = () => {
	const dispatch = useAppDispatch();
	const [createBoard, { isLoading, isSuccess, isError }] =
		useCreateBoardMutation();

	const handleCreateBoard = () => {
		createBoard({});
		if (isSuccess) {
			dispatch(
				showNotification({
					message: `Board created successfully`,
					type: 'success',
				}),
			);
		} else if (isError) {
			dispatch(
				showNotification({
					message: 'Error creating board',
					type: 'error',
				}),
			);
		}
	};

	return (
		<Box
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Typography
				variant="body1"
				sx={{ textTransform: 'uppercase', textAlign: 'center' }}
			>
				Select a board from the sidebar or
			</Typography>
			<LoadingButton loading={isLoading} onClick={handleCreateBoard}>
				<Typography variant="body1">
					Click here to create a new board
				</Typography>
			</LoadingButton>
		</Box>
	);
};

export default Home;
