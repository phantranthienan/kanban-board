import mongoose, { Schema, HydratedDocument, InferSchemaType } from 'mongoose';

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
 * Find a section by its ID
 * @param {string} id - The ID of the section to find
 * @return {Promise<SectionDocument | null>} The section document if found, otherwise null
 */
export const getSectionById = async (id: string): Promise<SectionDocument | null> => {
    return await Section.findById(id).populate('tasks');
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
 * Add a task to a section
 * @param {string} sectionId - The ID of the section to add the task to
 * @param {string} taskId - The ID of the task to add to the section
 * @return {Promise<Void>} The updated section document
 */
export const addTaskToSection = async (sectionId: string, taskId: string): Promise<void> => {
    await Section.findByIdAndUpdate(sectionId, { $push: { tasks: taskId } });
}

/**
 * Remove a task from a section
 * @param {string} sectionId - The ID of the section to remove the task from
 * @param {string} taskId - The ID of the task to remove from the section
 * @return {Promise<Void>} The updated section document
 */
export const removeTaskFromSection = async (sectionId: string, taskId: string): Promise<void> => {
    await Section.findByIdAndUpdate(sectionId, { $pull: { tasks: taskId } });
}