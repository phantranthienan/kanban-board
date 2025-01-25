import { TTask } from './task';

export type TSection = {
	id: string;
	title: string;
	board: string;
	tasksOrder: string[];
	tasks: TTask[];
};
