import { type NextRequest, NextResponse } from 'next/server';

import { ValidationError, validateRequestBody, validateTokenSchema } from '@/lib/api/validation';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const rawBody = await request.json();
    const { token } = validateRequestBody(validateTokenSchema, rawBody);

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ isValid: false, error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      isValid: true,
      payload,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          isValid: false,
          error: error.message,
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ isValid: false, error: 'Validation failed' }, { status: 500 });
  }
}
