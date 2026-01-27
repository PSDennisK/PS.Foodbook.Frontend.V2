import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { routing } from './src/i18n/routing';
import { verifyToken } from './src/lib/auth/jwt';
import { verifyPermalinkSignature } from './src/lib/auth/permalink';
import { getCookieName } from './src/lib/utils/helpers';

// Create next-intl middleware for locale handling
const intlMiddleware = createMiddleware(routing);

// Protected routes patterns
const PROTECTED_ROUTES = [/\/digitalcatalog\/[^/]+/, /\/productsheet\/[^/]+/];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from pathname (if present)
  // Since localePrefix is 'as-needed', nl has no prefix
  let locale = routing.defaultLocale;
  for (const loc of routing.locales) {
    if (pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`) {
      locale = loc;
      break;
    }
  }

  // Check if route needs protection (before intl middleware)
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
        // Let intl middleware handle locale routing, then add cookie
        const response = intlMiddleware(request);
        response.cookies.set('permalink_access', 'true', {
          httpOnly: true,
          secure: true,
          maxAge: 600,
          sameSite: 'lax',
        });
        // Add security headers
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        );
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
        // Redirect to unauthorized with locale (nl has no prefix)
        const unauthorizedPath =
          locale === routing.defaultLocale ? '/unauthorized' : `/${locale}/unauthorized`;
        const url = new URL(unauthorizedPath, request.url);
        return NextResponse.redirect(url);
      }

      // Verify token
      const payload = await verifyToken(token);
      if (!payload) {
        // Redirect to unauthorized with locale
        const unauthorizedPath =
          locale === routing.defaultLocale ? '/unauthorized' : `/${locale}/unauthorized`;
        const url = new URL(unauthorizedPath, request.url);
        return NextResponse.redirect(url);
      }
    }
  }

  // Let next-intl handle locale routing
  const response = intlMiddleware(request);

  // Add security headers
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|assets).*)'],
};
