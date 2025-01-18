import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAppDispatch } from '../../hooks/storeHooks';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { showNotification } from '../../redux/slices/notificationSlice';
import {
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} from '../../redux/slices/api/taskApiSlice';

import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import TaskModal from './TaskModal';

import { TTask } from '../../types/common/tasks';
import { TaskInput } from '../../utils/zodSchemas';

type TaskItemProps = {
	task: TTask;
};

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
	//Queries and mutations
	const [deleteTask] = useDeleteTaskMutation();
	const [updateTask] = useUpdateTaskMutation();

	// Local state
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const dispatch = useAppDispatch();
	const handleError = useErrorHandler();
	// Drag and drop
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: 'task',
			section: task.section,
			task,
		},
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		cursor: 'grab',
		transition,
	};

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleShowDetails = () => {
		setIsModalOpen(true);
		handleMenuClose();
	};

	const handleDeleteTask = async () => {
		try {
			await deleteTask({
				boardId: task.board,
				sectionId: task.section,
				taskId: task.id,
			}).unwrap();
			dispatch(
				showNotification({
					message: 'Task deleted successfully',
					type: 'success',
				}),
			);
		} catch (error) {
			handleError(error);
		}
		handleMenuClose();
	};

	const handleUpdateTask = async (data: TaskInput) => {
		try {
			await updateTask({
				...data,
				id: task.id,
				section: task.section,
				board: task.board,
			}).unwrap();
			dispatch(
				showNotification({
					message: 'Task updated successfully',
					type: 'success',
				}),
			);
		} catch (error) {
			handleError(error);
		}
	};

	if (isDragging) {
		return (
			<Box
				ref={setNodeRef}
				{...attributes}
				{...listeners}
				style={style}
				sx={{
					flexShrink: 0,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					height: '56px',
					width: '100%',
					px: 2,
					py: 2,
					backgroundColor: 'background.paper',
					opacity: 0.5,
					borderRadius: '4px',
					cursor: 'pointer',
				}}
			></Box>
		);
	}

	return (
		<>
			<Box
				ref={setNodeRef}
				{...attributes}
				{...listeners}
				style={style}
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					height: '56px',
					width: '100%',
					px: 2,
					py: 2,
					backgroundColor: 'background.paper',
					borderRadius: '4px',
					cursor: 'pointer',
				}}
			>
				<Typography variant="body1" fontWeight="bold">
					{task.title}
				</Typography>
				<IconButton
					onClick={handleMenuOpen}
					sx={{
						p: 0,
						'&:hover': {
							backgroundColor: 'transparent',
						},
					}}
				>
					<MoreVertIcon />
				</IconButton>
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleMenuClose}
					sx={{ '& .MuiList-padding': { padding: 0 } }}
				>
					<MenuItem onClick={handleShowDetails}>Show Details</MenuItem>
					<MenuItem onClick={handleDeleteTask}>Delete</MenuItem>
				</Menu>
			</Box>

			{/* Task Modal for Showing/Editing Task */}
			{isModalOpen && (
				<TaskModal
					open={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleUpdateTask}
					initialData={task}
				/>
			)}
		</>
	);
};

export default TaskItem;
