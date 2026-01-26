import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('common');

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{t('search')}</h1>
      <p className="mt-4">Product search coming soon...</p>
    </main>
  );
}
