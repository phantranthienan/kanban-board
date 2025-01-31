import { TSection } from '../common/section';

// Request types

export type GetSectionsRequest = { boardId: string };
export type CreateSectionRequest = { boardId: string };
export type UpdateSectionRequest = Partial<TSection>;
export type DeleteSectionRequest = { boardId: string; sectionId: string };

// Response types
export type GetSectionsResponse = TSection[];
export type CreateSectionResponse = TSection;
export type UpdateSectionResponse = TSection;
export type DeleteSectionResponse = void;
