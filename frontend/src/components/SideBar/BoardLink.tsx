import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';

import { Box, ListItemButton, ListItemText, IconButton } from '@mui/material';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';

type BoardLinkProps = {
	icon: string;
	title: string;
	favorite: boolean;
	onFavoriteClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	id: string;
};

const BoardLink: React.FC<BoardLinkProps> = ({
	id,
	icon,
	title,
	favorite,
	onFavoriteClick,
}) => {
	const navigate = useNavigate();
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transform: transform ? `translateY(${transform.y}px)` : undefined,
		cursor: 'grab',
		transition,
	};

	return (
		<ListItemButton
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={() => navigate(`/boards/${id}`)}
		>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%',
				}}
			>
				<ListItemText>
					{icon} {title}
				</ListItemText>
				<IconButton onClick={(e) => onFavoriteClick(e)}>
					{favorite ? <StarIcon color="warning" /> : <StarOutlineIcon />}
				</IconButton>
			</Box>
		</ListItemButton>
	);
};

export default BoardLink;
