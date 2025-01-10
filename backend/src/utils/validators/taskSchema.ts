import { z } from 'zod';

export const taskSchema = z.object({
    title: z
        .string().min(1, { message: 'Title is required' }),
    description: z
        .string().max(500, { message: 'Description must be less than 500 characters' }),
    deadline: z
        .date()
        .refine((date) => date > new Date(), {
            message: 'Deadline must be in the future',
        }), 
    subtasks: z.array(z.string()).optional(),
});
