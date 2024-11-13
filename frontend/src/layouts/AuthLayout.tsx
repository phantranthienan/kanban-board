import React from 'react';
import { Outlet } from 'react-router-dom';

import { Container, Box, Typography } from '@mui/material';
import Notifications from '../components/Notifications';

const AuthLayout: React.FC = () => {
	return (
		<Container
			maxWidth="sm"
			sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				minHeight: '100vh',
			}}
		>
			<Notifications vertical="top" horizontal="center" />
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					p: 8,
				}}
			>
				<Typography
					align="center"
					variant="h4"
					gutterBottom
					sx={{
						fontWeight: 'bold',
						letterSpacing: 2,
					}}
				>
					KANBAN BOARD
				</Typography>
				<Outlet />
			</Box>
		</Container>
	);
};

export default AuthLayout;
