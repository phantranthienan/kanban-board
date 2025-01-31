import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	useMemo,
} from 'react';
import {
	DndContext,
	DragStartEvent,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
	DragOverEvent,
	defaultDropAnimationSideEffects,
	pointerWithin,
	closestCenter,
	getFirstCollision,
	closestCorners,
} from '@dnd-kit/core';

import { arrayMove } from '@dnd-kit/sortable';

import { Box, Typography } from '@mui/material';

import { useAppDispatch } from '../../hooks/storeHooks';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { showNotification } from '../../redux/slices/notificationSlice';

import {
	useGetSectionsQuery,
	useCreateSectionMutation,
	useUpdateSectionMutation,
} from '../../redux/slices/api/sectionApiSlice';

import { useUpdateBoardMutation } from '../../redux/slices/api/boardApiSlice';

import Loading from '../common/Loading';
import SectionColumn from './Section/SectionColumn';
import TaskItem from './Section/Task/TaskCard';
import SectionsList from './Section/SectionsList';

import { TSection } from '../../types/common/section';
import { TTask } from '../../types/common/task';
import { TBoard } from '../../types/common/board';
import { mapOrder } from '../../utils/sorts';
import { cloneDeep } from 'lodash';

type BoardBodyProps = {
	board: TBoard;
};

