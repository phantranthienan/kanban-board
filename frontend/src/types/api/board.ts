import { TBoard } from '../common/board';

export type GetBoardDetailsRequest = { id: string };
export type GetBoardsRequest = void;
export type CreateBoardRequest = Partial<TBoard>;
export type UpdateBoardRequest = Partial<TBoard>;
export type DeleteBoardRequest = { id: string };
export type ReorderBoardsRequest = { id: string; position: number }[];

export type GetBoardDetailsResponse = TBoard;
export type GetBoardsResponse = TBoard[];
export type CreateBoardResponse = TBoard;
export type UpdateBoardResponse = TBoard;
export type DeleteBoardResponse = void;
export type ReorderBoardsResponse = void;
