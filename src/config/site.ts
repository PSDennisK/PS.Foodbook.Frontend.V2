export const siteConfig = {
  name: 'PS Foodbook',
  description: 'Product catalogus voor PS in Foodservice',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locales: ['nl', 'en', 'de', 'fr'] as const,
  defaultLocale: 'nl' as const,
};

export type Locale = (typeof siteConfig.locales)[number];
