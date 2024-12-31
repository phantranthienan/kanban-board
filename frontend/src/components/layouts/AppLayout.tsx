import React from 'react';
import { Outlet } from 'react-router-dom';

import { Box } from '@mui/material';
import SideBar from '../SideBar/SideBar';
import Notifications from '../common/Notifications';

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
						px: 2,
						py: 1,
						height: '100%',
					}}
				>
					<Outlet />
				</Box>
			</Box>
		</>
	);
};

export default AppLayout;
