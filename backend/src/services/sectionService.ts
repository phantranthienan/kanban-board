import { CustomError } from "../errors/CustomError";
import { SectionDocument, TSection, createSection, getSectionById, updateSectionById, deleteSectionById, getSectionsByBoardId } from "../models/sectionModel";
import { getNumberOfSectionsInBoard, addSectionToBoard, removeSectionFromBoard } from "../models/boardModel";

/**
 * Create a new section and add it to the board.
 * @param {Omit<TSection, 'position'>} sectionData - The section data without position.
 * @return {Promise<SectionDocument>} The newly created section document.
 */
export const createNewSection = async (sectionData: Omit<TSection, 'position'>): Promise<SectionDocument> => {
    try {
        const sectionsCount = await getNumberOfSectionsInBoard(String(sectionData.board));
        const position = sectionsCount;
        const newSectionData = { ...sectionData, position };
        const newSection = await createSection(newSectionData);
        await addSectionToBoard(String(newSection.board), String(newSection._id));
        return newSection;
    } catch (error) {
        throw new CustomError('Failed to create section', 500);
    }
};

/**
 * Fetch a section by its ID.
 * @param {string} sectionId - The ID of the section.
 * @return {Promise<SectionDocument>} The section document if found.
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
 * @param {string} boardId - The ID of the board.
 * @return {Promise<SectionDocument[]>} An array of section documents.
 */
export const getSectionsOfBoard = async (boardId: string): Promise<SectionDocument[]> => {
    return await getSectionsByBoardId(boardId);
}

/**
 * Delete a section by its ID.
 * @param {string} sectionId - The ID of the section to delete.
 * @return {Promise<SectionDocument>} The deleted section document.
 */
export const deleteSection = async (sectionId: string): Promise<SectionDocument> => {
    const deletedSection = await deleteSectionById(sectionId);
    if (!deletedSection) {
        throw new CustomError('Section not found', 404);
    }
    await removeSectionFromBoard(String(deletedSection.board), sectionId);
    return deletedSection;
};


/**
 * Update an existing section by ID.
 * @param {string} sectionId - The ID of the section to update.
 * @param {Partial<TSection>} sectionData - The data to update.
 * @return {Promise<SectionDocument>} The updated section document.
 */
export const updateSection = async (sectionId: string, sectionData: Partial<TSection>): Promise<SectionDocument> => {
    const updatedSection = await updateSectionById(sectionId, sectionData);
    if (!updatedSection) {
        throw new CustomError('Section not found', 404);
    }
    return updatedSection;
};
