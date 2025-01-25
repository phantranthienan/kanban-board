import React, { useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import debounce from 'lodash/debounce';

import { useAppDispatch } from '../../../hooks/storeHooks';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { showNotification } from '../../../redux/slices/notificationSlice';

import {
	useDeleteSectionMutation,
	useUpdateSectionMutation,
} from '../../../redux/slices/api/sectionApiSlice';
import { useCreateTaskMutation } from '../../../redux/slices/api/taskApiSlice';

import { Box, Stack, Button, IconButton, InputBase } from '@mui/material';
import TaskModal from './Task/TaskModal';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import TasksList from './Task/TasksList';

import { TSection } from '../../../types/common/section';
import { TaskInput } from '../../../utils/zodSchemas';

import { mapOrder } from '../../../utils/sorts';

type SectionColumnProps = {
	section: TSection;
};

const SectionColumn: React.FC<SectionColumnProps> = ({ section }) => {
	const dispatch = useAppDispatch();
	const handleError = useErrorHandler();

	const tasks = useMemo(
		() => mapOrder(section.tasks, section.tasksOrder, 'id'),
		[section.tasks, section.tasksOrder], // Only recalculate when these change
	);

	// Queries and mutations
	const [deleteSection] = useDeleteSectionMutation();
	const [updateSection] = useUpdateSectionMutation();
	const [createTask] = useCreateTaskMutation();

	// Local state
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [title, setTitle] = useState<string>(section.title);

	// Dnd Kit
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: section.id,
		data: {
			type: 'section',
			section,
		},
	});

	const dndKitSectionStyles = {
		transform: CSS.Translate.toString(transform),
		cursor: 'grab',
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	// Api handlers
	const handleAddTask = () => {
		setIsModalOpen(true);
	};

	// Debounced title update
	const debouncedUpdateTitle = useMemo(() => {
		return debounce((newTitle: string) => {
			updateSection({ id: section.id, board: section.board, title: newTitle });
		}, 500);
	}, [section.board, section.id, updateSection]);

	// Handle title change
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e.target.value;
		setTitle(newTitle); // Update the local state
		debouncedUpdateTitle(newTitle); // Call the debounced update function
	};

	const handleDeleteSection = async () => {
		try {
			await deleteSection({
				boardId: section.board,
				sectionId: section.id,
			}).unwrap();
			dispatch(
				showNotification({ message: 'Section deleted', type: 'success' }),
			);
		} catch (error: unknown) {
			handleError(error);
		}
	};

	const handleCreateTask = async (data: TaskInput) => {
		try {
			const newTask = {
				...data,
				board: section.board,
				section: section.id,
				isPlaceHolder: false,
			};
			await createTask(newTask).unwrap();
			dispatch(
				showNotification({
					message: 'Task created successfully',
					type: 'success',
				}),
			);
		} catch (error: unknown) {
			handleError(error);
		}
	};

	return (
		<Box
			ref={setNodeRef}
			style={dndKitSectionStyles}
			{...attributes}
			{...listeners}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				height: '100%',
				width: '300px',
				backgroundColor: 'action.hover',
				border: '1px solid',
				borderColor: 'action.hover',
				borderRadius: '12px',
			}}
		>
			{/* Section Title */}
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				sx={{
					height: '64px',
					width: '100%',
					px: 2,
					backgroundColor: 'background.default',
					borderRadius: '12px 12px 0 0',
					flexShrink: 0,
				}}
			>
				<InputBase
					value={title}
					onChange={handleTitleChange}
					sx={{
						width: '180px',
						fontSize: '1.2rem',
						fontWeight: 'bold',
						color: 'inherit',
					}}
				/>
				<IconButton onClick={handleDeleteSection} sx={{ marginRight: '-8px' }}>
					<DeleteIcon />
				</IconButton>
			</Stack>

			{/* Section Body */}
			<Stack
				spacing={1}
				sx={{
					flexGrow: 1,
					width: '100%',
					p: 1,
					mt: -1,
					overflowY: 'auto',
				}}
			>
				<TasksList tasks={tasks} />

				{/* Add Task Button */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						height: '56px',
						width: '100%',
						border: '2px dashed #ccc',
						borderRadius: '4px',
						flexShrink: 0,
					}}
				>
					<Button
						onClick={handleAddTask}
						startIcon={<AddIcon />}
						sx={{
							width: '100%',
							color: 'white',
							justifyContent: 'center',
						}}
					>
						Add Task
					</Button>
				</Box>
			</Stack>

			{/* Task Modal */}
			<TaskModal
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleCreateTask}
			/>
		</Box>
	);
};

export default SectionColumn;
