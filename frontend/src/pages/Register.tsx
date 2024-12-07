import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { showNotification } from '../redux/slices/notificationSlice';
import { useAppDispatch } from '../hooks/storeHooks';
import { useErrorHandler } from '../hooks/useErrorHandler';

import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { registerSchema, RegisterInput } from '../utils/zodSchemas';

import { Stack, TextField, Button, Typography, Link } from '@mui/material';

import { useRegisterMutation } from '../redux/slices/api/authApiSlice';

const Register: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleError = useErrorHandler();

	// Access the register mutation from RTK Query
	const [registerUser, { isLoading }] = useRegisterMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterInput>({
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		resolver: zodResolver(registerSchema),
	});

	const onSubmit: SubmitHandler<RegisterInput> = async (data) => {
		try {
			await registerUser(data).unwrap();
			dispatch(
				showNotification({
					message: 'Registration successful, please login',
					type: 'success',
				}),
			);
			navigate('/login');
		} catch (error: unknown) {
			handleError(error);
		}
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
				fullWidth
				{...register('username')}
				error={!!errors.username}
				helperText={errors.username?.message}
			/>
			<TextField
				variant="standard"
				label="Email"
				fullWidth
				{...register('email')}
				error={!!errors.email}
				helperText={errors.email?.message}
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
			<TextField
				variant="standard"
				label="Confirm Password"
				type="password"
				fullWidth
				{...register('confirmPassword')}
				error={!!errors.confirmPassword}
				helperText={errors.confirmPassword?.message}
			/>
			<Button
				type="submit"
				variant="contained"
				sx={{ width: '50%' }}
				disabled={isSubmitting || isLoading} // Disable button during submit or loading
			>
				<Typography variant="h6">Register</Typography>
			</Button>
			<Typography>
				{'Already have an account? '}
				<Link component={RouterLink} to="/login" underline="hover">
					Login
				</Link>
			</Typography>
		</Stack>
	);
};

export default Register;
