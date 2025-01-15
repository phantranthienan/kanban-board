import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/700.css';

import { Routes, Route } from 'react-router-dom';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ProtectedRoute from './components/layouts/ProtectedRoute';
import AuthLayout from './components/layouts/AuthLayout';
import AppLayout from './components/layouts/AppLayout';
import { Home, Login, Register, Board } from './pages';
import { AuthProvider } from './contexts/AuthContext';

import { darkTheme } from './themes';

const App: React.FC = () => {
	return (
		<ThemeProvider theme={darkTheme}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<CssBaseline enableColorScheme />
				<AuthProvider>
					<Routes>
						<Route element={<ProtectedRoute />}>
							<Route path="/" element={<AppLayout />}>
								<Route index element={<Home />} />
								<Route path="boards" element={<Home />} />
								<Route path="boards/:boardId" element={<Board />} />
							</Route>
						</Route>
						<Route path="/" element={<AuthLayout />}>
							<Route path="login" element={<Login />} />
							<Route path="register" element={<Register />} />
						</Route>
					</Routes>
				</AuthProvider>
			</LocalizationProvider>
		</ThemeProvider>
	);
};

export default App;
