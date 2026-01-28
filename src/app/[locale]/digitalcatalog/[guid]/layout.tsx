import type { ReactNode } from 'react';

import { CatalogHeader } from '@/components/catalog/catalog-header';
import { catalogService } from '@/lib/api/catalog.service';
import type { CatalogTheme } from '@/types/catalog';

interface CatalogLayoutProps {
  children: ReactNode;
  params: Promise<{ guid: string; locale: string }>;
}

export default async function CatalogLayout({ children, params }: CatalogLayoutProps) {
  const { guid } = await params;
  const theme = await catalogService.getTheme(guid);

  // Verrijk theme met base64 logo/banner indien alleen bestandsnamen zijn aangeleverd
  let enrichedTheme: CatalogTheme | null = theme;
  if (theme) {
    const [logoBase64, bannerBase64] = await Promise.all([
      theme.image ? catalogService.getLogo(theme.image) : Promise.resolve(null),
      theme.bannerImage ? catalogService.getBanner(theme.bannerImage) : Promise.resolve(null),
    ]);

    enrichedTheme = {
      ...theme,
      image: logoBase64 ?? theme.image,
      bannerImage: bannerBase64 ?? theme.bannerImage,
    };
  }

  return (
    <div
      className="min-h-screen catalog-layout"
      style={
        {
          '--theme-bg': theme?.backgroundColor || '#ffffff',
          '--theme-text': theme?.textColor || '#000000',
          '--theme-primary': theme?.primaryColor || '#0066cc',
          '--theme-secondary': theme?.secondaryColor || '#6c757d',
        } as React.CSSProperties
      }
    >
      {enrichedTheme && <CatalogHeader theme={enrichedTheme} />}
      <main>{children}</main>
    </div>
  );
}
