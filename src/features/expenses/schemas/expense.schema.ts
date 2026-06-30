import { z } from 'zod';

export const expenseItemSchema = z.object({
  initiatedBy: z.string().min(1, 'Initiated by is required'),
  expenseTypeId: z.string().min(1, 'Expense type is required'),
  description: z.string().max(500),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payModeId: z.string().min(1, 'Pay mode is required'),
  travelModeId: z.string(),
  areaFrom: z.string(),
  areaTo: z.string(),
  billFiles: z.array(z.any()),
}).refine(
  (data) => !data.fromDate || !data.toDate || data.toDate >= data.fromDate,
  { message: 'To date must be on or after from date', path: ['toDate'] },
);

export const expenseSchema = z.object({
  items: z.array(expenseItemSchema).min(1, 'At least one expense item is required'),
});

export type ExpenseItemFormValues = z.infer<typeof expenseItemSchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
