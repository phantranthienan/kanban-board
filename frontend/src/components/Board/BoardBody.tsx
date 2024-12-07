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
	closestCenter,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

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
	// Queries and mutations
	const { data: sections, isLoading: sectionsLoading } =
		useGetSectionsQuery(boardId);
	const { data: tasks, isLoading: tasksLoading } =
		useGetTasksOfBoardQuery(boardId);
	const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
	const [reorderSections] = useReorderSectionsMutation();
	const [moveTask] = useMoveTaskMutation();

	// Local state to handle reordering
	const [activeSection, setActiveSection] = useState<TSection | null>(null);
	const [activeTask, setActiveTask] = useState<TTask | null>(null);

	const [localSections, setLocalSections] = useState<TSection[] | undefined>(
		sections,
	);
	const [localTasks, setLocalTasks] = useState<TTask[] | undefined>(tasks);

	const [activeTaskOriginSection, setActiveTaskOriginSection] = useState<
		string | null
	>(null);
	const [activeTaskOriginPosition, setActiveTaskOriginPosition] = useState<
		number | null
	>(null);

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
		() => sections?.map((section) => section.id) ?? [],
		[sections],
	);

	// Log localTasks whenever it changes
	// useEffect(() => {
	// 	console.log('Updated localTasks:', localTasks);
	// }, [localTasks]);

	// Dispatch
	const dispatch = useAppDispatch();
	const handleError = useErrorHandler();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 1,
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
			handleError(error);
		}
	};

	// Drag and drop handlers
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

		if (activeData.type === 'task' && overData?.type === 'task') {
			const activeTask = activeData.task;
			const overSectionId = overData?.task?.section;
			const numberOfTasksInOverSection = localTasks?.filter(
				(task) => task.section === overSectionId,
			)?.length;
			if (activeTaskOriginSection !== overSectionId) {
				setLocalTasks((prev) =>
					prev
						?.map((task) =>
							task.id === activeTask.id
								? {
										...task,
										section: overSectionId,
										position: numberOfTasksInOverSection!,
									}
								: task,
						)
						.sort((a, b) => a.position - b.position),
				);
			}
			// } else {
			// 	setLocalTasks((prev) =>
			// 		prev
			// 			?.map((task) =>
			// 				task.id === activeTask.id
			// 					? {
			// 							...task,
			// 							section: activeTaskOriginSection!,
			// 							position: activeTaskOriginPosition!,
			// 						}
			// 					: task,
			// 			)
			// 			.sort((a, b) => a.position - b.position),
			// 	);
			// }
		}
		if (activeData.type === 'task' && overData?.type === 'section') {
			const activeTask = activeData.task;
			const overSectionId = over.id;
			const numberOfTasksInOverSection = localTasks?.filter(
				(task) => task.section === overSectionId,
			)?.length;
			if (activeTaskOriginSection !== overSectionId) {
				setLocalTasks((prev) =>
					prev
						?.map((task) =>
							task.id === activeTask.id
								? {
										...task,
										section: overSectionId,
										position: numberOfTasksInOverSection!,
									}
								: task,
						)
						.sort((a, b) => a.position - b.position),
				);
			} else {
				setLocalTasks((prev) =>
					prev
						?.map((task) =>
							task.id === activeTask.id
								? {
										...task,
										section: activeTaskOriginSection! as string,
										position: activeTaskOriginPosition!,
									}
								: task,
						)
						.sort((a, b) => a.position - b.position),
				);
			}
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		setActiveSection(null);
		setActiveTask(null);

		const { active, over } = event;

		if (!over) return;

		const activeData = active.data.current;
		const overData = over.data.current;

		// Reordering sections
		if (activeData?.type === 'section' && overData?.type === 'section') {
			const activeSectionId = active.id;
			const overSectionId = over.id;

			if (activeSectionId === overSectionId) return;

			// Find the old and new index of the section
			const oldIndex = localSections!.findIndex(
				(section) => section.id === activeSectionId,
			);
			const newIndex = localSections!.findIndex(
				(section) => section.id === overSectionId,
			);

			const reorderedSections = arrayMove(localSections!, oldIndex, newIndex);
			setLocalSections(reorderedSections);

			const updatedSections = reorderedSections.map((section, index) => ({
				id: section.id,
				position: index,
			}));

			try {
				await reorderSections({ boardId, sections: updatedSections }).unwrap();
			} catch (error) {
				handleError(error);
				setLocalSections(sections);
			}
			return;
		}

		// Handle task drop
		if (activeData?.type === 'task') {
			const activeTask = activeData.task;
			const overTask = overData?.task;

			const oldPosition = activeTaskOriginPosition!;
			const sourceSection = activeTaskOriginSection!;
			const targetSection =
				overData?.type === 'section' ? over.id : overTask?.section;
			let newPosition;

			if (overData?.type === 'section') {
				const tasksInTargetSection = localTasks!.filter(
					(task) => task.section === targetSection,
				);
				newPosition = tasksInTargetSection.length - 1;
			} else if (overData?.type === 'task' && overTask) {
				// console.log('overTask:', overTask);
				newPosition = overTask.position;
			}

			// console.log('oldPosition:', oldPosition);
			// console.log('newPosition:', newPosition);

			const isSameSection = sourceSection === targetSection;

			if (isSameSection && oldPosition === newPosition) return;

			if (isSameSection) {
				// Reorder tasks in the same section
				const tasksInSameSection = localTasks!.filter(
					(task) => task.section === sourceSection,
				);

				const reorderedTasks = arrayMove(
					tasksInSameSection,
					oldPosition,
					newPosition,
				);

				const updatedTasks = reorderedTasks.map((task, index) => ({
					...task,
					position: index,
				}));

				setLocalTasks((prev) =>
					prev
						?.map((task) =>
							task.section === sourceSection
								? updatedTasks.find((t) => t.id === task.id)!
								: task,
						)
						.sort((a, b) => a.position - b.position),
				);
			} else {
				const tasksInSourceSection = localTasks!.filter(
					(task) => task.section === sourceSection && task.id !== activeTask.id,
				);
				const tasksInTargetSection = localTasks!.filter(
					(task) => task.section === targetSection && task.id !== activeTask.id,
				);

				const updatedSourceTasks = tasksInSourceSection.map((task, index) => ({
					...task,
					position: index,
				}));

				const updatedTargetTasks = [
					...tasksInTargetSection.slice(0, newPosition),
					{ ...activeTask, section: targetSection, position: newPosition },
					...tasksInTargetSection.slice(newPosition),
				].map((task, index) => ({
					...task,
					position: index,
				}));

				const updatedTasks = [...updatedSourceTasks, ...updatedTargetTasks];
				const updatedTasksMap = new Map(
					updatedTasks.map((task) => [task.id, task]),
				);

				setLocalTasks((prev) =>
					prev
						?.map((task) => updatedTasksMap.get(task.id) ?? task)
						.sort((a, b) => a.position - b.position),
				);
			}

			// Update backend
			try {
				await moveTask({
					boardId,
					taskId: activeTask.id,
					fromSection: sourceSection,
					toSection: targetSection,
					position: newPosition,
				}).unwrap();
			} catch (error) {
				handleError(error);
				setLocalTasks(tasks);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			collisionDetection={closestCenter}
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
					<SortableContext items={sectionIds}>
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
