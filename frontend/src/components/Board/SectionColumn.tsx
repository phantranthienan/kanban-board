import React, { useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import debounce from 'lodash/debounce';

import { useAppDispatch } from '../../hooks/storeHooks';
import { showNotification } from '../../redux/slices/notificationSlice';
import {
	useDeleteSectionMutation,
	useUpdateSectionMutation,
} from '../../redux/slices/api/sectionApiSlice';
import {
	useCreateTaskMutation,
	useGetTasksOfSectionQuery,
} from '../../redux/slices/api/taskApiSlice';

import { Box, Stack, Button, IconButton, InputBase } from '@mui/material';
import TaskModal from './TaskModal';
import TaskItem from './TaskItem';
import Loading from '../common/Loading';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import { TSection } from '../../types/sections';
import { TaskInput } from '../../utils/zodSchemas';
import { handleError } from '../../utils/errorHandler';

type SectionColumnProps = {
	section: TSection;
};

const SectionColumn: React.FC<SectionColumnProps> = ({ section }) => {
	// Queries and mutations
	const [deleteSection] = useDeleteSectionMutation();
	const [updateSection] = useUpdateSectionMutation();
	const [createTask] = useCreateTaskMutation();
	const { data: tasks, isLoading } = useGetTasksOfSectionQuery({
		boardId: section.board,
		sectionId: section.id,
	});

	// Local state
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [title, setTitle] = useState<string>(section.title);
	const dispatch = useAppDispatch();

	// Drag and drop
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

	const style = {
		transform: CSS.Transform.toString(transform),
		cursor: 'grab',
		transition,
	};

	// Event handlers
	const handleAddTask = () => {
		setIsModalOpen(true);
	};

	// Debounced title update
	const debouncedUpdateTitle = useMemo(() => {
		return debounce((newTitle: string) => {
			updateSection({ ...section, title: newTitle });
		}, 500);
	}, [updateSection, section]);

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
			handleError(error, dispatch);
		}
	};

	const handleCreateTask = async (data: TaskInput) => {
		try {
			const newTask = { ...data, board: section.board, section: section.id };
			await createTask(newTask).unwrap();
			dispatch(
				showNotification({
					message: 'Task created successfully',
					type: 'success',
				}),
			);
		} catch (error: unknown) {
			handleError(error, dispatch);
		}
	};

	if (isDragging) {
		return (
			<Box
				ref={setNodeRef}
				style={style}
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
			/>
		);
	}

	return (
		<Box
			ref={setNodeRef}
			style={style}
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
					height: '50px',
					width: '100%',
					px: 2,
					backgroundColor: 'background.default',
					borderRadius: '12px 12px 0 0',
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
			{isLoading && <Loading fullHeight />}
			{tasks && !isLoading && (
				<Stack
					spacing={1}
					sx={{
						flexGrow: 1,
						width: '100%',
						p: 1,
						overflowY: 'auto',
					}}
				>
					{/* Tasks */}
					{tasks.map((task) => (
						<TaskItem key={task.id} task={task} />
					))}

					{/* Add Task Button */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							width: '100%',
							border: '2px dashed #ccc',
							borderRadius: '4px',
						}}
					>
						<Button
							onClick={handleAddTask}
							startIcon={<AddIcon />}
							sx={{
								width: '100%',
								color: 'white',
							}}
						>
							Add Task
						</Button>
					</Box>
				</Stack>
			)}
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
