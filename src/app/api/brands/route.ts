import { NextResponse } from 'next/server';

import { brandService } from '@/lib/api/brand.service';

export async function GET() {
  try {
    const brands = await brandService.getAllBrands();

    console.log('brands', brands);

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Brands API error:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}