import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

import {
	useGetBoardQuery,
	useUpdateBoardMutation,
	useDeleteBoardMutation,
} from '../redux/slices/api/boardApiSlice';

import { Box, Divider } from '@mui/material';
import Loading from '../components/common/Loading';
import BoardHeader from '../components/Board/BoardHeader';

import { TBoard } from '../types/boards';

const Board: React.FC = () => {
	const { boardId } = useParams();
	const navigate = useNavigate();

	const {
		data: boardData,
		isLoading,
		isSuccess,
	} = useGetBoardQuery(boardId as string);
	const [updateBoard] = useUpdateBoardMutation();
	const [deleteBoard] = useDeleteBoardMutation();

	const [board, setBoard] = useState<TBoard | null>(null);
	const [title, setTitle] = useState<string>('');

	// Update local state when board data is successfully fetched
	useEffect(() => {
		if (isSuccess) {
			setBoard(boardData);
			setTitle(boardData?.title);
		}
	}, [isSuccess, boardData]);

	// Debounced function to update the board title
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedUpdateTitle = useCallback(
		debounce((newTitle: string) => {
			if (boardId) {
				updateBoard({ id: boardId, title: newTitle });
			}
		}, 500),
		[boardId, updateBoard],
	);

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		debouncedUpdateTitle(newTitle);
	};

	// Cleanup the debounced function on component unmount
	useEffect(() => {
		return () => debouncedUpdateTitle.cancel();
	}, [debouncedUpdateTitle]);

	const handleDeleteBoard = () => {
		if (boardId) {
			deleteBoard(boardId);
			navigate('/boards');
		}
	};
	const handleEmojiSelect = (emoji: string) => {
		updateBoard({ id: boardId as string, icon: emoji });
	};

	return (
		<Box>
			{isLoading && <Loading fullHeight />}
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
		</Box>
	);
};

export default Board;
