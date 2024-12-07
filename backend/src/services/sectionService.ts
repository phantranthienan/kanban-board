import { CustomError } from "../errors/CustomError";
import { SectionDocument, TSection, createSection, getSectionById, updateSectionById, deleteSectionById, getSectionsByBoardId, bulkUpdateSections } from "../models/sectionModel";
import { getNumberOfSectionsInBoard } from "../models/boardModel";

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
/**
 * Delete a section and reorder remaining sections.
 * @param {string} boardId - The ID of the board containing the section.
 * @param {string} sectionId - The ID of the section to delete.
 * @return {Promise<void>}
 */
export const deleteAndReorderSections = async (boardId: string, sectionId: string): Promise<void> => {
    // Get the section to delete
    const sectionToDelete = await getSectionById(sectionId);

    if (!sectionToDelete) {
        throw new CustomError('Section not found', 404);
    }

    await deleteSectionById(sectionId);

    // Fetch all sections in the same board that come after the deleted section
    const sectionsToUpdate = await getSectionsByBoardId(boardId).then((sections) =>
        sections.filter((section) => section.position > sectionToDelete.position)
    );

    // Update the position of each section
    await Promise.all(
        sectionsToUpdate.map((section) =>
            updateSectionById(section.id, { position: section.position - 1 })
        )
    );
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


/**
 * Update positions of multiple sections within a board.
 * @param {string} boardId - The ID of the board.
 * @param {Array<{ id: string, position: number }>} sections - Sections with updated positions.
 * @return {Promise<void>}
 */
export const updateSectionPositions = async (boardId: string, sections: { id: string; position: number }[]) => {
    await bulkUpdateSections(boardId, sections);
};