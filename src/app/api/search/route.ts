import { NextResponse } from 'next/server';

import { productService } from '@/lib/api/product.service';
import { ValidationError, searchParamsSchema, validateRequestBody } from '@/lib/api/validation';
import { RATE_LIMITS, checkRateLimit, getClientIdentifier } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, {
      id: 'api-search',
      ...RATE_LIMITS.NORMAL,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          },
        }
      );
    }

    // Extract security token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const securityToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    // Parse and validate request body
    const rawBody = await request.json();
    const validatedBody = validateRequestBody(searchParamsSchema, rawBody);

    // Merge token from header with validated body
    const searchParams = {
      ...validatedBody,
      securityToken,
    };

    const results = await productService.search(searchParams);

    if (!results) {
      return NextResponse.json({ error: 'Search failed' }, { status: 502 });
    }

    return NextResponse.json(results);
  } catch (error) {
    // Handle validation errors with specific status code
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
