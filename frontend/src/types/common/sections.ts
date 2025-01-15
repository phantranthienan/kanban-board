import { TTask } from './tasks';

export type TSection = {
	id: string;
	title: string;
	position: number;
	board: string;
	tasks: TTask[];
};
