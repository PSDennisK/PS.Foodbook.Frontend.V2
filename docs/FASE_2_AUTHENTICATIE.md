# FASE 2: AUTHENTICATIE - Claude Code Prompt

**Project:** PS.Foodbook.Frontend Modernisering  
**Fase:** 2 - Authenticatie  
**Duur:** 1 week  
**Doel:** JWT authenticatie en beveiliging  

---

## CONTEXT

PS.Foodbook.Frontend modernisering - Fase 2: Authenticatie.
Core architectuur is compleet (Fase 1). Nu implementeren we het JWT authenticatie systeem.

## DOEL

Implementeer het volledige authenticatie systeem met JWT tokens, HTTP-only cookies,
middleware protection, en token refresh flow. Beveiligde routes voor catalogi en productsheets.

---

## REQUIREMENTS

### 1. JWT TOKEN HANDLING

#### src/lib/auth/jwt.ts

```typescript
import { jwtVerify, SignJWT } from 'jose';
import { env } from '@/config/env';
import type { JWTPayload } from '@/types/auth';

const SECRET = new TextEncoder().encode(env.auth.jwtSecret);

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${env.auth.sessionDuration}s`)
    .sign(SECRET);

  return token;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
```

### 2. COOKIE MANAGEMENT

#### src/lib/auth/cookies.ts

```typescript
import { cookies } from 'next/headers';
import { getCookieName } from '@/lib/utils/helpers';
import { env } from '@/config/env';

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieName = getCookieName();
  
  return cookieStore.get(cookieName)?.value;
}

export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName();
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: env.app.env === 'production',
    sameSite: 'lax',
    maxAge: env.auth.sessionDuration,
    path: '/',
    domain: env.auth.cookieDomain,
  });
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName();
  
  cookieStore.delete(cookieName);
}
```

**Client-side cookie utility (src/lib/auth/cookies.client.ts):**

```typescript
'use client';

import { getCookieName } from '@/lib/utils/helpers';

export function getClientAuthToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const cookieName = getCookieName();
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }

  return undefined;
}
```

### 3. AUTH CONTEXT & HOOKS

#### src/contexts/auth-context.tsx

```typescript
'use client';

import { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/lib/api/auth.service';
import { getClientAuthToken } from '@/lib/auth/cookies.client';
import { logger } from '@/lib/utils/logger';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setToken, clearToken } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    const initAuth = async () => {
      // 1. Check store
      if (token) {
        const validation = await authService.validateToken(token);
        if (validation.isValid) return;
      }

      // 2. Check cookie
      const cookieToken = getClientAuthToken();
      if (cookieToken) {
        const validation = await authService.validateToken(cookieToken);
        if (validation.isValid) {
          setToken(cookieToken);
          return;
        }
      }

      // 3. Clear invalid token
      clearToken();
    };

    initAuth();
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    logger.info('User logged in', 'AuthContext');
  };

  const logout = () => {
    clearToken();
    logger.info('User logged out', 'AuthContext');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Update src/app/[locale]/layout.tsx:**

```typescript
import { AuthProvider } from '@/contexts/auth-context';

export default async function LocaleLayout({ children, params }: Props) {
  // ... existing code
  
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4. MIDDLEWARE AUTH PROTECTION

Update **middleware.ts** in root:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { verifyToken } from './src/lib/auth/jwt';
import { getCookieName } from './src/lib/utils/helpers';

const intlMiddleware = createIntlMiddleware(routing);

// Protected routes patterns
const PROTECTED_ROUTES = [
  /\/digitalcatalog\/[^/]+/,
  /\/productsheet\/[^/]+/,
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if route needs protection
  if (isProtectedRoute(pathname)) {
    const cookieName = getCookieName();
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      // Redirect to login or show error
      const url = new URL('/unauthorized', request.url);
      return NextResponse.redirect(url);
    }

    // Verify token
    const payload = await verifyToken(token);
    if (!payload) {
      const url = new URL('/unauthorized', request.url);
      return NextResponse.redirect(url);
    }

    // Token valid, continue
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
```

### 5. PERMALINK SECURITY (for productsheets)

#### src/lib/auth/permalink.ts

```typescript
import { env } from '@/config/env';
import crypto from 'crypto';

export interface PermalinkParams {
  productId: string;
  expires: string;
  signature: string;
}

export async function verifyPermalinkSignature(
  params: PermalinkParams
): Promise<boolean> {
  const { productId, expires, signature } = params;

  // Check expiry
  const expiryTime = parseInt(expires);
  if (Date.now() > expiryTime * 1000) {
    return false;
  }

  // Verify signature
  const message = `${productId}:${expires}`;
  const expectedSignature = await computeHMAC(message, env.permalink.secret);

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function generatePermalinkSignature(
  productId: string,
  expiresInSeconds: number = env.permalink.maxAge
): Promise<PermalinkParams> {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const message = `${productId}:${expires}`;
  const signature = await computeHMAC(message, env.permalink.secret);

  return {
    productId,
    expires: expires.toString(),
    signature,
  };
}

async function computeHMAC(message: string, secret: string): Promise<string> {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}
```

**Middleware permalink check (add to middleware.ts):**

```typescript
// In middleware function, before i18n handling:

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
    const response = NextResponse.next();
    response.cookies.set('permalink_access', 'true', {
      httpOnly: true,
      secure: true,
      maxAge: 600,
      sameSite: 'lax',
    });
    return response;
  }
}
```

### 6. API ROUTES

#### src/app/api/auth/validate/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { isValid: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { isValid: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      isValid: true,
      payload,
    });
  } catch (error) {
    return NextResponse.json(
      { isValid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
```

#### src/app/api/auth/logout/route.ts

```typescript
import { NextResponse } from 'next/server';
import { clearAuthToken } from '@/lib/auth/cookies';

export async function POST() {
  await clearAuthToken();

  return NextResponse.json({ success: true });
}
```

### 7. PROTECTED COMPONENTS

#### src/components/auth/protected-route.tsx

```typescript
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return fallback || <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

#### src/components/auth/login-status.tsx

```typescript
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export function LoginStatus() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ingelogd</span>
      <Button variant="outline" size="sm" onClick={logout}>
        Uitloggen
      </Button>
    </div>
  );
}
```

### 8. ERROR PAGES

#### src/app/[locale]/unauthorized/page.tsx

```typescript
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const t = useTranslations('common');

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Geen toegang</h1>
      <p className="mt-4 text-muted-foreground">
        Je hebt geen toegang tot deze pagina. Log in om verder te gaan.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Terug naar home</Link>
      </Button>
    </div>
  );
}
```

### 9. SECURITY UTILITIES

#### src/lib/utils/security.ts

```typescript
import crypto from 'crypto';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token: string, expected: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expected)
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}
```

### 10. RATE LIMITING

#### src/lib/auth/rate-limit.ts

```typescript
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // New window
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Every minute
```

### 11. TESTING

#### tests/unit/auth/jwt.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { verifyToken, createToken, decodeToken, isTokenExpired } from '@/lib/auth/jwt';

describe('JWT utilities', () => {
  it('creates and verifies token', async () => {
    const payload = { sub: 'user123', iat: Math.floor(Date.now() / 1000) };
    const token = await createToken(payload);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const verified = await verifyToken(token);
    expect(verified).toBeDefined();
    expect(verified?.sub).toBe('user123');
  });

  it('decodes token without verification', () => {
    const payload = { sub: 'user123', iat: Math.floor(Date.now() / 1000) };
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaWF0IjoxNjE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    const decoded = decodeToken(token);
    expect(decoded?.sub).toBe('user123');
  });

  it('detects expired tokens', () => {
    const expiredPayload = { 
      sub: 'user123', 
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    };
    
    expect(isTokenExpired(expiredPayload)).toBe(true);
  });
});
```

#### tests/unit/auth/permalink.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { generatePermalinkSignature, verifyPermalinkSignature } from '@/lib/auth/permalink';

describe('Permalink security', () => {
  it('generates and verifies permalink signature', async () => {
    const productId = '123';
    const params = await generatePermalinkSignature(productId, 600);

    expect(params.productId).toBe(productId);
    expect(params.signature).toBeDefined();

    const isValid = await verifyPermalinkSignature(params);
    expect(isValid).toBe(true);
  });

  it('rejects expired permalink', async () => {
    const params = {
      productId: '123',
      expires: '1000000000', // Way in the past
      signature: 'invalid',
    };

    const isValid = await verifyPermalinkSignature(params);
    expect(isValid).toBe(false);
  });
});
```

---

## OUTPUT

- ✅ JWT token validatie werkend
- ✅ HTTP-only cookie management (server + client)
- ✅ Auth context en hooks
- ✅ Middleware protection voor protected routes
- ✅ Permalink security systeem
- ✅ Auth API routes
- ✅ Protected route components
- ✅ Security headers
- ✅ Rate limiting
- ✅ Error pages
- ✅ Tests voor auth functies

---

## VERIFICATION

```bash
# 1. Type check
npm run type-check
# → Geen errors

# 2. Tests
npm run test
# → Auth tests passen

# 3. Dev server
npm run dev

# 4. Test auth flow in browser:
# - Navigate to /digitalcatalog/test-guid (should redirect to /unauthorized)
# - Navigate to /productsheet/123 (should redirect to /unauthorized)

# 5. Test permalink:
# - Create permalink URL with valid signature
# - Access should work for 10 minutes

# 6. Test cookie:
# - Check browser DevTools → Application → Cookies
# - Should see PsFoodbookToken (or variant)

# 7. Test logout:
# - Click logout button
# - Cookie should be cleared
```

---

## CRITICAL CHECKS

- [ ] JWT verification works
- [ ] Cookies are HTTP-only and secure
- [ ] Middleware blocks unauthorized access
- [ ] Permalink signatures verify correctly
- [ ] Token expiry is enforced
- [ ] Security headers are set
- [ ] Rate limiting works
- [ ] Auth state persists in Zustand
- [ ] Logout clears all auth data
- [ ] Protected routes redirect correctly

**Volgende stap:** Fase 3 - Product Search & Catalog
