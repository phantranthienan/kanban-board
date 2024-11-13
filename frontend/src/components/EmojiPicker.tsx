import React, { useState, useEffect, useRef } from 'react';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import { Box, Typography } from '@mui/material';

type EmojiPickerProps = {
	initialEmoji: string | undefined;
	onEmojiSelect: (emoji: string) => void;
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({
	initialEmoji,
	onEmojiSelect,
}) => {
	const [emoji, setEmoji] = useState(initialEmoji);
	const [showPicker, setShowPicker] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (initialEmoji) {
			setEmoji(initialEmoji);
		}
	}, [initialEmoji]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				setShowPicker(false);
			}
		}

		if (showPicker) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showPicker]);

	const toggleShowPicker = () => {
		setShowPicker(!showPicker);
	};

	const handleEmojiSelect = (selectedEmoji: { native: string }) => {
		const chosenEmoji = selectedEmoji.native;
		setEmoji(chosenEmoji);
		onEmojiSelect(chosenEmoji);
		setShowPicker(false);
	};

	return (
		<Box
			sx={{
				position: 'relative',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Typography
				variant="h4"
				onClick={toggleShowPicker}
				sx={{ cursor: 'pointer' }}
			>
				{emoji}
			</Typography>
			{showPicker && (
				<Box
					ref={pickerRef}
					sx={{ position: 'absolute', zIndex: 1, top: '100%', left: 0 }}
				>
					<Picker
						data={data}
						theme="dark"
						onEmojiSelect={handleEmojiSelect}
						showPreview={false}
					/>
				</Box>
			)}
		</Box>
	);
};

export default EmojiPicker;
