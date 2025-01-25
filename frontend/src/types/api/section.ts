import { TSection } from '../common/section';

// Request types

export type GetSectionsRequest = { boardId: string };
export type CreateSectionRequest = { boardId: string };
export type UpdateSectionRequest = Omit<Partial<TSection>, 'tasks'> & {
	tasks?: string[];
};
export type DeleteSectionRequest = { boardId: string; sectionId: string };

// Response types
export type GetSectionsResponse = TSection[];
export type CreateSectionResponse = TSection;
export type UpdateSectionResponse = TSection;
export type DeleteSectionResponse = void;
