// src/models/taskModel.ts
import { Schema, model, HydratedDocument, InferSchemaType } from 'mongoose';

const subtaskSchema = new Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const taskSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String,
        required: true
    },
    position: { 
        type: Number, 
        default: 0 
    },
    section: { 
        type: Schema.Types.ObjectId, 
        ref: 'Section', 
        required: true 
    },
    subtasks: { 
        type: [subtaskSchema], 
        default: [] 
    },
    deadline: { 
        type: Date,
        required: true
    },
}, { timestamps: true });

type TTask = InferSchemaType<typeof taskSchema>;

export type TaskDocument = HydratedDocument<TTask>;

export const Task = model<TaskDocument>('Task', taskSchema);

/**
 * Create a new task
 * @param {TTask} taskData - The data for creating a new task
 * @return {Promise<TaskDocument>} The newly created task document
 */
export const createTask = async (taskData: TTask): Promise<TaskDocument> => {
    const task = new Task(taskData);
    return await task.save();
};

/**
 * Find a task by its ID
 * @param {string} id - The ID of the task to find
 * @return {Promise<TaskDocument | null>} The task document if found, otherwise null
 */
export const getTaskById = async (id: string): Promise<TaskDocument | null> => {
    return await Task.findById(id).populate('section');
};

/**
 * Update an existing task by ID
 * @param {string} id - The ID of the task to update
 * @param {Partial<TTask>} updateData - The data to update in the task document
 * @return {Promise<TaskDocument | null>} The updated task document, or null if not found
 */
export const updateTaskById = async (id: string, updateData: Partial<TTask>): Promise<TaskDocument | null> => {
    return await Task.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Delete a task by ID
 * @param {string} id - The ID of the task to delete
 * @return {Promise<TaskDocument | null>} The deleted task document, or null if not found
 */
export const deleteTaskById = async (id: string): Promise<TaskDocument | null> => {
    return await Task.findByIdAndDelete(id);
};
