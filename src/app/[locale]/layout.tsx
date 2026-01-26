import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <QueryProvider>
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
