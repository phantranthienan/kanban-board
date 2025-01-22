import { CustomError } from "@/errors";
import { 
    TaskDocument, TTask, getTaskById, createTask, updateTaskById, deleteTaskById, 
    getTasksBySectionId, getTasksByBoardId, adjustPositionsInSection
} from "@/models/task.model";
import { getNumberOfTasksInSection, removeTaskFromSection, addTaskToSection } from "@/models/section.model";
import { Types } from "mongoose";

/**
 * Creates a new task in a section.
 * @param {Omit<TTask, 'position'>} taskData - The task data without the position field.
 * @return {Promise<TaskDocument>} The newly created task document.
 * @throws {CustomError} Throws an error if task creation fails.
 */
export const createNewTask = async (taskData: Omit<TTask, 'position'>): Promise<TaskDocument> => {
    try {
        const tasksCount = await getNumberOfTasksInSection(String(taskData.section));
        const position = tasksCount;

        const newTaskData = { ...taskData, position };
        const newTask = await createTask(newTaskData);

        return newTask;
    } catch (error) {
        throw new CustomError('Failed to create task', 500);
    }
};

/**
 * Retrieves a task by its ID.
 * @param {string} taskId - The ID of the task to retrieve.
 * @return {Promise<TaskDocument>} The task document if found.
 * @throws {CustomError} Throws an error if the task is not found.
 */
export const getTask = async (taskId: string): Promise<TaskDocument> => {
    const task = await getTaskById(taskId);
    if (!task) {
        throw new CustomError('Task not found', 404);
    }
    return task;
};

/**
 * Retrieves all tasks for a section.
 * @param {string} sectionId - The ID of the section to retrieve tasks for.
 * @return {Promise<TaskDocument[]>} The array of task documents for the section.
 */
export const getTasksOfASection = async (sectionId: string): Promise<TaskDocument[]> => {
    return await getTasksBySectionId(sectionId);
}

/**
 * Retrieves all tasks for a board.
 * @param {string} boardId - The ID of the board to retrieve tasks for.
 * @return {Promise<TaskDocument[]>} The array of task documents for the board.
 */
export const getTasksOfABoard = async (boardId: string): Promise<TaskDocument[]> => {
    return await getTasksByBoardId(boardId);
}

/**
 * Deletes a task by its ID and reorders the remaining tasks in the same section.
 * @param sectionId - The ID of the section containing the task.
 * @param taskId - The ID of the task to be deleted.
 * @returns A promise that resolves when the task is deleted and the remaining tasks are reordered.
 * @throws {CustomError} If the task is not found.
 */
export const deleteAndReorderTasks = async (
    sectionId: string,
    taskId: string
): Promise<void> => {
    const taskToDelete = await getTaskById(taskId);

    if (!taskToDelete) {
        throw new CustomError('Task not found', 404);
    }

    await deleteTaskById(taskId);

    const tasksToUpdate = await getTasksBySectionId(sectionId);
    const updates = tasksToUpdate
        .filter((task) => task.position > taskToDelete.position)
        .map((task) =>
            updateTaskById(task.id, { position: task.position - 1 })
        );

    await Promise.all(updates);
};

/**
 * Updates a task by its ID.
 * @param {string} taskId - The ID of the task to update.
 * @param {Partial<TTask>} taskData - The data to update the task with.
 * @return {Promise<TaskDocument>} The updated task document if found.
 * @throws {CustomError} Throws an error if the task is not found.
 */
export const updateTask = async (taskId: string, taskData: Partial<TTask>): Promise<TaskDocument> => {
    const updatedTask = await updateTaskById(taskId, taskData);
    if (!updatedTask) {
        throw new CustomError('Task not found', 404);
    }
    return updatedTask;
};

/**
 * Moves a task to a new section and updates its position.
 * @param {string} taskId - The ID of the task to move.
 * @param {string} sourceSectionId - The ID of the new section to move the task to.
 * @param {string} targetSectionId - The ID of the target section to move the task to.
 * @param {number} targetPosition - The new position of the task in the target section.
 */
export const moveAndReorderTask = async (
    taskId: string,
    sourceSectionId: string,
    targetSectionId: string,
    targetPosition: number,
): Promise<void> => {
    const task = await getTaskById(taskId);
    if (!task) {
        throw new CustomError('Task not found', 404);
    }
    const sourcePosition = task.position;
    if (sourceSectionId !== targetSectionId) {
        await adjustPositionsInSection(sourceSectionId, sourcePosition + 1, null, -1);
        await removeTaskFromSection(sourceSectionId, taskId);

        await adjustPositionsInSection(targetSectionId, targetPosition, null, 1);
        await addTaskToSection(targetSectionId, taskId);

        await updateTask(taskId, { section: new Types.ObjectId(targetSectionId), position: targetPosition });
    } else {
        if (sourcePosition < targetPosition) {
            await adjustPositionsInSection(sourceSectionId, sourcePosition + 1, targetPosition, -1);
        } else if (sourcePosition > targetPosition) {
            await adjustPositionsInSection(sourceSectionId, targetPosition, sourcePosition - 1, 1);
        }
        await updateTask(taskId, { position: targetPosition });
    }
};
