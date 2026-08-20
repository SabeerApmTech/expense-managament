import { z } from 'zod';

export const loginSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
