import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from '../hooks/useErrorHandler';

import { useCreateBoardMutation } from '../redux/slices/api/boardApiSlice';
import { useAppDispatch } from '../hooks/storeHooks';
import { showNotification } from '../redux/slices/notificationSlice';

import { Box, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const Home: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleError = useErrorHandler();

	const [createBoard, { isLoading }] = useCreateBoardMutation();

	const handleCreateBoard = async () => {
		try {
			const data = await createBoard({}).unwrap();
			dispatch(
				showNotification({
					message: 'Board created successfully',
					type: 'success',
				}),
			);
			navigate(`/boards/${data!.id}`);
		} catch (error: unknown) {
			handleError(error);
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
