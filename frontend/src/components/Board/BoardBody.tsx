import React from 'react';

import { useAppDispatch } from '../../hooks/storeHooks';
import { showNotification } from '../../redux/slices/notificationSlice';
import { useCreateSectionMutation } from '../../redux/slices/api/sectionApiSlice';

import { Box, Typography } from '@mui/material';
import SectionColumn from './SectionColumn';
import Loading from '../common/Loading';

import { handleError } from '../../utils/errorHandler';

import { TSection } from '../../types/sections';

type BoardBodyProps = {
	sections: TSection[];
	boardId: string;
};

const BoardBody: React.FC<BoardBodyProps> = ({ sections, boardId }) => {
	const dispatch = useAppDispatch();
	const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();

	const handleCreateSection = async () => {
		try {
			await createSection(boardId).unwrap();
			dispatch(
				showNotification({ message: 'Section created', type: 'success' }),
			);
		} catch (error: unknown) {
			handleError(error, dispatch);
		}
	};

	return (
		<Box
			sx={{
				flexGrow: 1,
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				overflowX: 'auto',
				mt: 1,
			}}
		>
			{sections.map((section) => (
				<SectionColumn key={section.id} section={section} />
			))}
			<Box
				component="button"
				onClick={() => handleCreateSection()}
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
					width: '300px',
					border: '2px dashed #ccc',
					borderRadius: '12px',
					backgroundColor: 'background.default',
					cursor: 'pointer',
					'&:hover': {
						backgroundColor: 'action.hover',
						border: 'none',
					},
				}}
			>
				{isCreating ? (
					<Loading fullHeight />
				) : (
					<Typography>New Section</Typography>
				)}
			</Box>
		</Box>
	);
};

export default BoardBody;
