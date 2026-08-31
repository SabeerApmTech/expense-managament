import { z } from 'zod';

export const officeSchema = z.object({
  officeName: z.string().min(1, 'Office name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  isActive: z.boolean(),
});

export type OfficeFormValues = z.infer<typeof officeSchema>;
