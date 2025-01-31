import React from 'react';
import {
	horizontalListSortingStrategy,
	SortableContext,
} from '@dnd-kit/sortable';
import SectionColumn from './SectionColumn';

import { TSection } from '../../../types/common/section';

type SectionsListProps = {
	sections: TSection[];
};

const SectionsList: React.FC<SectionsListProps> = ({ sections }) => {
	const sectionIds = sections.map((section) => section.id);
	return (
		<SortableContext
			items={sectionIds}
			strategy={horizontalListSortingStrategy}
		>
			{sections.map((section) => {
				return <SectionColumn key={section.id} section={section} />;
			})}
		</SortableContext>
	);
};

export default SectionsList;
