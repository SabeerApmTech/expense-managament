import { z } from 'zod';

export const approvalSchema = z.object({
  remarks: z.string().min(1, 'Remarks are required'),
});

export type ApprovalFormValues = z.infer<typeof approvalSchema>;
