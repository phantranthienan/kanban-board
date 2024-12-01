import React, { useState } from 'react';
import { TSection } from '../../types/sections';

import { Box, Stack, Button, IconButton } from '@mui/material';
import TaskModal from './TaskModal';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/AddCircleOutlineOutlined';

type SectionColumnProps = {
	section: TSection;
};

const SectionColumn: React.FC<SectionColumnProps> = ({ section }) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const handleAddTask = () => {
		setIsModalOpen(true);
	};

	const handleDeleteSection = () => {
		console.log('Delete Section');
	};

	return (
		<Box
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
				{section.title}
				<IconButton onClick={handleDeleteSection} sx={{ marginRight: '-8px' }}>
					<DeleteIcon />
				</IconButton>
			</Stack>

			<Stack
				sx={{
					flexGrow: 1,
					width: '100%',
					p: 1,
					overflowY: 'auto',
				}}
			>
				{section.tasks.map((task) => (
					<Box key={task.id}>task</Box>
				))}
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

			{/* Task Modal */}
			<TaskModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</Box>
	);
};

export default SectionColumn;
