import React, { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { useParams, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../hooks/storeHooks';
import { showNotification } from '../redux/slices/notificationSlice';
import {
	useGetBoardQuery,
	useUpdateBoardMutation,
	useDeleteBoardMutation,
} from '../redux/slices/api/boardApiSlice';

import { Box, Divider } from '@mui/material';
import Loading from '../components/common/Loading';
import BoardHeader from '../components/Board/BoardHeader';
import BoardBody from '../components/Board/BoardBody';

const Board: React.FC = () => {
	const { boardId } = useParams();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	// Handle Board data
	const {
		data: board,
		isLoading: isBoardLoading,
		isSuccess: isBoardSuccess,
	} = useGetBoardQuery(boardId as string);
	const [updateBoard] = useUpdateBoardMutation();
	const [deleteBoard] = useDeleteBoardMutation();

	const [title, setTitle] = useState<string>('');

	useEffect(() => {
		if (isBoardSuccess) {
			setTitle(board.title);
		}
	}, [isBoardSuccess, board]);

	// Debounced function to update the board title
	const debouncedUpdateTitle = useMemo(() => {
		return debounce((newTitle: string) => {
			updateBoard({ id: boardId as string, title: newTitle });
		}, 500);
	}, [updateBoard, boardId]);

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		debouncedUpdateTitle(newTitle);
	};

	const handleDeleteBoard = async () => {
		if (boardId) {
			await deleteBoard(boardId).unwrap();
			dispatch(
				showNotification({
					message: 'Board deleted',
					type: 'success',
				}),
			);
			navigate('/boards');
		}
	};

	const handleEmojiSelect = (emoji: string) => {
		updateBoard({ id: boardId as string, icon: emoji });
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
			}}
		>
			{isBoardLoading && <Loading fullHeight />}
			{board && (
				<BoardHeader
					title={title}
					icon={board.icon}
					onTitleChange={handleTitleChange}
					onEmojiSelect={handleEmojiSelect}
					onDelete={handleDeleteBoard}
				/>
			)}

			<Divider />

			<BoardBody boardId={boardId as string} />
		</Box>
	);
};

export default Board;
