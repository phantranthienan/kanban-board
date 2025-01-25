import mongoose, { Schema, HydratedDocument, InferSchemaType } from 'mongoose';
import { Section } from '@/models/section.model';

const taskSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String,
        default: '',
    },
    deadline: { 
        type: Date,
        required: true
    },
    section: { 
        type: Schema.Types.ObjectId, 
        ref: 'Section', 
        required: true 
    },
    subtasks: {
        type: [String],
        default: []
    },
    board: {
        type: Schema.Types.ObjectId,
        ref: 'Board',
        required: true
    },
    isPlaceHolder: {
        type: Boolean,
        default: false
    }
});

taskSchema.set('toJSON', {
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

taskSchema.post('save', async (doc) => {
    if (doc) {
        await Section.findByIdAndUpdate(doc.section, { $push: { tasks: doc._id } });
        await Section.findByIdAndUpdate(doc.section, { $push: { tasksOrder: doc._id } });
    }
});

taskSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Section.findByIdAndUpdate(doc.section, { $pull: { tasks: doc._id } });
        await Section.findByIdAndUpdate(doc.section, { $pull: { tasksOrder: doc._id } });
    }
});

export type TTask = InferSchemaType<typeof taskSchema>;

export type TaskDocument = HydratedDocument<TTask>;

export const Task = mongoose.model<TaskDocument>('Task', taskSchema);

/**
 * Create a new task
 * @param {TTask} taskData - The data for creating a new task
 * @return {Promise<TaskDocument>} The newly created task document
 */
export const createTask = async (taskData: TTask): Promise<TaskDocument>  => {
    const task = new Task(taskData);
    return await task.save();
};

/**
 * Find a task by its ID
 * @param {string} id - The ID of the task to find
 * @return {Promise<TaskDocument | null>} The task document if found, otherwise null
 */
export const getTaskById = async (id: string): Promise<TaskDocument | null> => {
    return await Task.findById(id);
};

/**
 * Get all tasks for a section
 * @param {string} sectionId - The ID of the section to find tasks for
 * @return {Promise<TaskDocument[]>} The array of task documents for the section
 */
export const getTasksBySectionId = async (sectionId: string): Promise<TaskDocument[]> => {
    return await Task.find({ section: sectionId });
}

/**
 * Get all tasks for a board
 * @param {string} boardId - The ID of the board to find tasks for
 * @return {Promise<TaskDocument[]>} The array of task documents for the board
 */
export const getTasksByBoardId = async (boardId: string): Promise<TaskDocument[]> => {
    return await Task.find({ board: boardId });
}

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
