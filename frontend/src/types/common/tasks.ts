export type TTask = {
	id: string;
	title: string;
	description: string;
	deadline: Date;
	subtasks: string[];
	position: number;
	section: string;
	board: string;
};
