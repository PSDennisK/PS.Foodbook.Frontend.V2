import { z } from 'zod';
import { LocalizedStringSchema } from './product';

export const BrandSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  logo: z.string().optional(),
  description: LocalizedStringSchema.optional(),
  website: z.string().optional(),
  contactinfo: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

export type Brand = z.infer<typeof BrandSchema>;
