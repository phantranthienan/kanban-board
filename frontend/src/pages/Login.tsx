import React, { useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { showNotification } from '../redux/slices/notificationSlice';
import { useAppDispatch } from '../hooks/storeHooks';
import { useErrorHandler } from '../hooks/useErrorHandler';

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, LoginInput } from '../utils/zodSchemas';

import { Stack, TextField, Typography, Link } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import useAuth from '../hooks/useAuth';

const Login: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleError = useErrorHandler();

	const { login, isAuthenticated, user } = useAuth();

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

	const onSubmit: SubmitHandler<LoginInput> = async (data) => {
		try {
			await login(data);
			dispatch(
				showNotification({ message: 'Login successful', type: 'success' }),
			);
		} catch (error: unknown) {
			handleError(error);
		}
	};

	useEffect(() => {
		if (isAuthenticated && user) {
			navigate('/', { replace: true });
		}
	}, [isAuthenticated, user, navigate]);

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
				fullWidth
				{...register('username')}
				error={!!errors.username}
				helperText={errors.username?.message}
			/>
			<TextField
				variant="standard"
				label="Password"
				type="password"
				fullWidth
				{...register('password')}
				error={!!errors.password}
				helperText={errors.password?.message}
			/>
			<LoadingButton
				type="submit"
				variant="contained"
				sx={{ width: '50%' }}
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
		</Stack>
	);
};

export default Login;
