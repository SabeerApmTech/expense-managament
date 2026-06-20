import { z } from 'zod';

export const expenseSchema = z.object({
  expenseTypeId: z.string().min(1, 'Expense type is required'),
  description: z.string().max(500),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payModeId: z.string().min(1, 'Pay mode is required'),
  travelModeId: z.string().min(1, 'Travel mode is required'),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string().min(1, 'To location is required'),
  initiatedBy: z.string().min(1, 'Initiated by is required'),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
