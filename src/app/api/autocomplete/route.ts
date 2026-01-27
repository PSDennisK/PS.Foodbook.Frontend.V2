import { NextResponse } from 'next/server';

import { productService } from '@/lib/api/product.service';
import type { Culture } from '@/types/enums';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const keyword = searchParams.get('q') ?? '';
  const localeParam = searchParams.get('locale') ?? 'nl';
  const securityToken = searchParams.get('securityToken') ?? undefined;
  const locale = localeParam as Culture;

  if (!keyword) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await productService.autocomplete(keyword, locale, securityToken);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
