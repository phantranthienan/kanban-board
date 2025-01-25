import { CustomError } from "@/errors";
import { SectionDocument, TSection, createSection, getSectionById, updateSectionById, deleteSectionById, getSectionsByBoardId } from "@/models/section.model";
import { createTask } from "@/models/task.model";
/**
 * Create a new section.
 * @param {TSection} sectionData - Section data without position.
 * @return {Promise<SectionDocument>} The new section document.
 */
export const createNewSection = async (sectionData: TSection): Promise<SectionDocument> => {
    try {
        const newSection = await createSection(sectionData);
        const placeHolderTask = {
            title: 'Placeholder Task',
            section: newSection._id,
            board: newSection.board,
            description: 'This is a placeholder task',
            isPlaceHolder: true,
            subtasks: [],
            deadline: new Date()
        };
        await createTask(placeHolderTask);
        return newSection;
    } catch (error) {
        throw new CustomError('Failed to create section', 500);
    }
};

/**
 * Fetch a section by ID.
 * @param {string} sectionId - Section ID.
 * @return {Promise<SectionDocument>} The section document.
 */
export const getSection = async (sectionId: string): Promise<SectionDocument> => {
    const section = await getSectionById(sectionId);
    if (!section) {
        throw new CustomError('Section not found', 404);
    }
    return section;
};

/**
 * Fetch all sections for a board.
 * @param {string} boardId - Board ID.
 * @return {Promise<SectionDocument[]>} Array of section documents.
 */
export const getSectionsOfBoard = async (boardId: string): Promise<SectionDocument[]> => {
    return await getSectionsByBoardId(boardId);
}

/**
 * Delete a section and reorder remaining sections.
 * @param {string} sectionId - Section ID.
 * @return {Promise<void>}
 */
export const deleteSection = async (sectionId: string): Promise<void> => {
    const sectionToDelete = await getSectionById(sectionId);

    if (!sectionToDelete) {
        throw new CustomError('Section not found', 404);
    }

    await deleteSectionById(sectionId);
};

/**
 * Update a section by ID.
 * @param {string} sectionId - Section ID.
 * @param {Partial<TSection>} sectionData - Data to update.
 * @return {Promise<SectionDocument>} The updated section document.
 */
export const updateSection = async (sectionId: string, sectionData: Partial<TSection>): Promise<SectionDocument> => {
    const updatedSection = await updateSectionById(sectionId, sectionData);
    if (!updatedSection) {
        throw new CustomError('Section not found', 404);
    }
    return updatedSection;
};