import { CustomError } from "@/errors";
import { SectionDocument, TSection, createSection, getSectionById, updateSectionById, deleteSectionById, getSectionsByBoardId, bulkUpdateSections } from "@/models/section.model";
import { getNumberOfSectionsInBoard } from "@/models/board.model";

/**
 * Create a new section.
 * @param {Omit<TSection, 'position'>} sectionData - Section data without position.
 * @return {Promise<SectionDocument>} The new section document.
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
 * @param {string} boardId - Board ID.
 * @param {string} sectionId - Section ID.
 * @return {Promise<void>}
 */
export const deleteAndReorderSections = async (boardId: string, sectionId: string): Promise<void> => {
    const sectionToDelete = await getSectionById(sectionId);

    if (!sectionToDelete) {
        throw new CustomError('Section not found', 404);
    }

    await deleteSectionById(sectionId);

    const sectionsToUpdate = await getSectionsByBoardId(boardId).then((sections) =>
        sections.filter((section) => section.position > sectionToDelete.position)
    );

    await Promise.all(
        sectionsToUpdate.map((section) =>
            updateSectionById(section.id, { position: section.position - 1 })
        )
    );
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

/**
 * Update positions of multiple sections.
 * @param {string} boardId - Board ID.
 * @param {Array<{ id: string, position: number }>} sections - Sections with updated positions.
 * @return {Promise<void>}
 */
export const updateSectionPositions = async (boardId: string, sections: { id: string; position: number }[]) => {
    await bulkUpdateSections(boardId, sections);
};
