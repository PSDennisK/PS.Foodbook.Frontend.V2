import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/types';

import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'PS Foodbook',
  description: 'Product catalogus voor PS in Foodservice',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  // Load messages for the locale
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <QueryProvider>
          <AuthProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
            </NextIntlClientProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
