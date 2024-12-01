import React from 'react';
import { Stack, InputBase, IconButton } from '@mui/material';
import EmojiPicker from './EmojiPicker';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

type BoardHeaderProps = {
	title: string;
	icon: string;
	onEmojiSelect: (emoji: string) => void;
	onTitleChange: (newTitle: string) => void;
	onDelete: () => void;
};

const BoardHeader: React.FC<BoardHeaderProps> = ({
	title,
	icon,
	onEmojiSelect,
	onTitleChange,
	onDelete,
}) => {
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onTitleChange(event.target.value);
	};

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between">
			<Stack direction="row" justifyContent="center">
				<EmojiPicker initialEmoji={icon} onEmojiSelect={onEmojiSelect} />
				<InputBase
					value={title}
					onChange={handleInputChange}
					placeholder="Enter title"
					sx={{
						fontWeight: 'bold',
						fontSize: '2rem',
						maxWidth: '20rem',
						'& input': {
							padding: '0.5rem',
						},
					}}
				/>
			</Stack>
			<IconButton onClick={onDelete}>
				<DeleteOutlineIcon fontSize="large" color="error" />
			</IconButton>
		</Stack>
	);
};

export default BoardHeader;
