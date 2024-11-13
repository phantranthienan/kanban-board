import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().min(1, { message: 'Username is required' }),
	password: z.string().min(1, { message: 'Password is required' }),
});

export const registerSchema = z
	.object({
		username: z
			.string()
			.min(1, { message: 'Username is required' })
			.max(50, { message: 'Username must be less than 50 characters' }),
		email: z.string().email({ message: 'Please enter a valid email address' }),
		password: z
			.string()
			.min(8, { message: 'Password must be at least 8 characters long' })
			.refine((value) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,}$/.test(value), {
				message: 'Password must contain at least one letter and one number',
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
