import React, { useState, useMemo } from 'react';
import { useSortable, SortableContext } from '@dnd-kit/sortable';
import debounce from 'lodash/debounce';

import { useAppDispatch } from '../../hooks/storeHooks';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { showNotification } from '../../redux/slices/notificationSlice';
import {
	useDeleteSectionMutation,
	useUpdateSectionMutation,
} from '../../redux/slices/api/sectionApiSlice';
import { useCreateTaskMutation } from '../../redux/slices/api/taskApiSlice';

import {
	Box,
	Stack,
	Button,
	IconButton,
	InputBase,
	Divider,
} from '@mui/material';
import TaskModal from './TaskModal';
import TaskItem from './TaskItem';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';

import { TSection } from '../../types/sections';
import { TaskInput } from '../../utils/zodSchemas';
import { TTask } from '../../types/tasks';

type SectionColumnProps = {
	section: TSection;
	tasks: TTask[];
	dropIndex?: number | null;
};

const SectionColumn: React.FC<SectionColumnProps> = React.memo(
	({ section, tasks, dropIndex }) => {
		// Queries and mutations
		const [deleteSection] = useDeleteSectionMutation();
		const [updateSection] = useUpdateSectionMutation();
		const [createTask] = useCreateTaskMutation();

		// Local state
		const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
		const [title, setTitle] = useState<string>(section.title);
		const taskIds = useMemo(() => tasks.map((task) => task.id) ?? [], [tasks]);

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
			id: section.id,
			data: {
				type: 'section',
				section,
			},
		});

		const style = {
			transform: transform ? `translateX(${transform.x}px)` : undefined,
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
				handleError(error);
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
				handleError(error);
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
					<IconButton
						onClick={handleDeleteSection}
						sx={{ marginRight: '-8px' }}
					>
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
						overflowY: 'auto',
					}}
				>
					<SortableContext items={taskIds}>
						{/* Tasks */}
						{tasks.map((task, idx) => {
							const showLine = dropIndex === idx;

							return (
								<React.Fragment key={task.id}>
									{showLine && <InsertIndicator />}
									<TaskItem task={task} />
								</React.Fragment>
							);
						})}

						{dropIndex === tasks.length && <InsertIndicator />}

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
					</SortableContext>
				</Stack>
				{/* Task Modal */}
				<TaskModal
					open={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleCreateTask}
				/>
			</Box>
		);
	},
);

export default SectionColumn;

/** A small component to show a divider line as the "drop indicator" */
const InsertIndicator: React.FC = () => (
	<Divider
		sx={{
			borderColor: 'white',
			borderBottomWidth: 3,
			my: 1,
		}}
	/>
);