const BoardBody: React.FC<BoardBodyProps> = ({ board }) => {
	const dispatch = useAppDispatch();
	const handleError = useErrorHandler();

	// Queries and mutations
	const { data: sections, isLoading: sectionsLoading } = useGetSectionsQuery({
		boardId: board.id,
	});

	const [updateBoard] = useUpdateBoardMutation();
	const [updateSection] = useUpdateSectionMutation();
	const [createSection, { isLoading: isCreating }] = useCreateSectionMutation();

	// Local state
	const [localSections, setLocalSections] = useState<TSection[]>([]);
	const orderedSections = useMemo(() => {
		if (sections) {
			return mapOrder(sections, board.sectionsOrder, 'id');
		}
		return [];
	}, [board.sectionsOrder, sections]);

	useEffect(() => {
		setLocalSections(orderedSections);
	}, [orderedSections]);

	// Active item state (dragged item)
	const [activeItemId, setActiveItemId] = useState<string | null>(null);
	const [activeItemType, setActiveItemType] = useState<string | null>(null);
	const [activeItemData, setActiveItemData] = useState<TSection | TTask | null>(
		null,
	);
	const [oldSectionWhenDraggingTask, setOldSectionWhenDraggingTask] =
		useState<TSection | null>(null);
	// id of the last intersection (handle collision detection)
	const lastOverId = useRef<string | null>(null);

	// Handlers
	const handleCreateSection = async () => {
		try {
			await createSection({ boardId: board.id }).unwrap();
			dispatch(
				showNotification({ message: 'Section created', type: 'success' }),
			);
		} catch (error) {
			handleError(error);
		}
	};

	// Drag and Drop helpers
	const pointerSensor = useSensor(PointerSensor, {
		activationConstraint: { distance: 5 },
	});
	const sensors = useSensors(pointerSensor);

	const findSectionByTask = (task: TTask): TSection | undefined => {
		return localSections.find((section) => section.tasks.includes(task));
	};

	// Dnd handlers

	// triggered when a drag starts
	const handleDragStart = (event: DragStartEvent) => {
		setActiveItemId(event.active?.id.toString());
		setActiveItemType(event.active.data.current?.type);
		if (event.active.data.current?.type === 'section') {
			const section = event.active.data.current.section as TSection;
			setActiveItemData(section);
		} else if (event.active.data.current?.type === 'task') {
			const task = event.active.data.current.task as TTask;
			setActiveItemData(task);
			setOldSectionWhenDraggingTask(findSectionByTask(task)!);
		}
	};

	// triggered when dragging over an element
	const handleDragOver = (event: DragOverEvent) => {
		if (activeItemType === 'section') return;

		const { active, over } = event;

		if (!active || !over) return;

		// activeTask is the task being dragged
		const {
			id: activeTaskId,
			data: { current: activeTaskData },
		} = active;
		// overTask is the task being dragged over
		const {
			id: overTaskId,
			data: { current: overTaskData },
		} = over;

		// find the section of the active and over tasks
		const activeSection = findSectionByTask(activeTaskData?.task);
		const overSection = findSectionByTask(overTaskData?.task);

		if (!activeSection || !overSection) return;
		if (activeSection.id === overSection.id) return;
		// handle the case where the task is dragged over a different section
		// if the task is dragged over the same section, we don't need to do anything
		if (activeSection.id !== overSection.id) {
			setLocalSections((prevSections) => {
				// find the index of the task in the over section (where the task is being dragged over)
				const overTaskIndex = overSection?.tasksOrder.indexOf(
					overTaskId as string,
				);

				// logic to determine where to insert the task
				const isBelowOverItem =
					active.rect.current.translated &&
					active.rect.current.translated.top > over.rect.top + over.rect.height;
				const modifier = isBelowOverItem ? 1 : 0;

				const newTaskIndex =
					overTaskIndex >= 0
						? overTaskIndex + modifier
						: overSection?.tasks.length + 1;

				// clone old sections to handle reordering and updating
				const newSections = cloneDeep(prevSections);
				const newActiveSection = newSections.find(
					(section) => section.id === activeSection.id,
				);
				const newOverSection = newSections.find(
					(section) => section.id === overSection.id,
				);

				// old section
				if (newActiveSection) {
					// Remove task from active section
					newActiveSection.tasks = newActiveSection.tasks.filter(
						(task) => task.id !== activeTaskId,
					);
					// Update tasks order
					newActiveSection.tasksOrder = newActiveSection.tasks.map(
						(task) => task.id,
					);
				}

				// new section
				if (newOverSection) {
					// Check if task already exists in the over section, if so, remove it
					newOverSection.tasks = newOverSection.tasks.filter(
						(task) => task.id !== activeTaskId,
					);
					// Insert task into the over section at the new index
					// when drag ends, the task should be updated with the new section id
					newOverSection.tasks = [
						...newOverSection.tasks.slice(0, newTaskIndex),
						{
							...activeTaskData?.task,
							section: newOverSection.id,
						},
						...newOverSection.tasks.slice(newTaskIndex),
					];
					// Update tasks order
					newOverSection.tasksOrder = newOverSection.tasks.map(
						(task) => task.id,
					);
				}

				return newSections;
			});
		}
	};

	// triggered when a drag ends
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		// if there is no active or over element, return
		if (!active || !over) return;

		// handle reordering of tasks
		if (activeItemType === 'task') {
			// activeTask is the task being dragged
			const {
				id: activeTaskId,
				data: { current: activeTaskData },
			} = active;
			// overTask is the task being dragged over
			const {
				id: overTaskId,
				data: { current: overTaskData },
			} = over;

			// find the section of the active and over tasks
			const activeSection = findSectionByTask(activeTaskData?.task);
			const overSection = findSectionByTask(overTaskData?.task);

			// if there is no active or over section, return
			if (!activeSection || !overSection) return;

			// handle the case where the task is dragged over a different section
			if (oldSectionWhenDraggingTask?.id !== overSection.id) {
				// find the index of the task in the over section (where the task is being dragged over)
				const overTaskIndex = overSection?.tasksOrder.indexOf(
					overTaskId as string,
				);

				// logic to determine where to insert the task
				const isBelowOverItem =
					active.rect.current.translated &&
					active.rect.current.translated.top > over.rect.top + over.rect.height;
				const modifier = isBelowOverItem ? 1 : 0;

				const newTaskIndex =
					overTaskIndex >= 0
						? overTaskIndex + modifier
						: overSection?.tasks.length + 1;

				// clone old sections to handle reordering and updating
				const newSections = cloneDeep(localSections);
				const newActiveSection = newSections.find(
					(section) => section.id === oldSectionWhenDraggingTask?.id,
				);
				const newOverSection = newSections.find(
					(section) => section.id === overSection.id,
				);

				// old section
				if (newActiveSection) {
					// Remove task from active section
					newActiveSection.tasks = newActiveSection.tasks.filter(
						(task) => task.id !== activeTaskId,
					);
					// Update tasks order
					newActiveSection.tasksOrder = newActiveSection.tasks.map(
						(task) => task.id,
					);
				}

				// new section
				if (newOverSection) {
					// Check if task already exists in the over section, if so, remove it
					newOverSection.tasks = newOverSection.tasks.filter(
						(task) => task.id !== activeTaskId,
					);
					// Insert task into the over section at the new index
					// when drag ends, the task should be updated with the new section id
					newOverSection.tasks = [
						...newOverSection.tasks.slice(0, newTaskIndex),
						{
							...activeTaskData?.task,
							section: newOverSection.id,
						},
						...newOverSection.tasks.slice(newTaskIndex),
					];
					// Update tasks order
					newOverSection.tasksOrder = newOverSection.tasks.map(
						(task) => task.id,
					);
				}

				setLocalSections(newSections);

				// we send request after updating the local state to avoid flickering
				updateSection({
					id: oldSectionWhenDraggingTask?.id,
					board: board.id,
					tasks: newActiveSection?.tasksOrder,
					tasksOrder: newActiveSection?.tasksOrder,
				});

				updateSection({
					id: overSection.id,
					board: board.id,
					tasks: newOverSection?.tasksOrder,
					tasksOrder: newOverSection?.tasksOrder,
				});
			}
			// handle the case where the task is dragged over the same section
			else {
				const oldTaskIndex = oldSectionWhenDraggingTask?.tasksOrder.indexOf(
					activeItemId!,
				);
				const newTaskIndex = overSection?.tasksOrder.indexOf(
					overTaskId as string,
				);

				// reorder tasks in the same section like reordering sections
				// const reorderedTasks = arrayMove(
				// 	oldSectionWhenDraggingTask?.tasks,
				// 	oldTaskIndex,
				// 	newTaskIndex,
				// );
				// console.log(oldSectionWhenDraggingTask.tasksOrder);
				const oldTasksOrder = oldSectionWhenDraggingTask?.tasksOrder;
				const newTasksOrder = arrayMove(
					oldTasksOrder,
					oldTaskIndex,
					newTaskIndex,
				);

				setLocalSections((prevSections) => {
					const newSections = cloneDeep(prevSections);

					const targetSection = newSections.find(
						(section) => section.id === overSection.id,
					);

					// targetSection!.tasks = reorderedTasks;
					targetSection!.tasksOrder = newTasksOrder;
					return newSections;
				});

				// we send request after updating the local state to avoid flickering
				updateSection({
					id: oldSectionWhenDraggingTask?.id,
					board: board.id,
					tasks: newTasksOrder,
					tasksOrder: newTasksOrder,
				});
			}
		}

		// handle reordering of sections
		if (activeItemType === 'section') {
			if (active.id !== over.id) {
				// find the index of the active and over sections
				const oldSectionIndex = localSections.findIndex(
					(s) => s.id === active.id,
				);
				const newSectionIndex = localSections.findIndex(
					(s) => s.id === over.id,
				);

				const reorderedSections = arrayMove(
					localSections,
					oldSectionIndex,
					newSectionIndex,
				);
				const newSectionsOrder = reorderedSections.map((s) => s.id);

				setLocalSections(reorderedSections);

				// we send request after updating the local state to avoid flickering
				updateBoard({
					id: board.id,
					sectionsOrder: newSectionsOrder,
				});
			}
		}

		setActiveItemId(null);
		setActiveItemType(null);
		setActiveItemData(null);
		setOldSectionWhenDraggingTask(null);
	};

	const customDropAnimation = {
		sideEffects: defaultDropAnimationSideEffects({
			styles: {
				active: {
					opacity: '0.5',
				},
			},
		}),
	};

	// custom collision detection strategy
	const collisionDetectionStrategy = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(args: any) => {
			if (activeItemType === 'section') {
				return closestCorners({ ...args });
			}

			// find the intersections of the pointer with the elements
			const pointerIntersections = pointerWithin(args);

			if (!pointerIntersections.length) return [];

			// return the first collision
			let overId = getFirstCollision(pointerIntersections, 'id');

			if (overId) {
				const checkSection = localSections.find(
					(section) => section.id === overId,
				);
				if (checkSection) {
					overId = closestCenter({
						...args,
						droppableContainers: args.droppableContainers.filter(
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							(container: any) => {
								return (
									container.id !== overId &&
									checkSection?.tasksOrder.includes(container.id)
								);
							},
						),
					})[0].id;
				}

				lastOverId.current = overId as string;
				return [{ id: overId }];
			}

			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		},
		[activeItemType, localSections],
	);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={collisionDetectionStrategy}
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
				{sectionsLoading && <Loading />}
				{/* SortableContext for columns */}
				{localSections && <SectionsList sections={localSections} />}
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
				<DragOverlay dropAnimation={customDropAnimation}>
					{(!activeItemId || !activeItemType) && null}
					{activeItemType === 'section' && (
						<SectionColumn section={activeItemData as TSection} />
					)}
					{activeItemType === 'task' && (
						<TaskItem task={activeItemData as TTask} />
					)}
				</DragOverlay>
			</Box>
		</DndContext>
	);
};

export default BoardBody;
