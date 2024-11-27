import { Request, Response } from 'express';
import * as sectionService from '../services/sectionService';

/**
 * Create a new section for a specific board.
 * @route POST /boards/:boardId/sections
 * @param {Request} req - Express request object containing boardId and section data.
 * @param {Response} res - Express response object.
 */
export const createSection = async (req: Request, res: Response) => {
    const { boardId } = req.params;
    const sectionData = req.body;
    const newSection = await sectionService.createNewSection({ ...sectionData, board: boardId });
    res.status(201).json(newSection);
};

/**
 * Get a section by its ID.
 * @route GET /boards/:boardId/sections/:sectionId
 * @param {Request} req - Express request object containing sectionId.
 * @param {Response} res - Express response object.
 */
export const getSectionById = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const section = await sectionService.getSection(sectionId);
    res.status(200).json(section);
};

/**
 * Update a section by its ID.
 * @route PUT /boards/:boardId/sections/:sectionId
 * @param {Request} req - Express request object containing sectionId and update data.
 * @param {Response} res - Express response object.
 */
export const updateSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    const updatedSection = await sectionService.updateSection(sectionId, req.body);
    res.status(200).json(updatedSection);
};

/**
 * Delete a section by its ID.
 * @route DELETE /boards/:boardId/sections/:sectionId
 * @param {Request} req - Express request object containing sectionId.
 * @param {Response} res - Express response object.
 */
export const deleteSection = async (req: Request, res: Response) => {
    const { sectionId } = req.params;
    await sectionService.deleteSection(sectionId);
    res.status(204).send();
};
