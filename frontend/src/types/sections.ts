import { TTask } from './tasks';

export interface TSection {
	id: string;
	title: string;
	position: number;
	board: string;
	tasks: TTask[];
}

export type TSections = TSection[];
