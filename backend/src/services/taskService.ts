import { CustomError } from "../errors/CustomError";
import { 
    TaskDocument, TTask, getTaskById, createTask, updateTaskById, deleteTaskById, 
    getTasksBySectionId, getTasksByBoardId, adjustPositionsInSection
} from "../models/taskModel";
import { getNumberOfTasksInSection, removeTaskFromSection, addTaskToSection } from "../models/sectionModel";
import { Types } from "mongoose";

/**
 * Creates a new task in a section.
 * Determines the position of the task within the section, creates the task,
 * and adds the task ID to the corresponding section's tasks array.
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
 * Deletes a task by its ID.
 * Removes the task from the database and ensures that the task ID is also
 * removed from the corresponding section's tasks array.
 * @param {string} taskId - The ID of the task to delete.
 * @return {Promise<TaskDocument>} The deleted task document if found and successfully deleted.
 * @throws {CustomError} Throws an error if the task is not found or deletion fails.
 */
export const deleteTask = async (taskId: string): Promise<TaskDocument> => {
    const deletedTask = await deleteTaskById(taskId);
    if (!deletedTask) {
        throw new CustomError('Task deletion failed', 500);
    }    
    return deletedTask;
};

/**
 * Updates a task by its ID.
 * Finds the task by its ID and updates it with the provided data.
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
 * @
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
