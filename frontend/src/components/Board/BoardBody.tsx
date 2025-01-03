import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
	DndContext,
	DragStartEvent,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
	DragOverEvent,
} from '@dnd-kit/core';
import {
	SortableContext,
	horizontalListSortingStrategy,
	arrayMove,
} from '@dnd-kit/sortable';

import { Box, Typography } from '@mui/material';

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

import Loading from '../common/Loading';
import SectionColumn from './SectionColumn';
import TaskItem from './TaskItem';

import { TSection } from '../../types/sections';
import { TTask } from '../../types/tasks';

type BoardBodyProps = {
	boardId: string;
};

const BoardBody: React.FC<BoardBodyProps> = ({ boardId }) => {
	// ======= QUERIES =======
	const { data: sections, isLoading: sectionsLoading } =
		useGetSectionsQuery(boardId);
	const { data: tasks, isLoading: tasksLoading } =
		useGetTasksOfBoardQuery(boardId);

	// ======= MUTATIONS =======
	const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();
	const [reorderSections] = useReorderSectionsMutation();
	const [moveTask] = useMoveTaskMutation();

	// ======= LOCAL STATE =======
	// For columns (sections)
	const [localSections, setLocalSections] = useState<TSection[]>([]);
	// Dictionary: sectionId -> tasks
	const [sectionTasks, setSectionTasks] = useState<Record<string, TTask[]>>({});

	// Track the item being dragged for DragOverlay
	const [activeSection, setActiveSection] = useState<TSection | null>(null);
	const [activeTask, setActiveTask] = useState<TTask | null>(null);

	// Store original location for tasks to finalize cross-section in handleDragEnd
	// const [originSection, setOriginSection] = useState<string | null>(null);
	// const [originPosition, setOriginPosition] = useState<number | null>(null);

	// For reverting on error if needed (optional)
	const originalTasksRef = useRef<Record<string, TTask[]> | null>(null);

	// States for drop indicator
	const [hoverSection, setHoverSection] = useState<string | null>(null);
	const [dropIndex, setDropIndex] = useState<number | null>(null);

	const dispatch = useAppDispatch();
	const handleError = useErrorHandler();

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 1 },
		}),
	);

	// ======= Initialize localSections & sectionTasks from server data =======
	useEffect(() => {
		if (sections) {
			setLocalSections(sections);
		}
	}, [sections]);

	useEffect(() => {
		if (tasks) {
			const taskMap: Record<string, TTask[]> = {};
			tasks.forEach((task) => {
				if (!taskMap[task.section]) {
					taskMap[task.section] = [];
				}
				taskMap[task.section].push(task);
			});
			// Sort tasks in each section
			Object.keys(taskMap).forEach((secId) => {
				taskMap[secId].sort((a, b) => a.position - b.position);
			});
			setSectionTasks(taskMap);
		}
	}, [tasks]);

	const sectionIds = localSections.map((sec) => sec.id);

	const revertTasks = () => {
		if (originalTasksRef.current) {
			setSectionTasks(originalTasksRef.current);
			originalTasksRef.current = null;
		}
	};

	// ======= CREATE NEW SECTION =======
	const handleCreateSection = async () => {
		try {
			await createSection(boardId).unwrap();
			dispatch(
				showNotification({ message: 'Section created', type: 'success' }),
			);
		} catch (error) {
			handleError(error);
		}
	};

	// ======= REORDER SECTIONS =======
	const bulkUpdateSections = async (updatedSections: TSection[]) => {
		try {
			const dataForServer = updatedSections.map((section, index) => ({
				id: section.id,
				position: index,
			}));
			await reorderSections({ boardId, sections: dataForServer }).unwrap();
		} catch (error) {
			handleError(error);
			// revert localSections if needed
			if (sections) {
				setLocalSections(sections);
			}
		}
	};

	// ======= DND HANDLERS =======

	const handleDragStart = (event: DragStartEvent) => {
		const dragItem = event.active.data.current;
		if (!dragItem) return;

		// Store original tasks if you want to revert on error
		if (!originalTasksRef.current) {
			originalTasksRef.current = structuredClone(sectionTasks);
		}

		// Reset indicator
		setHoverSection(null);
		setDropIndex(null);

		if (dragItem.type === 'section') {
			setActiveSection(dragItem.section);
		} else if (dragItem.type === 'task') {
			const task = dragItem.task as TTask;
			setActiveTask(task);
			// setOriginSection(task.section);
			// setOriginPosition(task.position);
		}
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over || !active.data.current) {
			setHoverSection(null);
			setDropIndex(null);
			return;
		}

		const activeData = active.data.current;
		const overData = over.data.current;

		if (activeData.type === 'task') {
			const draggedTask = activeData.task as TTask;
			const fromSectionId = draggedTask.section;

			// If we are over a task
			if (overData?.type === 'task') {
				const overTask = overData.task as TTask;
				const toSectionId = overTask.section;

				if (fromSectionId === toSectionId) {
					setHoverSection(null);
					setDropIndex(null);
					return;
				}
				setHoverSection(toSectionId);
				setDropIndex(overTask.position);
			}
			// If we are over a section (empty space)
			else if (overData?.type === 'section') {
				const toSectionId = over.id as string;
				if (fromSectionId === toSectionId) {
					setHoverSection(null);
					setDropIndex(null);
					return;
				}
				const tasksInTarget = sectionTasks[toSectionId] || [];
				setHoverSection(toSectionId);
				setDropIndex(tasksInTarget.length);
			}
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		setActiveSection(null);
		setActiveTask(null);

		// Clear the indicator
		setHoverSection(null);
		setDropIndex(null);

		const { active, over } = event;
		if (!over) {
			// Dropped outside => revert
			revertTasks();
			return;
		}

		const activeData = active.data.current;
		const overData = over.data.current;

		// ======= Handle Section Reorder (columns) =======
		if (activeData?.type === 'section' && overData?.type === 'section') {
			setLocalSections((prev) => {
				if (!prev) return prev;
				const fromIndex = prev.findIndex((s) => s.id === activeData.section.id);
				const toIndex = prev.findIndex((s) => s.id === overData.section.id);
				if (fromIndex === toIndex) return prev;

				// Use arrayMove for columns
				const reordered = arrayMove(prev, fromIndex, toIndex);
				bulkUpdateSections(reordered);
				return reordered;
			});
			return;
		}

		// ======= Handle Task Moves (both same-section & cross-section) =======
		if (activeData?.type === 'task') {
			const droppedTask = activeData.task as TTask;

			let targetSectionId: string;
			let targetIndex: number;

			// If we dropped on a specific task
			if (overData?.type === 'task') {
				const overTask = overData.task as TTask;
				targetSectionId = overTask.section;
				targetIndex = overTask.position;
			} else if (overData?.type === 'section') {
				targetSectionId = over.id as string;
				const tasksInTarget = sectionTasks[targetSectionId] || [];
				targetIndex = tasksInTarget.length; // place at the end
			} else {
				revertTasks();
				return;
			}

			const fromSectionId = droppedTask.section;
			// const fromIndex = originPosition || 0;
			const isSameSection = fromSectionId === targetSectionId;

			// ========== OPTIMISTIC UPDATE ==========
			try {
				if (isSameSection) {
					setSectionTasks((prev) => {
						const cloned = structuredClone(prev) as Record<string, TTask[]>;
						const tasksInSection = cloned[fromSectionId];

						const oldIndex = tasksInSection.findIndex(
							(t) => t.id === droppedTask.id,
						);
						const newIndex = targetIndex;

						if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
							return cloned;
						}

						const moved = arrayMove(tasksInSection, oldIndex, newIndex);

						moved.forEach((task, i) => {
							task.position = i;
						});
						cloned[fromSectionId] = moved;
						return cloned;
					});

					await moveTask({
						boardId,
						taskId: droppedTask.id,
						fromSection: fromSectionId,
						toSection: fromSectionId,
						position: targetIndex,
					}).unwrap();
				} else {
					setSectionTasks((prev) => {
						const cloned = structuredClone(prev) as Record<string, TTask[]>;

						cloned[fromSectionId] = cloned[fromSectionId].filter(
							(t) => t.id !== droppedTask.id,
						);

						if (!cloned[targetSectionId]) cloned[targetSectionId] = [];
						const updatedTask = { ...droppedTask, section: targetSectionId };
						cloned[targetSectionId].splice(targetIndex, 0, updatedTask);

						cloned[targetSectionId].forEach((task, i) => {
							task.position = i;
						});

						return cloned;
					});

					await moveTask({
						boardId,
						taskId: droppedTask.id,
						fromSection: fromSectionId,
						toSection: targetSectionId,
						position: targetIndex,
					}).unwrap();
				}
			} catch (error) {
				handleError(error);
				revertTasks();
			} finally {
				originalTasksRef.current = null;
				// setOriginSection(null);
				// setOriginPosition(null);
			}
		}
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<Box
				sx={{
					flexGrow: 1,
					display: 'flex',
					alignItems: 'flex-start',
					gap: 1,
					mt: 1,
					overflowX: 'auto',
				}}
			>
				{/* Loading indicator */}
				{(sectionsLoading || tasksLoading) && <Loading />}

				{/* SortableContext for columns */}
				{localSections && (
					<SortableContext
						items={sectionIds}
						strategy={horizontalListSortingStrategy}
					>
						{localSections.map((section) => {
							// We pass the tasks from sectionTasks
							const tasksInSection = sectionTasks[section.id] || [];
							const indicatorIndex =
								hoverSection === section.id ? dropIndex : null;

							return (
								<SectionColumn
									key={section.id}
									section={section}
									tasks={tasksInSection}
									dropIndex={indicatorIndex}
								/>
							);
						})}

						{/* Create New Section Button */}
						<Box
							component="button"
							onClick={handleCreateSection}
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

						{/* Drag Overlay */}
						{createPortal(
							<DragOverlay>
								{activeSection && (
									<SectionColumn
										section={activeSection}
										tasks={sectionTasks[activeSection.id] || []}
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
