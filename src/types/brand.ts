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

// Raw BrandInfo response from /v2/Brand/BrandInfo/{brandId}
export const BrandInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  website: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  producerId: z.number().optional(),
  producerName: z.string().optional(),
  image: z.string().optional(),
});

export type BrandInfo = z.infer<typeof BrandInfoSchema>;
