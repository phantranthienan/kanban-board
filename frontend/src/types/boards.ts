export interface TBoard {
	id: string;
	title: string;
	icon: string;
	description: string;
	favorite: boolean;
	position: number;
	user: string;
	sections: string[];
}

export type TBoards = TBoard[];
