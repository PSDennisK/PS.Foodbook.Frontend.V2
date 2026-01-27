import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getTranslation } from '@/lib/utils/translation';
import type { Brand } from '@/types/brand';
import type { Culture } from '@/types/enums';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

interface BrandHeaderProps {
  brand: Brand;
  locale: Culture;
}

export function BrandHeader({ brand, locale }: BrandHeaderProps) {
  const name = getTranslation(brand.name, locale);
  const description = getTranslation(brand.description, locale);

  return (
    <Card className="p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logo Section */}
        {brand.logo && (
          <div className="flex items-center justify-center lg:justify-start">
            <div className="relative w-48 h-48 border rounded-lg overflow-hidden bg-white">
              <Image
                src={brand.logo}
                alt={`${name} logo`}
                fill
                className="object-contain p-4"
                sizes="200px"
              />
            </div>
          </div>
        )}

        {/* Brand Info Section */}
        <div className={`${brand.logo ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{name}</h1>
            {description && <p className="text-muted-foreground text-lg">{description}</p>}
          </div>

          {/* Contact Information */}
          {(brand.website || brand.contactinfo?.email || brand.contactinfo?.phone) && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Contact
              </h3>

              <div className="flex flex-wrap gap-3">
                {brand.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Website bezoeken
                    </a>
                  </Button>
                )}

                {brand.contactinfo?.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`mailto:${brand.contactinfo.email}`}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      {brand.contactinfo.email}
                    </a>
                  </Button>
                )}

                {brand.contactinfo?.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${brand.contactinfo.phone}`} className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {brand.contactinfo.phone}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
