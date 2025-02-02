export type TBoard = {
	id: string;
	title: string;
	icon: string;
	description: string;
	favorite: boolean;
	position: number;
	user: string;
	sectionsOrder: string[];
	sections: string[];
};
