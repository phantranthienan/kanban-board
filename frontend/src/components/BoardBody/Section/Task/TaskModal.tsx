import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// import {
// 	useCreateTaskMutation,
// 	useUpdateTaskMutation,
// } from '../../redux/slices/api/taskApiSlice';

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
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { taskSchema, TaskInput } from '../../../../utils/zodSchemas';
import { TTask } from '../../../../types/common/task';

type TaskModalProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: TaskInput) => void;
	initialData?: TTask;
};

const TaskModal: React.FC<TaskModalProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
}) => {
	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<TaskInput>({
		defaultValues: {
			title: '',
			description: '',
			deadline: new Date(),
			subtasks: [],
		},
		resolver: zodResolver(taskSchema),
	});

	const subtasks = watch('subtasks');
	const [newSubtask, setNewSubtask] = useState<string>('');

	const [originalData, setOriginalData] = useState<TaskInput | null>(null);

	useEffect(() => {
		if (initialData) {
			const { title, description, deadline, subtasks } = initialData;
			setValue('title', title);
			setValue('description', description);
			setValue('deadline', dayjs(deadline).toDate());
			setValue('subtasks', subtasks);
			setOriginalData({ title, description, deadline, subtasks });
		}
	}, [initialData, setValue]);

	const handleAddSubtask = () => {
		if (newSubtask.trim()) {
			setValue('subtasks', [...subtasks!, newSubtask.trim()]);
			setNewSubtask('');
		}
	};

	const handleDeleteSubtask = (index: number) => {
		setValue(
			'subtasks',
			subtasks!.filter((_, i) => i !== index),
		);
	};

	const hasChanges =
		useWatch({ control }) && originalData
			? JSON.stringify(watch()) !== JSON.stringify(originalData)
			: Object.values(watch()).some((value) => value);

	const handleFormSubmit = (data: TaskInput) => {
		onSubmit(data);
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth>
			<DialogTitle variant="h5" sx={{ mx: 'auto', fontWeight: 'bold' }}>
				{initialData ? 'Task Details' : 'Create Task'}
			</DialogTitle>
			<form onSubmit={handleSubmit(handleFormSubmit)}>
				<DialogContent
					sx={{
						'&.MuiDialogContent-root': {
							padding: '16px 24px',
						},
					}}
				>
					<Stack spacing={2}>
						{/* Title Field */}
						<Controller
							name="title"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Title"
									fullWidth
									error={!!errors.title}
									helperText={errors.title?.message}
								/>
							)}
						/>

						{/* Deadline Field */}
						<Controller
							name="deadline"
							control={control}
							render={({ field }) => (
								<DateTimePicker
									{...field}
									label="Deadline"
									onChange={(date) =>
										field.onChange(date ? dayjs(date).toDate() : null)
									}
									value={dayjs(field.value)}
									minDateTime={dayjs()}
									slotProps={{
										textField: {
											fullWidth: true,
											error: !!errors.deadline,
											helperText: errors.deadline?.message,
										},
									}}
								/>
							)}
						/>

						{/* Description Field */}
						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="Description"
									fullWidth
									multiline
									rows={2}
									error={!!errors.description}
									helperText={errors.description?.message}
								/>
							)}
						/>

						{/* Subtasks */}
						<Box>
							<Typography variant="subtitle1" fontWeight="bold">
								Subtasks
							</Typography>
							<Stack spacing={1} mt={1}>
								{subtasks!.map((subtask, index) => (
									<Box
										key={index}
										sx={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											border: '1px solid #ddd',
											paddingX: '8px',
											paddingY: '4px',
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
					<LoadingButton
						type="submit"
						loading={isSubmitting}
						disabled={!hasChanges}
						variant="contained"
						color="primary"
					>
						{initialData ? 'Update' : 'Create'}
					</LoadingButton>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default TaskModal;
