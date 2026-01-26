# FASE 4: DIGITALE CATALOGI - Claude Code Prompt

**Fase:** 4 - Digitale Catalogi  
**Duur:** 2 weken  
**Doel:** Digital catalog systeem met custom theming  

## DOEL
Implementeer beveiligde digitale catalogi met GUID-based routing en custom theming per catalogus.

## REQUIREMENTS

### 1. CATALOG ROUTES

**src/app/[locale]/digitalcatalog/[guid]/layout.tsx:**
```typescript
import { notFound } from 'next/navigation';
import { catalogService } from '@/lib/api/catalog.service';
import { CatalogHeader } from '@/components/catalog/catalog-header';

export default async function CatalogLayout({ children, params }: Props) {
  const theme = await catalogService.getTheme(params.guid);
  
  if (!theme) notFound();

  return (
    <div style={{
      '--theme-bg': theme.backgroundColor || '#ffffff',
      '--theme-text': theme.textColor || '#000000',
      '--theme-primary': theme.primaryColor || '#0066cc',
    } as React.CSSProperties}>
      <CatalogHeader theme={theme} />
      {children}
    </div>
  );
}
```

**src/app/[locale]/digitalcatalog/[guid]/page.tsx:**
```typescript
export default async function CatalogPage({ params }: Props) {
  const products = await productService.search({
    securityToken: params.guid,
  });

  return (
    <div className="container mx-auto py-8">
      <h1>Catalogus Producten</h1>
      <ProductGrid products={products?.products || []} />
    </div>
  );
}
```

### 2. CATALOG HEADER

**src/components/catalog/catalog-header.tsx:**
```typescript
'use client';

import Image from 'next/image';
import { catalogService } from '@/lib/api/catalog.service';

export function CatalogHeader({ theme }: { theme: CatalogTheme }) {
  return (
    <header className="border-b" style={{ 
      backgroundColor: `var(--theme-bg)`,
      color: `var(--theme-text)`,
    }}>
      <div className="container mx-auto py-4 flex items-center justify-between">
        {theme.image && (
          <Image 
            src={`data:image/png;base64,${theme.image}`} 
            alt={theme.title || 'Logo'} 
            width={150} 
            height={50}
          />
        )}
        <h1 className="text-2xl font-bold">{theme.title}</h1>
      </div>
      {theme.bannerImage && (
        <div className="w-full h-48 relative">
          <Image 
            src={`data:image/png;base64,${theme.bannerImage}`}
            alt="Banner"
            fill
            className="object-cover"
          />
        </div>
      )}
    </header>
  );
}
```

### 3. CATALOG PRODUCT PAGES

**src/app/[locale]/digitalcatalog/[guid]/product/[id]/page.tsx:**
```typescript
export default async function CatalogProductPage({ params }: Props) {
  const product = await productService.getById(params.id, params.guid);
  
  if (!product) notFound();

  return <ProductDetail product={product} locale={params.locale} inCatalog />;
}
```

### 4. GUID MIDDLEWARE (update middleware.ts)

```typescript
// Add to middleware.ts:

// Convert old token-based URLs to GUID URLs
const catalogMatch = pathname.match(/\/digitalcatalog\/(\d+)\/([^/]+)/);
if (catalogMatch) {
  const [, token, abbr] = catalogMatch;
  const guid = await catalogService.getGuid(token, abbr);
  
  if (guid) {
    return NextResponse.redirect(
      new URL(pathname.replace(token, guid), request.url),
      308
    );
  }
}
```

## OUTPUT
- ✅ GUID-based catalog routing
- ✅ Custom theming per catalog
- ✅ Catalog product browsing
- ✅ Security token propagation
- ✅ URL migration support

## VERIFICATION
```bash
# Test:
1. /digitalcatalog/{guid} - catalog loads
2. Custom theme applies (colors, logo, banner)
3. /digitalcatalog/{guid}/product/123 - product loads
4. Old URL format redirects to GUID format
```

**Volgende stap:** Fase 5 - Productsheets & PDF
