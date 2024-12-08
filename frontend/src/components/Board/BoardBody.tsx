import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
	DndContext,
	DragStartEvent,
	DragEndEvent,
	DragOverEvent,
	DragOverlay,
	useSensor,
	useSensors,
	PointerSensor,
} from '@dnd-kit/core';
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useAppDispatch } from '../../hooks/storeHooks';
import { showNotification } from '../../redux/slices/notificationSlice';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import {
	useGetSectionsQuery,
	useCreateSectionMutation,
	useReorderSectionsMutation,
} from '../../redux/slices/api/sectionApiSlice';
import {
	useGetTasksOfBoardQuery,
	useMoveTaskMutation,
} from '../../redux/slices/api/taskApiSlice';

import { Box, Typography } from '@mui/material';
import SectionColumn from './SectionColumn';
import TaskItem from './TaskItem';
import Loading from '../common/Loading';

import { TSection } from '../../types/sections';
import { TTask } from '../../types/tasks';

type BoardBodyProps = {
	boardId: string;
};

const BoardBody: React.FC<BoardBodyProps> = ({ boardId }) => {
	// Queries
	const { data: sections, isLoading: sectionsLoading } =
		useGetSectionsQuery(boardId);
	const { data: tasks, isLoading: tasksLoading } =
		useGetTasksOfBoardQuery(boardId);

	// Mutations
	const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
	const [reorderSections] = useReorderSectionsMutation();
	const [moveTask] = useMoveTaskMutation();

	// Local States
	const [activeSection, setActiveSection] = useState<TSection | null>(null);
	const [activeTask, setActiveTask] = useState<TTask | null>(null);

	const [localSections, setLocalSections] = useState<TSection[] | undefined>(
		sections,
	);
	const [localTasks, setLocalTasks] = useState<TTask[] | undefined>(tasks);

	// Store original info for task revert if needed
	const [activeTaskOriginSection, setActiveTaskOriginSection] = useState<
		string | null
	>(null);
	const [activeTaskOriginPosition, setActiveTaskOriginPosition] = useState<
		number | null
	>(null);

	const dispatch = useAppDispatch();
	const handleError = useErrorHandler();

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
	);

	// On initial load or updates, sort tasks once and store
	useEffect(() => {
		setLocalSections(sections);
	}, [sections]);

	useEffect(() => {
		if (tasks) {
			const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
			setLocalTasks(sortedTasks);
		}
	}, [tasks]);

	const sectionIds = useMemo(
		() => localSections?.map((section) => section.id) ?? [],
		[localSections],
	);

	const handleCreateSection = async () => {
		try {
			await createSection(boardId).unwrap();
			dispatch(
				showNotification({ message: 'Section created', type: 'success' }),
			);
		} catch (error: unknown) {
			handleError(error);
		}
	};

	// Update sections order in backend
	const bulkUpdateSections = async (updatedSections: TSection[]) => {
		try {
			const sectionsToUpdate = updatedSections.map((section, index) => ({
				id: section.id,
				position: index,
			}));
			await reorderSections({ boardId, sections: sectionsToUpdate }).unwrap();
		} catch (error) {
			handleError(error);
			setLocalSections(sections);
		}
	};

	// DRAG EVENTS
	const handleDragStart = (event: DragStartEvent) => {
		const dragItem = event.active.data.current;
		if (!dragItem) return;

		const { type } = dragItem;
		if (type === 'section') {
			setActiveSection(dragItem.section);
		} else if (type === 'task') {
			setActiveTask(dragItem.task);
			setActiveTaskOriginSection(dragItem.task.section);
			setActiveTaskOriginPosition(dragItem.task.position);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over || !active.data.current) return;

		const activeData = active.data.current;
		const overData = over.data.current;

		if (activeData.type === 'section') return;

		if (activeData.type === 'task') {
			const draggedTask: TTask = activeData.task;
			if (!draggedTask) return;

			let targetSectionId: string | null = null;
			let targetPosition: number | null = null;

			if (overData?.type === 'task') {
				const overTask: TTask = overData.task;
				targetSectionId = overTask.section;
				targetPosition = overTask.position;
			} else if (overData?.type === 'section') {
				targetSectionId = over.id as string;
				const tasksInTarget =
					localTasks?.filter((t) => t.section === targetSectionId) || [];
				targetPosition = tasksInTarget.length;
			}

			if (!targetSectionId || targetPosition == null) return;

			const currentTask = localTasks?.find((t) => t.id === draggedTask.id);
			if (!currentTask) return;

			const currentSection = currentTask.section;
			const currentPosition = currentTask.position;

			const sameSection = currentSection === targetSectionId;
			const samePosition = currentPosition === targetPosition;
			if (sameSection && samePosition) {
				return;
			}

			const tasksInTarget = localTasks!.filter(
				(t) => t.section === targetSectionId,
			);
			if (targetPosition > tasksInTarget.length) {
				return;
			}

			setLocalTasks((prev) => {
				if (!prev) return prev;

				// Remove the task from old place
				const withoutTask = prev.filter((t) => t.id !== draggedTask.id);

				// Insert into target section
				const tasksOfTarget = withoutTask.filter(
					(t) => t.section === targetSectionId,
				);
				const otherTasks = withoutTask.filter(
					(t) => t.section !== targetSectionId,
				);

				// Insert dragged task at targetPosition
				tasksOfTarget.splice(targetPosition, 0, {
					...draggedTask,
					section: targetSectionId,
				});

				// Reassign positions in target section:
				for (let i = 0; i < tasksOfTarget.length; i++) {
					tasksOfTarget[i] = { ...tasksOfTarget[i], position: i };
				}

				return [...otherTasks, ...tasksOfTarget];
			});
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		setActiveSection(null);
		setActiveTask(null);

		const { active, over } = event;

		if (!over) {
			// No valid drop area, revert to original tasks
			setLocalTasks(tasks?.sort((a, b) => a.position - b.position));
			return;
		}

		const activeData = active.data.current;
		const overData = over.data.current;

		// Handle section reorder
		if (activeData?.type === 'section' && overData?.type === 'section') {
			setLocalSections((prevSections) => {
				const oldIndex = prevSections!.findIndex(
					(section) => section.id === activeData.section.id,
				);
				const newIndex = prevSections!.findIndex(
					(section) => section.id === overData.section.id,
				);
				const reorderedSections = arrayMove(prevSections!, oldIndex, newIndex);
				bulkUpdateSections(reorderedSections);

				return reorderedSections;
			});
		}

		// Handle task drop finalization
		if (activeData?.type === 'task') {
			const droppedTask = activeData.task;
			const overTask = overData?.task;

			const oldPosition = activeTaskOriginPosition!;
			const sourceSection = activeTaskOriginSection!;
			const targetSection =
				overData?.type === 'section' ? over.id : overTask?.section;

			let newPosition: number | undefined;

			if (overData?.type === 'section') {
				// Dropped in section area (no specific task)
				const tasksInTargetSection = localTasks!.filter(
					(task) => task.section === targetSection,
				);
				newPosition = tasksInTargetSection.findIndex(
					(t) => t.id === droppedTask.id,
				);
				if (newPosition < 0) newPosition = tasksInTargetSection.length - 1;
			} else if (overData?.type === 'task' && overTask) {
				newPosition = overTask.position;
			}

			if (newPosition === undefined) {
				// Invalid drop, revert
				setLocalTasks(tasks?.sort((a, b) => a.position - b.position));
				return;
			}

			const isSameSection = sourceSection === targetSection;
			const isSamePosition = oldPosition === newPosition;

			if (isSameSection && isSamePosition) {
				// No changes needed, revert to original sorted tasks
				setLocalTasks((prev) =>
					prev ? [...prev].sort((a, b) => a.position - b.position) : prev,
				);
				return;
			}

			// Update backend for the move
			try {
				await moveTask({
					boardId,
					taskId: droppedTask.id,
					fromSection: sourceSection,
					toSection: targetSection,
					position: newPosition,
				}).unwrap();
			} catch (error) {
				handleError(error);
				// On error, revert
				setLocalTasks(tasks?.sort((a, b) => a.position - b.position));
			} finally {
				// Resort tasks after finalizing move for stable order
				setLocalTasks((prev) =>
					prev ? [...prev].sort((a, b) => a.position - b.position) : prev,
				);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
		>
			<Box
				sx={{
					flexGrow: 1,
					display: 'flex',
					alignItems: 'flex-start',
					gap: 1,
					overflowX: 'auto',
					mt: 1,
				}}
			>
				{(sectionsLoading || tasksLoading) && <Loading />}
				{localSections && localTasks && (
					<SortableContext
						items={sectionIds}
						strategy={horizontalListSortingStrategy}
					>
						{localSections.map((section) => (
							<SectionColumn
								key={section.id}
								section={section}
								tasks={localTasks.filter((task) => task.section == section.id)}
								// .sort((a, b) => a.position - b.position)}
							/>
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
								{activeSection && (
									<SectionColumn
										section={activeSection}
										tasks={localTasks?.filter(
											(task) => task.section == activeSection.id,
										)}
									/>
								)}
								{activeTask && <TaskItem task={activeTask} />}
							</DragOverlay>,
							document.body,
						)}
					</SortableContext>
				)}
			</Box>
		</DndContext>
	);
};

export default BoardBody;
