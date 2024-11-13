import React from 'react';
import { Outlet } from 'react-router-dom';

import { Box } from '@mui/material';
import SideBar from '../components/SideBar';
import Notifications from '../components/Notifications';

const AppLayout: React.FC = () => {
	return (
		<>
			<Notifications vertical="top" horizontal="center" />
			<Box
				sx={{
					display: 'flex',
					height: '100vh',
				}}
			>
				<SideBar />
				<Box
					sx={{
						flexGrow: 1,
						p: 2,
					}}
				>
					<Outlet />
				</Box>
			</Box>
		</>
	);
};

export default AppLayout;
