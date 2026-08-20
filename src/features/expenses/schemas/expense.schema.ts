import { z } from 'zod';

export const expenseDetailSchema = z
  .object({
    initiatedByEmpId: z.string().min(1, 'Initiator is required'),
    expenseTypeId: z.string().min(1, 'Expense type is required'),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    fromDate: z.string().min(1, 'From date is required'),
    toDate: z.string().min(1, 'To date is required'),
    paymentMode: z.string().min(1, 'Payment mode is required'),
    travelMode: z.string(),
    fromLocation: z.string(),
    toLocation: z.string(),
    description: z.string().max(500),
    bills: z.array(z.any()),
  })
  .refine((data) => !data.fromDate || !data.toDate || data.toDate >= data.fromDate, {
    message: 'To date must be on or after from date',
    path: ['toDate'],
  });

export type ExpenseDetailFormValues = z.infer<typeof expenseDetailSchema>;
