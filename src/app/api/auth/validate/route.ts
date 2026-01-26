import { verifyToken } from '@/lib/auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ isValid: false, error: 'No token provided' }, { status: 400 });
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json({ isValid: false, error: 'Invalid token' }, { status: 401 });
    }

    return NextResponse.json({
      isValid: true,
      payload,
    });
  } catch (error) {
    return NextResponse.json({ isValid: false, error: 'Validation failed' }, { status: 500 });
  }
}
