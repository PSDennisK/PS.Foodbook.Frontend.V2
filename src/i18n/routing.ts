import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['nl', 'en', 'de', 'fr'],
  defaultLocale: 'nl',
  localePrefix: 'as-needed', // nl heeft geen prefix
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
