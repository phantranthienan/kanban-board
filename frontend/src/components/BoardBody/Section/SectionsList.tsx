import React, { useMemo } from 'react';
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
	const sectionIds = useMemo(
		() => sections.map((section) => section.id),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[JSON.stringify(sections.map((s) => s.id))],
	);
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
