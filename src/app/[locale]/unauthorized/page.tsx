import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function UnauthorizedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t('unauthorized.title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('unauthorized.message')}</p>
      <Button asChild className="mt-6">
        <Link href="/">{t('unauthorized.backToHome')}</Link>
      </Button>
    </div>
  );
}
