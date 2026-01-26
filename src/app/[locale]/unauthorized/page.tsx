import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function UnauthorizedPage() {
  const t = useTranslations('common');

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Geen toegang</h1>
      <p className="mt-4 text-muted-foreground">
        Je hebt geen toegang tot deze pagina. Log in om verder te gaan.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Terug naar home</Link>
      </Button>
    </div>
  );
}
