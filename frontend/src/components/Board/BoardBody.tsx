import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
	DndContext,
	DragStartEvent,
	DragEndEvent,
	DragOverlay,
	useSensor,
	useSensors,
	PointerSensor,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

import { useAppDispatch } from '../../hooks/storeHooks';
import { showNotification } from '../../redux/slices/notificationSlice';
import {
	useCreateSectionMutation,
	useReorderSectionsMutation,
} from '../../redux/slices/api/sectionApiSlice';

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
	// Queries and mutations
	const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
	const [reorderSections] = useReorderSectionsMutation();
	const [activeSection, setActiveSection] = useState<TSection | null>(null);

	// Local state to handle reordering
	const [localSections, setLocalSections] = useState<TSection[]>(sections);
	useEffect(() => {
		setLocalSections(sections);
	}, [sections]);

	// Dispatch
	const dispatch = useAppDispatch();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 10,
			},
		}),
	);

	// Handle creating a new section
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

	// Drag and drop handlers
	const handleSectionDragStart = (event: DragStartEvent) => {
		if (event.active.data.current?.type === 'section') {
			setActiveSection(event.active.data.current.section);
		}
	};

	const handleSectionDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) {
			setActiveSection(null);
			return;
		}

		const activeSectionId = active.id;
		const overSectionId = over.id;

		if (activeSectionId === overSectionId) {
			setActiveSection(null);
			return;
		}

		const oldIndex = localSections.findIndex(
			(section) => section.id === activeSectionId,
		);
		const newIndex = localSections.findIndex(
			(section) => section.id === overSectionId,
		);

		const reorderedSections = arrayMove(localSections, oldIndex, newIndex);
		setLocalSections(reorderedSections);

		const updatedSections = reorderedSections.map((section, index) => ({
			id: section.id,
			position: index,
		}));

		try {
			await reorderSections({ boardId, sections: updatedSections }).unwrap();
		} catch (error: unknown) {
			handleError(error, dispatch);
			setLocalSections(sections);
		} finally {
			setActiveSection(null);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleSectionDragStart}
			onDragEnd={handleSectionDragEnd}
		>
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
				<SortableContext items={localSections.map((section) => section.id)}>
					{localSections.map((section) => (
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
						{isCreating ? <Loading /> : <Typography>New Section</Typography>}
					</Box>
					{createPortal(
						<DragOverlay>
							{activeSection && <SectionColumn section={activeSection} />}
						</DragOverlay>,
						document.body,
					)}
				</SortableContext>
			</Box>
		</DndContext>
	);
};

export default BoardBody;
