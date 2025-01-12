import mongoose, { Schema, HydratedDocument, InferSchemaType } from 'mongoose';
import { Board } from './board.model';
import { Task } from './task.model';

const sectionSchema = new Schema({
    title: { 
        type: String, 
        default: 'Untitled Section'
    },
    position: { 
        type: Number, 
        required: true 
    },
    board: { 
        type: Schema.Types.ObjectId, 
        ref: 'Board', required: true 
    },
    tasks: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Task' 
    }],
});

sectionSchema.set('toJSON', {
    transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

sectionSchema.post('save', async (doc) => {
    if (doc) {
        await Board.findByIdAndUpdate(doc.board, { $push: { sections: doc._id } });
    }
});

sectionSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Task.deleteMany({ section: doc._id });
        await Board.findByIdAndUpdate(doc.board, { $pull: { sections: doc._id } });
    }
})

export type TSection = InferSchemaType<typeof sectionSchema>;

export type SectionDocument = HydratedDocument<TSection>;

export const Section = mongoose.model<SectionDocument>('Section', sectionSchema);

/**
 * Create a new section
 * @param {TSection} sectionData - The data for creating a new section
 * @return {Promise<SectionDocument>} The newly created section document
 */
export const createSection = async (sectionData: TSection): Promise<SectionDocument> => {
    const section = new Section(sectionData);
    return await section.save();
};

/**
 * Get a section by its ID, populating its tasks
 * @param {string} id - The ID of the section to find
 * @return {Promise<SectionDocument | null>} The section document if found, otherwise null
 */
export const getSectionById = async (id: string): Promise<SectionDocument | null> => {
    return await Section.findById(id);
};

/**
 * Get all sections for a board
 * @param {string} boardId - The ID of the board to find sections for
 * @return {Promise<SectionDocument[]>} The array of section documents for the board
 */
export const getSectionsByBoardId = async (boardId: string): Promise<SectionDocument[]> => {
    return await Section.find({ board: boardId }).sort({ position: 1});
}

/**
 * Update an existing section by ID
 * @param {string} id - The ID of the section to update
 * @param {Partial<TSection>} updateData - The data to update in the section document
 * @return {Promise<SectionDocument | null>} The updated section document, or null if not found
 */
export const updateSectionById = async (id: string, updateData: Partial<TSection>): Promise<SectionDocument | null> => {
    return await Section.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Delete a section by ID
 * @param {string} id - The ID of the section to delete
 * @return {Promise<SectionDocument | null>} The deleted section document, or null if not found
 */
export const deleteSectionById = async (id: string): Promise<SectionDocument | null> => {
    return await Section.findByIdAndDelete(id);
};

/**
 * Get number of tasks in a section
 * @param {string} id - The ID of the section to count tasks
 * @return {Promise<number>} The number of tasks in the section
 */
export const getNumberOfTasksInSection = async (id: string): Promise<number> => {
    const section = await Section.findById(id);
    return section?.tasks.length || 0;
}

/**
 * Remove a task from a section
 * @param {string} sectionId - The ID of the section to remove the task from
 * @param {string} taskId - The ID of the task to remove
 * @return {Promise<void>}
 */
export const removeTaskFromSection = async (sectionId: string, taskId: string): Promise<void> => {
    await Section.findByIdAndUpdate(sectionId, { $pull: { tasks: taskId } });
}

/**
 * Add a task to a section
 * @param {string} sectionId - The ID of the section to add the task to
 * @param {string} taskId - The ID of the task to add
 * @return {Promise<void>}
 */
export const addTaskToSection = async (sectionId: string, taskId: string): Promise<void> => {
    await Section.findByIdAndUpdate(sectionId, { $push: { tasks: taskId } });
}

/**
 * Bulk update sections' positions
 * @param {string} boardId - The ID of the board.
 * @param {Array<{ id: string, position: number }>} sections - Sections with updated positions.
 * @return {Promise<void>}
 */
export const bulkUpdateSections = async (boardId: string, sections: Array<{ id: string, position: number }>): Promise<void> => {
    const bulkOps = sections.map(({ id, position }) => ({
        updateOne: {
            filter: { _id: id, board: boardId },
            update: { position },
        }
    }));

    await Section.bulkWrite(bulkOps);
}