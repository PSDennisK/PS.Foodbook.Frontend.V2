import { ProductSheet } from '@/components/sheet/product-sheet';
import { sheetService } from '@/lib/api/sheet.service';
import { verifyPermalinkSignature } from '@/lib/auth/permalink';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ pspid?: string; psexp?: string; pssig?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await sheetService.getById(id);

  if (!product) {
    return {
      title: 'Productsheet niet gevonden',
    };
  }

  const name = getTranslation(product.product.summary.name, locale as Culture);
  const brandName = product.product.summary.brandname;

  return {
    title: `Productsheet - ${name}`,
    description: `Productsheet voor ${name} van ${brandName}`,
  };
}

export default async function ProductSheetPage({ params, searchParams }: Props) {
  const { id, locale } = await params;
  const search = await searchParams;

  // Check permalink access if parameters are present
  if (search.pspid && search.psexp && search.pssig) {
    const isValid = await verifyPermalinkSignature({
      productId: search.pspid,
      expires: search.psexp,
      signature: search.pssig,
    });

    if (!isValid) {
      notFound();
    }
  }

  const product = await sheetService.getById(id);

  if (!product) {
    notFound();
  }

  return <ProductSheet product={product} locale={locale as Culture} />;
}
