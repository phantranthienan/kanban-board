import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Stack,
	Typography,
	Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

// import {
// 	useCreateTaskMutation,
// 	useUpdateTaskMutation,
// } from '../../redux/slices/api/taskApiSlice';

import dayjs from 'dayjs';

import { TTask } from '../../types/tasks';

type TaskModalProps = {
	open: boolean;
	onClose: () => void;
	initialData?: TTask;
};

const TaskModal: React.FC<TaskModalProps> = ({
	open,
	onClose,
	initialData,
}) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [deadline, setDeadline] = useState<Date | null>(null);
	const [subtasks, setSubtasks] = useState<string[]>([]);
	const [newSubtask, setNewSubtask] = useState('');

	useEffect(() => {
		if (initialData) {
			setTitle(initialData.title);
			setDescription(initialData.description);
			setDeadline(initialData.deadline);
			setSubtasks(initialData.subtasks || []);
		} else {
			setTitle('');
			setDescription('');
			setDeadline(new Date());
			setSubtasks([]);
		}
	}, [initialData]);

	const handleAddSubtask = () => {
		if (newSubtask.trim()) {
			setSubtasks([...subtasks, newSubtask.trim()]);
			setNewSubtask('');
		}
	};

	const handleDeleteSubtask = (index: number) => {
		setSubtasks(subtasks.filter((_, i) => i !== index));
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth>
			<DialogTitle sx={{ mx: 'auto' }}>
				<Typography variant="h5" fontWeight="bold">
					{initialData ? 'Edit Task' : 'Add Task'}
				</Typography>
			</DialogTitle>
			<DialogContent
				sx={{
					'&.MuiDialogContent-root': {
						padding: '16px 24px',
					},
				}}
			>
				<Stack spacing={2}>
					<TextField
						label="Title"
						fullWidth
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<DateTimePicker
						label="Deadline"
						value={dayjs(deadline)}
						onChange={(newValue) =>
							setDeadline(newValue ? newValue.toDate() : null)
						}
						minDateTime={dayjs()}
					/>
					<TextField
						label="Description"
						fullWidth
						multiline
						rows={2}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<Box>
						<Typography variant="subtitle2" fontWeight="bold">
							Subtasks
						</Typography>
						<Stack spacing={1} mt={1}>
							{subtasks.map((subtask, index) => (
								<Box
									key={index}
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										border: '1px solid #ddd',
										padding: '8px',
										borderRadius: '4px',
									}}
								>
									<Typography>{subtask}</Typography>
									<Button
										variant="text"
										color="error"
										onClick={() => handleDeleteSubtask(index)}
									>
										Delete
									</Button>
								</Box>
							))}
							<Stack direction="row" spacing={1}>
								<TextField
									placeholder="Add a subtask"
									value={newSubtask}
									onChange={(e) => setNewSubtask(e.target.value)}
									fullWidth
									size="small"
								/>
								<Button onClick={handleAddSubtask} variant="contained">
									Add
								</Button>
							</Stack>
						</Stack>
					</Box>
				</Stack>
			</DialogContent>
			<DialogActions
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					margin: '8px 16px',
				}}
			>
				<Button onClick={onClose} color="inherit">
					Cancel
				</Button>
				<Button onClick={() => {}} variant="contained" color="primary">
					{initialData ? 'Update' : 'Create'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default TaskModal;
