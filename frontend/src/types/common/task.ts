export type TTask = {
	id: string;
	title: string;
	description: string;
	deadline: Date;
	subtasks: string[];
	section: string;
	board: string;
	isPlaceHolder: boolean;
};
