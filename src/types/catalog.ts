import { z } from 'zod';

export const CatalogThemeSchema = z.object({
  guid: z.string(),
  title: z.string().optional(),
  image: z.string().optional(),
  bannerImage: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export type CatalogTheme = z.infer<typeof CatalogThemeSchema>;
