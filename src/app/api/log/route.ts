import { type NextRequest, NextResponse } from 'next/server';

import { ValidationError, logEntrySchema, validateRequestBody } from '@/lib/api/validation';
import { RATE_LIMITS, checkRateLimit, getClientIdentifier } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent abuse
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, {
      id: 'api-log',
      ...RATE_LIMITS.LOGGING,
    });

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': rateLimitResult.limit.toString(),
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
    };

    // Check if rate limit exceeded
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Parse and validate request body
    const rawBody = await request.json();
    const validatedLog = validateRequestBody(logEntrySchema, rawBody);

    // In production: send to logging service (Sentry, DataDog, etc.)
    // For now, log to console with validated structure
    console.log(
      JSON.stringify({
        ...validatedLog,
        timestamp: validatedLog.timestamp ?? new Date().toISOString(),
      })
    );

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
