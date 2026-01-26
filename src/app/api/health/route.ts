import { NextResponse } from 'next/server';

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export async function GET() {
  // Lazy import env to avoid build-time evaluation
  const { env } = await import('@/config/env');

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.app.env,
    version: process.env.npm_package_version || '0.0.0',
  };

  return NextResponse.json(health);
}
