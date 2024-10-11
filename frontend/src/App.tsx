import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@emotion/react';

import { AppLayout, AuthLayout } from './layout';
import { Home, Login, Register, Board } from './pages';
import { darkTheme } from './themes';



const App = () => {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline enableColorScheme />
			<Router>
				<Routes>
					<Route path='/' element={<AuthLayout />}>
						<Route path='login' element={<Login />} />
						<Route path='register' element={<Register />} />
					</Route>
					<Route path='/' element={<AppLayout />}>
						<Route index element={<Home />} />
						<Route path='boards' element={<Home />} />
						<Route path='boards/:boardId' element={<Board />} />
					</Route>
				</Routes>
			</Router>
		</ThemeProvider>
	);
};

export default App;
