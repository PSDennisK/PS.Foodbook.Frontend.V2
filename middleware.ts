import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from './src/i18n/routing';
import { verifyToken } from './src/lib/auth/jwt';
import { verifyPermalinkSignature } from './src/lib/auth/permalink';
import { getCookieName } from './src/lib/utils/helpers';

const intlMiddleware = createIntlMiddleware(routing);

// Protected routes patterns
const PROTECTED_ROUTES = [/\/digitalcatalog\/[^/]+/, /\/productsheet\/[^/]+/];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if route needs protection
  if (isProtectedRoute(pathname)) {
    // Check for permalink parameters
    const searchParams = request.nextUrl.searchParams;
    const pspid = searchParams.get('pspid');
    const psexp = searchParams.get('psexp');
    const pssig = searchParams.get('pssig');

    if (pspid && psexp && pssig && pathname.includes('/productsheet/')) {
      const isValid = await verifyPermalinkSignature({
        productId: pspid,
        expires: psexp,
        signature: pssig,
      });

      if (isValid) {
        // Set permissive cookie for 10 minutes
        const response = intlMiddleware(request);
        response.cookies.set('permalink_access', 'true', {
          httpOnly: true,
          secure: true,
          maxAge: 600,
          sameSite: 'lax',
        });
        return response;
      }
    }

    // Check for permalink_access cookie
    const hasPermalinkAccess = request.cookies.get('permalink_access')?.value === 'true';

    if (!hasPermalinkAccess) {
      // Check for auth token
      const cookieName = getCookieName();
      const token = request.cookies.get(cookieName)?.value;

      if (!token) {
        // Redirect to unauthorized
        const url = new URL('/unauthorized', request.url);
        return NextResponse.redirect(url);
      }

      // Verify token
      const payload = await verifyToken(token);
      if (!payload) {
        const url = new URL('/unauthorized', request.url);
        return NextResponse.redirect(url);
      }
    }

    // Token valid or has permalink access, continue
  }

  // 2. Handle i18n
  const response = intlMiddleware(request);

  // 3. Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: ['/', '/(nl|en|de|fr)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
