import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

import { useAppDispatch } from '../hooks/storeHooks';
import { showNotification } from '../redux/slices/notificationSlice';
import {
	useGetBoardQuery,
	useUpdateBoardMutation,
	useDeleteBoardMutation,
} from '../redux/slices/api/boardApiSlice';
import { useGetSectionsQuery } from '../redux/slices/api/sectionApiSlice';

import { Box, Divider } from '@mui/material';
import Loading from '../components/common/Loading';
import BoardHeader from '../components/Board/BoardHeader';
import BoardBody from '../components/Board/BoardBody';

import { TBoard } from '../types/boards';
import { TSection } from '../types/sections';

const Board: React.FC = () => {
	const { boardId } = useParams();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	// Handle Board data
	const {
		data: boardData,
		isLoading: isBoardLoading,
		isSuccess: isBoardSuccess,
	} = useGetBoardQuery(boardId as string);
	const [updateBoard] = useUpdateBoardMutation();
	const [deleteBoard] = useDeleteBoardMutation();

	const [board, setBoard] = useState<TBoard | null>(null);
	const [title, setTitle] = useState<string>('');

	useEffect(() => {
		if (isBoardSuccess) {
			setBoard(boardData);
			setTitle(boardData.title);
		}
	}, [isBoardSuccess, boardData]);

	// Handle Section data
	const {
		data: sectionsData,
		isLoading: isSectionsLoading,
		isSuccess: isSectionsSuccess,
	} = useGetSectionsQuery(boardId as string);

	const [sections, setSections] = useState<TSection[]>([]);

	useEffect(() => {
		if (isSectionsSuccess) {
			setSections(sectionsData);
		}
	}, [isSectionsSuccess, sectionsData]);

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
			{isBoardLoading && isSectionsLoading && <Loading fullHeight />}
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

			<BoardBody sections={sections} boardId={boardId as string} />
		</Box>
	);
};

export default Board;
