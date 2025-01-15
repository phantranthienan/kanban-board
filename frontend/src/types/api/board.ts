import { TBoard } from '../common/boards';

export type GetBoardRequest = { id: string };
export type GetBoardsRequest = void;
export type CreateBoardRequest = Partial<TBoard>;
export type UpdateBoardRequest = Partial<TBoard>;
export type DeleteBoardRequest = { id: string };
export type UpdateBoardsPositionsRequest = { id: string; position: number }[];

export type GetBoardResponse = TBoard;
export type GetBoardsResponse = TBoard[];
export type CreateBoardResponse = TBoard;
export type UpdateBoardResponse = TBoard;
export type DeleteBoardResponse = void;
export type UpdateBoardsPositionsResponse = void;
