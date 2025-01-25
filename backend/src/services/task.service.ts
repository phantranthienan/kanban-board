import { CustomError } from "@/errors";
import { 
    TaskDocument, TTask, getTaskById, createTask, updateTaskById, deleteTaskById, 
    getTasksBySectionId
} from "@/models/task.model";
/**
 * Creates a new task in a section.
 * @param {Omit<TTask, 'position'>} taskData - The task data without the position field.
 * @return {Promise<TaskDocument>} The newly created task document.
 * @throws {CustomError} Throws an error if task creation fails.
 */
export const createNewTask = async (taskData: TTask): Promise<TaskDocument> => {
    try {
        const newTask = await createTask(taskData);
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
 * Deletes a task by its ID and reorders the remaining tasks in the same section.
 * @param sectionId - The ID of the section containing the task.
 * @param taskId - The ID of the task to be deleted.
 * @returns A promise that resolves when the task is deleted and the remaining tasks are reordered.
 * @throws {CustomError} If the task is not found.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
    const taskToDelete = await getTaskById(taskId);

    if (!taskToDelete) {
        throw new CustomError('Task not found', 404);
    }

    await deleteTaskById(taskId);
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
