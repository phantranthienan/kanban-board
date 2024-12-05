import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
	useGetBoardsQuery,
	useUpdateBoardMutation,
	useCreateBoardMutation,
} from '../../redux/slices/api/boardApiSlice';
import { showNotification } from '../../redux/slices/notificationSlice';
import { useAppDispatch } from '../../hooks/storeHooks';

import {
	Drawer,
	List,
	ListItem,
	ListItemButton,
	IconButton,
	Typography,
	Box,
	Divider,
	Avatar,
	Stack,
	Collapse,
} from '@mui/material';

import BoardLink from './BoardLink';
import Loading from '../common/Loading';

import { handleError } from '../../utils/errorHandler';

import LogoutIcon from '@mui/icons-material/Logout';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
	DndContext,
	useSensor,
	useSensors,
	PointerSensor,
	closestCenter,
	DragEndEvent,
} from '@dnd-kit/core';

import {
	arrayMove,
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { stringToAvatar } from '../../utils/avatarHelpers';

import { TBoard } from '../../types/boards';

const SideBar: React.FC = () => {
	const { user, logout } = useAuth();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const { data: boardsData, isSuccess, isLoading } = useGetBoardsQuery();
	const [updateBoard] = useUpdateBoardMutation();
	const [createBoard] = useCreateBoardMutation();

	const [boards, setBoards] = useState<TBoard[]>([]);
	const [initialBoards, setInitialBoards] = useState<TBoard[]>([]);
	const [showFavorites, setShowFavorites] = useState(true);

	useEffect(() => {
		if (isSuccess) {
			setBoards(boardsData);
			setInitialBoards(boardsData);
		}
	}, [isSuccess, boardsData]);

	const sidebarWidth = 250;

	// Configure DnD with sensor to activate dragging after a slight movement
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);

	// Compare current board positions with initial ones and update if changed
	const compareAndUpdateBoards = (updatedBoards: TBoard[]) => {
		updatedBoards.forEach((board, index) => {
			const initialBoard = initialBoards.find((b) => b.id === board.id);
			if (initialBoard && initialBoard.position !== index) {
				updateBoard({ id: board.id, position: index });
			}
		});
		setInitialBoards(updatedBoards); // Update initial boards to new order
	};

	// Handle board reordering after drag and drop
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			setBoards((prevBoards) => {
				const oldIndex = prevBoards.findIndex(
					(board) => board.id === active.id,
				);
				const newIndex = prevBoards.findIndex((board) => board.id === over?.id);
				const updatedBoards = arrayMove(prevBoards, oldIndex, newIndex);
				compareAndUpdateBoards(updatedBoards); // Update positions
				return updatedBoards;
			});
		}
	};

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
			handleError(error, dispatch);
		}
	};

	const handleFavoriteClick = async (
		e: React.MouseEvent<HTMLButtonElement>,
		id: string,
	) => {
		e.stopPropagation();
		await updateBoard({
			id,
			favorite: !boards.find((board) => board.id === id)!.favorite,
		});
	};

	return (
		<Drawer
			container={document.body}
			variant="permanent"
			sx={{
				width: sidebarWidth,
				height: '100%',
			}}
		>
			<List
				disablePadding
				sx={{
					width: sidebarWidth,
					height: '100%',
					overflow: 'hidden',
				}}
			>
				{/* User Profile and Logout Button */}
				<ListItemButton>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						sx={{ width: '100%' }}
						paddingY={1}
					>
						<Stack direction="row" alignItems="center" spacing={1}>
							{user?.username && <Avatar {...stringToAvatar(user.username)} />}
							<Typography variant="body1">
								{user?.username?.toUpperCase()}
							</Typography>
						</Stack>
						<IconButton onClick={logout}>
							<LogoutIcon fontSize="inherit" />
						</IconButton>
					</Stack>
				</ListItemButton>

				<Divider />

				{/* Favorite Boards Section */}
				<ListItemButton onClick={() => setShowFavorites((prev) => !prev)}>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<Typography
							variant="body1"
							sx={{
								textTransform: 'uppercase',
							}}
						>
							favorite
						</Typography>
						<IconButton>
							{showFavorites ? (
								<ExpandLessIcon fontSize="inherit" />
							) : (
								<ExpandMoreIcon fontSize="inherit" />
							)}
						</IconButton>
					</Box>
				</ListItemButton>
				{boards.some((board) => board.favorite) && (
					<Collapse in={showFavorites} timeout="auto" unmountOnExit>
						<List disablePadding>
							{boards
								.filter((board) => board.favorite)
								.map((board) => (
									<BoardLink
										id={board.id}
										key={board.id}
										icon={board.icon}
										title={board.title}
										favorite={board.favorite}
										onFavoriteClick={(e) => handleFavoriteClick(e, board.id)}
									/>
								))}
						</List>
					</Collapse>
				)}

				<Divider />

				{/* All Boards Header with Add Icon */}
				<ListItem>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
						}}
					>
						<Typography
							variant="body1"
							sx={{
								textTransform: 'uppercase',
							}}
						>
							all boards
						</Typography>
						<IconButton onClick={handleCreateBoard}>
							<AddBoxOutlinedIcon fontSize="inherit" />
						</IconButton>
					</Box>
				</ListItem>
				{isLoading && <Loading />}
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={boards.map((board) => board.id)}
						strategy={verticalListSortingStrategy}
					>
						{boards.map((board) => (
							<BoardLink
								id={board.id}
								key={board.id}
								icon={board.icon}
								title={board.title}
								favorite={board.favorite}
								onFavoriteClick={(e) => handleFavoriteClick(e, board.id)}
							/>
						))}
					</SortableContext>
				</DndContext>
			</List>
		</Drawer>
	);
};

export default SideBar;
