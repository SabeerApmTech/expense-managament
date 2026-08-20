import { z } from 'zod';

export const userSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required'),
  empName: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  role: z.enum(['USER', 'ADMIN', 'SUPERADMIN']),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  isActive: z.boolean(),
  isInitiator: z.boolean(),
  isAccountant: z.boolean(),
});

export type UserFormValues = z.infer<typeof userSchema>;
