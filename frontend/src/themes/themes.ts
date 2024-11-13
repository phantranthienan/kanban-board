import { createTheme } from '@mui/material/styles';

export const ligthTheme = createTheme({
	typography: {
		fontFamily: 'Poppins',
	},
	palette: {
		mode: 'light',
	},
});

export const darkTheme = createTheme({
	typography: {
		fontFamily: 'Poppins',
	},
	palette: {
		mode: 'dark',
	},
});
