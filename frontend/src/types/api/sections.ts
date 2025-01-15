import { TSection } from '../common/sections';

// Request types

export type GetSectionsRequest = { boardId: string };
export type GetSectionByIdRequest = { boardId: string; sectionId: string };
export type CreateSectionRequest = { boardId: string };
export type UpdateSectionRequest = Partial<TSection>;
export type DeleteSectionRequest = { boardId: string; sectionId: string };
export type ReorderSectionsRequest = {
	boardId: string;
	sections: { id: string; position: number }[];
};

// Response types
export type GetSectionsResponse = TSection[];
export type GetSectionByIdResponse = TSection;
export type CreateSectionResponse = TSection;
export type UpdateSectionResponse = TSection;
export type DeleteSectionResponse = void;
export type ReorderSectionsResponse = void;
