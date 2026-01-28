'use client';
import Image from 'next/image';

import type { CatalogTheme } from '@/types/catalog';

interface CatalogHeaderProps {
  theme: CatalogTheme;
}

export function CatalogHeader({ theme }: CatalogHeaderProps) {
  const hasLogo = theme.image;
  const hasBanner = theme.bannerImage;
  const hasTitle = theme.title;

  return (
    <header
      className="border-b"
      style={{
        backgroundColor: theme.backgroundColor || '#ffffff',
        color: theme.textColor || '#000000',
      }}
    >
      {/* Top bar with logo and title */}
      <div className="container mx-auto py-4 px-4">
        <div className="flex items-center justify-between">
          {hasLogo && (
            <div className="relative h-12 w-auto">
              <Image
                src={`data:image/png;base64,${theme.image}`}
                alt={theme.title || 'Catalog logo'}
                width={150}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          )}
          {hasTitle && (
            <h1 className="text-2xl font-bold" style={{ color: theme.textColor || '#000000' }}>
              {theme.title}
            </h1>
          )}
        </div>
      </div>

      {/* Banner image */}
      {hasBanner && (
        <div className="w-full h-48 relative">
          <Image
            src={`data:image/png;base64,${theme.bannerImage}`}
            alt="Catalog banner"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
    </header>
  );
}
