import React, { useMemo } from 'react';
import {
	verticalListSortingStrategy,
	SortableContext,
} from '@dnd-kit/sortable';

import { TTask } from '../../../../types/common/task';
import TaskCard from './TaskCard';

type TasksListProps = {
	tasks: TTask[];
};

const TasksList: React.FC<TasksListProps> = ({ tasks }) => {
	const taskIds = useMemo(
		() => tasks.map((task) => task.id),
		[tasks], // Stable array reference unless tasks change
	);
	return (
		<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
			{tasks.map((task) => {
				return (
					<React.Fragment key={task.id}>
						<TaskCard task={task} />
					</React.Fragment>
				);
			})}
		</SortableContext>
	);
};

export default TasksList;
