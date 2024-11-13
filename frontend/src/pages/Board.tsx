import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
	useGetBoardQuery,
	useUpdateBoardMutation,
} from '../redux/slices/api/boardApiSlice';
import { debounce } from 'lodash';

import { Box, InputBase, Stack, IconButton, Divider } from '@mui/material';
import Loading from '../components/Loading';
import EmojiPicker from '../components/EmojiPicker';

import { TBoard } from '../types/boards';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const Board: React.FC = () => {
	const { boardId } = useParams();
	const {
		data: boardData,
		isLoading,
		isSuccess,
	} = useGetBoardQuery(boardId as string);
	const [updateBoard] = useUpdateBoardMutation();

	const [board, setBoard] = useState<TBoard | null>(null);
	const [title, setTitle] = useState<string>('');

	useEffect(() => {
		if (isSuccess) {
			setBoard(boardData);
			setTitle(boardData?.title);
		}
	}, [isSuccess, boardData]);

	const debouncedUpdateBoard = useMemo(
		() =>
			debounce((newTitle: string) => {
				if (boardId) {
					updateBoard({ id: boardId, title: newTitle });
				}
			}, 500),
		[boardId, updateBoard],
	);

	const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = event.target.value;
		setTitle(newTitle);
		debouncedUpdateBoard(newTitle);
	};

	useEffect(() => {
		return () => {
			debouncedUpdateBoard.cancel();
		};
	}, [debouncedUpdateBoard]);

	const handleEmojiSelect = (emoji: string) => {
		updateBoard({ id: boardId as string, icon: emoji });
	};

	return (
		<Box>
			{isLoading && <Loading fullHeight />}
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Stack direction="row" justifyContent="center">
					<EmojiPicker
						initialEmoji={board?.icon}
						onEmojiSelect={handleEmojiSelect}
					/>
					<InputBase
						value={title}
						onChange={handleTitleChange}
						placeholder="Enter title"
						fullWidth
						sx={{
							fontWeight: 'bold',
							fontSize: '2rem',
							'& input': {
								padding: '0.5rem',
							},
						}}
					/>
				</Stack>
				<IconButton>
					<DeleteOutlineIcon fontSize="large" color="error" />
				</IconButton>
			</Stack>
			<Divider />
		</Box>
	);
};

export default Board;
