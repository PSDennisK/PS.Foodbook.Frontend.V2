import { NextResponse } from 'next/server';

import { productService } from '@/lib/api/product.service';
import type { SearchParams } from '@/types/filter';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchParams;

    const results = await productService.search(body);

    if (!results) {
      return NextResponse.json({ error: 'Search failed' }, { status: 502 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
