import { NextResponse } from 'next/server';

import { productService } from '@/lib/api/product.service';
import { ValidationError, autocompleteParamsSchema } from '@/lib/api/validation';
import { RATE_LIMITS, checkRateLimit, getClientIdentifier } from '@/lib/utils/rate-limit';
import { Culture } from '@/types/enums';

export async function GET(request: Request) {
  try {
    // Apply rate limiting (relaxed for autocomplete as it's frequent)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, {
      id: 'api-autocomplete',
      ...RATE_LIMITS.RELAXED,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { suggestions: [], error: 'Rate limit exceeded' },
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

    const { searchParams } = new URL(request.url);

    // Extract security token from Authorization header instead of URL
    const authHeader = request.headers.get('Authorization');
    const securityToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    // Normaliseer locale: accepteer zowel 'nl' als 'nl-NL' (idem voor en/de/fr)
    const rawLocale = searchParams.get('locale') ?? 'nl';
    const locale: Culture =
      rawLocale === 'nl'
        ? Culture.NL
        : rawLocale === 'en'
          ? Culture.EN
          : rawLocale === 'de'
            ? Culture.DE
            : rawLocale === 'fr'
              ? Culture.FR
              : (rawLocale as Culture);

    // Build params object for validation
    const params = {
      q: searchParams.get('q') ?? '',
      locale,
      securityToken,
    };

    // Validate query parameters
    const validatedParams = autocompleteParamsSchema.parse(params);

    // Return empty suggestions if no keyword provided
    if (!validatedParams.q) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await productService.autocomplete(
      validatedParams.q,
      validatedParams.locale,
      validatedParams.securityToken
    );
    return NextResponse.json({ suggestions });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Autocomplete API error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
