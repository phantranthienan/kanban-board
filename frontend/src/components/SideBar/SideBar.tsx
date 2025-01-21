import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import {
	useGetBoardsQuery,
	useUpdateBoardMutation,
	useCreateBoardMutation,
	useReorderBoardsMutation,
} from '../../redux/slices/api/boardApiSlice';
import { showNotification } from '../../redux/slices/notificationSlice';
import { useAppDispatch } from '../../hooks/storeHooks';

import {
	Drawer,
	List,
	ListItem,
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
	restrictToVerticalAxis,
	restrictToParentElement,
} from '@dnd-kit/modifiers';

import { arrayMove, SortableContext } from '@dnd-kit/sortable';

import { logout } from '../../services/api/authApi';

import { stringToAvatar } from '../../utils/avatarHelpers';

import { TBoard } from '../../types/common/boards';

const SideBar: React.FC = () => {
	const { user, unAuthenticate } = useAuth();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleError = useErrorHandler();

	const { data: boardsData, isSuccess, isLoading } = useGetBoardsQuery();
	const [updateBoard] = useUpdateBoardMutation();
	const [createBoard] = useCreateBoardMutation();
	const [reorderBoards] = useReorderBoardsMutation();

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
	const numberOfFavorites = boards.filter((board) => board.favorite).length;
	const maxHeight = showFavorites
		? `calc(100vh - min(20%, ${numberOfFavorites} * 56px) - 72px - 2 * 64px - 0.8 * 2px)`
		: 'calc(100vh - 72px - 2 * 64px - 0.8 * 2px)';

	// Configure DnD with sensor to activate dragging after a slight movement
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);

	// // Compare current board positions with initial ones and update if changed
	// const compareAndUpdateBoards = (updatedBoards: TBoard[]) => {
	// 	updatedBoards.forEach((board, index) => {
	// 		const initialBoard = initialBoards.find((b) => b.id === board.id);
	// 		if (initialBoard && initialBoard.position !== index) {
	// 			updateBoard({ id: board.id, position: index });
	// 		}
	// 	});
	// 	setInitialBoards(updatedBoards); // Update initial boards to new order
	// };

	// // Handle board reordering after drag and drop
	// const handleDragEnd = (event: DragEndEvent) => {
	// 	const { active, over } = event;
	// 	if (active.id !== over?.id) {
	// 		setBoards((prevBoards) => {
	// 			const oldIndex = prevBoards.findIndex(
	// 				(board) => board.id === active.id,
	// 			);
	// 			const newIndex = prevBoards.findIndex((board) => board.id === over?.id);
	// 			const updatedBoards = arrayMove(prevBoards, oldIndex, newIndex);
	// 			compareAndUpdateBoards(updatedBoards); // Update positions
	// 			return updatedBoards;
	// 		});
	// 	}
	// };

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (active.id !== over?.id) {
			setBoards((prevBoards) => {
				const oldIndex = prevBoards.findIndex(
					(board) => board.id === active.id,
				);
				const newIndex = prevBoards.findIndex((board) => board.id === over?.id);

				// Optimistically update the UI
				const updatedBoards = arrayMove(prevBoards, oldIndex, newIndex);
				setInitialBoards(updatedBoards); // Sync initialBoards for reference

				bulkUpdatePositions(updatedBoards);
				// Perform bulk update asynchronously

				return updatedBoards;
			});
		}
	};

	// Function to perform bulk updates
	const bulkUpdatePositions = async (updatedBoards: TBoard[]) => {
		try {
			const boardsToUpdate = updatedBoards.map((board, index) => ({
				id: board.id,
				position: index,
			}));
			await reorderBoards(boardsToUpdate); // Call your bulk API here
		} catch (error) {
			handleError(error);
			setBoards(initialBoards); // Reset to initial state
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
			handleError(error);
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

	const handleLogout = async () => {
		try {
			await logout();
			unAuthenticate();
		} catch (error: unknown) {
			handleError(error);
		}
	};

	return (
		<Drawer
			// container={document.body}
			variant="permanent"
			sx={{
				width: sidebarWidth,
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				'& .MuiDrawer-paper': {
					overflowY: 'hidden',
				},
			}}
		>
			<List
				disablePadding
				sx={{
					width: sidebarWidth,
					height: '100%',
					flex: '0 0 auto', // Prevent header from growing/shrinking
				}}
			>
				{/* User Profile and Logout Button */}
				<ListItem>
					<Stack
						direction="row"
						justifyContent="space-between"
						alignItems="center"
						sx={{ width: '100%', height: '56px' }}
						paddingY={1}
					>
						<Stack direction="row" alignItems="center" spacing={1}>
							{user?.username && <Avatar {...stringToAvatar(user.username)} />}
							<Typography
								variant="body1"
								sx={{ width: '100px', overflow: 'hidden' }}
							>
								{user?.username?.toUpperCase()}
							</Typography>
						</Stack>
						<IconButton onClick={handleLogout}>
							<LogoutIcon fontSize="inherit" />
						</IconButton>
					</Stack>
				</ListItem>

				<Divider />

				{/* Favorite Boards Section */}
				<ListItem onClick={() => setShowFavorites((prev) => !prev)}>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							height: '48px',
							width: '100%',
						}}
					>
						<Typography
							variant="h6"
							sx={{
								textTransform: 'uppercase',
								fontWeight: 'normal',
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
				</ListItem>

				{/* Favorite Boards */}
				<Box
					sx={{
						maxHeight: '20%', // Adjust as needed
						overflowY: 'auto', // Allow scrolling only for items
					}}
				>
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
				</Box>

				<Divider />

				{/* All Boards Header with Add Icon */}
				<ListItem>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							width: '100%',
							height: '48px',
						}}
					>
						<Typography
							variant="h6"
							sx={{
								textTransform: 'uppercase',
								fontWeight: 'normal',
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
				<Box
					sx={{
						flexGrow: 1,
						maxHeight: maxHeight, // Adjust as needed
						overflowY: 'auto',
						position: 'relative',
					}}
				>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
						modifiers={[restrictToParentElement, restrictToVerticalAxis]}
						autoScroll={true}
					>
						<List disablePadding>
							<SortableContext
								items={boards.map((board) => board.id)}
								// strategy={verticalListSortingStrategy}
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
						</List>
					</DndContext>
				</Box>
			</List>
		</Drawer>
	);
};

export default SideBar;
