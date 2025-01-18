import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { showNotification } from '../redux/slices/notificationSlice';
import { useAppDispatch } from '../hooks/storeHooks';
import { useErrorHandler } from '../hooks/useErrorHandler';

import { login as loginUser, googleLogin } from '../services/api/authApi';

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, LoginInput } from '../utils/zodSchemas';

import {
	Stack,
	TextField,
	Typography,
	Link,
	Divider,
	Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GoogleIcon } from '../components/common/GoogleIcon';
import useAuth from '../hooks/useAuth';

const Login: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleError = useErrorHandler();
	const { authenticate } = useAuth();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginInput>({
		defaultValues: {
			username: '',
			password: '',
		},
		resolver: zodResolver(loginSchema),
	});

	const onSubmit: SubmitHandler<LoginInput> = async (loginData) => {
		try {
			const data = await loginUser(loginData);
			authenticate(data.user);
			dispatch(
				showNotification({ message: 'Login successful', type: 'success' }),
			);
			navigate('/boards', { replace: true });
		} catch (error: unknown) {
			handleError(error);
		}
	};

	const handleGoogleLogin = async () => {
		googleLogin();
	};

	return (
		<Stack
			component="form"
			onSubmit={handleSubmit(onSubmit)}
			direction="column"
			spacing={3}
			sx={{
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
			}}
		>
			<TextField
				variant="standard"
				label="Username"
				autoComplete="username"
				fullWidth
				{...register('username')}
				error={!!errors.username}
				helperText={errors.username?.message}
			/>
			<TextField
				variant="standard"
				label="Password"
				type="password"
				autoComplete="password"
				fullWidth
				{...register('password')}
				error={!!errors.password}
				helperText={errors.password?.message}
			/>
			<LoadingButton
				type="submit"
				variant="contained"
				fullWidth
				loading={isSubmitting}
			>
				<Typography variant="h6">Login</Typography>
			</LoadingButton>
			<Typography>
				{"Don't have an account yet? "}
				<Link component={RouterLink} to="/register" underline="hover">
					Register here
				</Link>
			</Typography>

			<Divider sx={{ width: '100%', borderColor: 'white' }}>OR</Divider>
			<Button
				fullWidth
				variant="outlined"
				onClick={handleGoogleLogin}
				startIcon={<GoogleIcon />}
			>
				<Typography variant="h6">Login with Google</Typography>
			</Button>
		</Stack>
	);
};

export default Login;
