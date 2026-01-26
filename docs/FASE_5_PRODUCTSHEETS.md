# FASE 5: PRODUCTSHEETS & PDF - Claude Code Prompt

**Fase:** 5 - Productsheets & PDF  
**Duur:** 2 weken  
**Doel:** Productsheet systeem met PDF generatie  

## DOEL
Implementeer productsheets met signed permalink access en PDF generatie.

## REQUIREMENTS

### 1. PRODUCTSHEET PAGE

**src/app/[locale]/productsheet/[id]/page.tsx:**
```typescript
import { notFound } from 'next/navigation';
import { sheetService } from '@/lib/api/sheet.service';
import { ProductSheet } from '@/components/sheet/product-sheet';
import { verifyPermalinkSignature } from '@/lib/auth/permalink';

export default async function ProductSheetPage({ params, searchParams }: Props) {
  // Check permalink access
  if (searchParams.pspid && searchParams.psexp && searchParams.pssig) {
    const isValid = await verifyPermalinkSignature({
      productId: searchParams.pspid,
      expires: searchParams.psexp,
      signature: searchParams.pssig,
    });

    if (!isValid) {
      notFound();
    }
  }

  const product = await sheetService.getById(params.id);
  
  if (!product) notFound();

  return <ProductSheet product={product} locale={params.locale} />;
}
```

### 2. PRODUCTSHEET COMPONENT

**src/components/sheet/product-sheet.tsx:**
```typescript
import { ProductInfo } from '@/components/product/product-info';
import { ProductAllergens } from '@/components/product/product-allergens';
import { ProductNutrients } from '@/components/product/product-nutrients';
import { ShareButton } from './share-button';
import { DownloadPdfButton } from './download-pdf-button';

export function ProductSheet({ product, locale }: Props) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Productsheet</h1>
        <div className="flex gap-2">
          <ShareButton productId={product.product.summary.id} />
          <DownloadPdfButton productId={product.product.summary.id} locale={locale} />
        </div>
      </div>

      <div className="space-y-8">
        <ProductInfo product={product} locale={locale} />
        <ProductAllergens product={product} locale={locale} />
        <ProductNutrients product={product} locale={locale} />
      </div>
    </div>
  );
}
```

### 3. SHARE BUTTON (with permalink generation)

**src/components/sheet/share-button.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { generatePermalinkSignature } from '@/lib/auth/permalink';
import { Share2 } from 'lucide-react';

export function ShareButton({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const generateShareLink = async () => {
    const params = await generatePermalinkSignature(productId, 86400); // 24 hours
    const url = new URL(`/productsheet/${productId}`, window.location.origin);
    url.searchParams.set('pspid', params.productId);
    url.searchParams.set('psexp', params.expires);
    url.searchParams.set('pssig', params.signature);

    setShareUrl(url.toString());
    setOpen(true);
  };

  return (
    <>
      <Button onClick={generateShareLink}>
        <Share2 className="w-4 h-4 mr-2" />
        Delen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <h2 className="text-xl font-bold mb-4">Deel productsheet</h2>
          <input 
            value={shareUrl} 
            readOnly 
            className="w-full p-2 border rounded"
            onClick={(e) => e.currentTarget.select()}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Deze link is 24 uur geldig
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 4. PDF GENERATION

**src/app/[locale]/productsheet/[id]/pdf/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sheetService } from '@/lib/api/sheet.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; locale: string } }
) {
  try {
    const pdfBlob = await sheetService.generatePdf(params.id, params.locale as Culture);

    if (!pdfBlob) {
      return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
    }

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="productsheet-${params.id}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
```

**src/components/sheet/download-pdf-button.tsx:**
```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function DownloadPdfButton({ productId, locale }: Props) {
  const handleDownload = () => {
    window.open(`/productsheet/${productId}/pdf`, '_blank');
  };

  return (
    <Button onClick={handleDownload} variant="outline">
      <Download className="w-4 h-4 mr-2" />
      PDF
    </Button>
  );
}
```

### 5. PERMALINK MIDDLEWARE (update middleware.ts)

```typescript
// Add to middleware.ts before auth check:

const searchParams = request.nextUrl.searchParams;
const pspid = searchParams.get('pspid');
const psexp = searchParams.get('psexp');
const pssig = searchParams.get('pssig');

if (pspid && psexp && pssig && pathname.includes('/productsheet/')) {
  const isValid = await verifyPermalinkSignature({
    productId: pspid,
    expires: psexp,
    signature: pssig,
  });

  if (isValid) {
    const response = NextResponse.next();
    response.cookies.set('permalink_access', 'true', {
      httpOnly: true,
      secure: true,
      maxAge: 600, // 10 minutes
      sameSite: 'lax',
    });
    return response;
  }
}
```

## OUTPUT
- ✅ Productsheet pagina's
- ✅ Signed permalink system
- ✅ Share functionaliteit
- ✅ PDF generatie en download
- ✅ Permalink expiry handling

## VERIFICATION
```bash
# Test:
1. /productsheet/123 - sheet loads
2. Click "Delen" - permalink generates
3. Open permalink in incognito - access works
4. Wait 24h - permalink expires
5. Click "PDF" - downloads PDF
6. Check PDF content - correct data
```

**Volgende stap:** Fase 6 - UI/UX Polish
