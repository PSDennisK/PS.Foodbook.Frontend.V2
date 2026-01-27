# API Documentation - PS Foodbook App

## Overview

This document describes the internal API routes of the PS Foodbook Next.js application. These are server-side API routes that handle health checks, authentication, product search, and client-side logging.

**Base URL**: `https://foodbook.psinfoodservice.com/api` (production)

All API routes are implemented as Next.js Route Handlers in the `src/app/api` directory.

## Table of Contents

1. [Health Check](#health-check)
2. [Client Logging](#client-logging)
3. [Authentication](#authentication)
   - [Logout](#logout)
   - [Validate Token](#validate-token)
4. [Product Search](#product-search)
   - [Search](#search)
   - [Autocomplete](#autocomplete)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Health Check

### GET `/api/health`

Health check endpoint for monitoring and load balancer health checks.

**Dynamic Route**: Force-dynamic (not cached, evaluated at runtime)

#### Request

```http
GET /api/health HTTP/1.1
Host: foodbook.psinfoodservice.com
```

**No parameters required**

#### Response

**Success (200 OK)**

```json
{
  "status": "ok",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Response Fields**:
- `status` (string): Always "ok" when healthy
- `timestamp` (string): ISO 8601 timestamp of the response
- `environment` (string): Current environment (development, staging, production)
- `version` (string): Application version from package.json

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Service is healthy |

#### Example Usage

```bash
# cURL
curl https://foodbook.psinfoodservice.com/api/health

# JavaScript
const response = await fetch('/api/health');
const health = await response.json();
console.log(health.status); // "ok"
```

#### Use Cases

- Docker health checks (every 30 seconds)
- Load balancer health probes
- Monitoring services (Sentry, Datadog)
- Uptime monitoring (UptimeRobot, Pingdom)

#### Implementation

Location: `src/app/api/health/route.ts`

---

## Client Logging

### POST `/api/log`

Endpoint for client-side logging. Accepts log messages from the browser and forwards them to server-side logging (console in production, can be extended to Sentry/DataDog).

#### Request

```http
POST /api/log HTTP/1.1
Host: foodbook.psinfoodservice.com
Content-Type: application/json

{
  "level": "error",
  "message": "API call failed",
  "context": {
    "endpoint": "/api/products",
    "error": "Network timeout"
  }
}
```

**Request Body** (JSON):
- `level` (string, optional): Log level (debug, info, warn, error)
- `message` (string, required): Log message
- `context` (object, optional): Additional context data

#### Response

**Success (200 OK)**

```json
{
  "success": true
}
```

**Error (500 Internal Server Error)**

```json
{
  "success": false
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 200 | Log successfully recorded |
| 500 | Server error processing log |

#### Example Usage

```javascript
// Using the logger utility
import { logger } from '@/lib/utils/logger';

// Error logging
logger.error('API call failed', {
  endpoint: '/api/products',
  statusCode: 500
});

// Info logging
logger.info('User action', {
  action: 'search',
  keyword: 'milk'
});

// Direct API call
await fetch('/api/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'error',
    message: 'Something went wrong',
    context: { page: '/product/123' }
  })
});
```

#### Implementation

Location: `src/app/api/log/route.ts`

**Note**: In production, this logs to console. Can be extended to forward to external logging services like Sentry or DataDog.

---

## Authentication

### Logout

#### POST `/api/auth/logout`

Clears the authentication token cookie and logs the user out.

##### Request

```http
POST /api/auth/logout HTTP/1.1
Host: foodbook.psinfoodservice.com
```

**No body required**

##### Response

**Success (200 OK)**

```json
{
  "success": true
}
```

The response also sets a cookie to clear the auth token:
```
Set-Cookie: auth_token=; Max-Age=0; Path=/; Domain=.psinfoodservice.com; Secure; HttpOnly; SameSite=Lax
```

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | Successfully logged out |

##### Example Usage

```javascript
// Logout function
async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST'
  });

  if (response.ok) {
    // Redirect to login or home
    window.location.href = '/';
  }
}
```

##### Implementation

Location: `src/app/api/auth/logout/route.ts`

Uses: `clearAuthToken()` from `@/lib/auth/cookies`

---

### Validate Token

#### POST `/api/auth/validate`

Validates a JWT token and returns the decoded payload if valid.

##### Request

```http
POST /api/auth/validate HTTP/1.1
Host: foodbook.psinfoodservice.com
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body** (JSON):
- `token` (string, required): JWT token to validate

##### Response

**Success (200 OK)**

```json
{
  "isValid": true,
  "payload": {
    "userId": "12345",
    "email": "user@example.com",
    "iat": 1706356800,
    "exp": 1706443200
  }
}
```

**Invalid Token (401 Unauthorized)**

```json
{
  "isValid": false,
  "error": "Invalid token"
}
```

**Missing Token (400 Bad Request)**

```json
{
  "isValid": false,
  "error": "No token provided"
}
```

**Server Error (500 Internal Server Error)**

```json
{
  "isValid": false,
  "error": "Validation failed"
}
```

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | Token is valid |
| 400 | No token provided |
| 401 | Token is invalid or expired |
| 500 | Server error during validation |

##### Example Usage

```javascript
// Validate current token
async function validateToken(token) {
  const response = await fetch('/api/auth/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const result = await response.json();

  if (result.isValid) {
    console.log('User:', result.payload.email);
  } else {
    console.error('Invalid token:', result.error);
  }
}
```

##### Implementation

Location: `src/app/api/auth/validate/route.ts`

Uses: `verifyToken()` from `@/lib/auth/jwt`

**Security**:
- Tokens are signed with `JWT_SECRET` environment variable
- Tokens expire based on `SESSION_DURATION` (default: 86400 seconds / 24 hours)
- Uses the `jose` library for JWT operations

---

## Product Search

### Search

#### POST `/api/search`

Searches for products using the backend API with filters, pagination, and locale support.

##### Request

```http
POST /api/search HTTP/1.1
Host: foodbook.psinfoodservice.com
Content-Type: application/json

{
  "keyword": "milk",
  "locale": "nl",
  "pageIndex": 0,
  "pageSize": 20,
  "filters": {
    "brand": ["brand-id-1", "brand-id-2"],
    "category": ["category-id-1"]
  },
  "securityToken": "optional-token-for-private-catalogs"
}
```

**Request Body** (JSON):
- `keyword` (string, optional): Search keyword
- `locale` (string, optional): Language code (nl, en, de, fr). Default: "nl"
- `pageIndex` (number, optional): Page number (0-based). Default: 0
- `pageSize` (number, optional): Items per page. Default: 21
- `filters` (object, optional): Filter criteria by key-value pairs
- `securityToken` (string, optional): Token for accessing private catalogs

##### Response

**Success (200 OK)**

```json
{
  "products": [
    {
      "id": 123,
      "name": "Whole Milk 1L",
      "brand": "Brand Name",
      "gtin": "1234567890123",
      "image": "https://cdn.example.com/image.jpg",
      "artikelnummer": "ART-123"
    }
  ],
  "pagination": {
    "page": 0,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  },
  "filters": [
    {
      "key": "brand",
      "label": "Brand",
      "type": "checkbox",
      "options": [
        {
          "id": "brand-1",
          "label": "Brand Name",
          "count": 45
        }
      ]
    }
  ]
}
```

**Error Response (502 Bad Gateway)**

```json
{
  "error": "Search failed"
}
```

Backend API is unreachable or returned an error.

**Error Response (500 Internal Server Error)**

```json
{
  "error": "Internal server error"
}
```

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | Search completed successfully |
| 500 | Internal server error |
| 502 | Backend API error |

##### Example Usage

```javascript
// Search for products
async function searchProducts(keyword, filters = {}) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      keyword,
      locale: 'nl',
      pageIndex: 0,
      pageSize: 20,
      filters
    })
  });

  const results = await response.json();
  return results.products;
}

// Example: Search with filters
const products = await searchProducts('milk', {
  brand: ['brand-123'],
  category: ['dairy']
});
```

##### Implementation

Location: `src/app/api/search/route.ts`

Uses: `productService.search()` from `@/lib/api/product.service`

**Backend Integration**:
- Forwards request to `FOODBOOK_API_URL/api/products/search`
- Includes retry logic and rate limiting
- 15-second timeout (configurable via `FOODBOOK_API_TIMEOUT`)

---

### Autocomplete

#### GET `/api/autocomplete`

Provides search suggestions for autocomplete functionality.

##### Request

```http
GET /api/autocomplete?q=mil&locale=nl&securityToken=optional-token HTTP/1.1
Host: foodbook.psinfoodservice.com
```

**Query Parameters**:
- `q` (string, required): Search keyword (minimum 2-3 characters recommended)
- `locale` (string, optional): Language code (nl, en, de, fr). Default: "nl"
- `securityToken` (string, optional): Token for accessing private catalogs

##### Response

**Success (200 OK)**

```json
{
  "suggestions": [
    "Milk whole",
    "Milk semi-skimmed",
    "Milk skimmed",
    "Milk chocolate",
    "Milk alternative"
  ]
}
```

**Empty Query (200 OK)**

```json
{
  "suggestions": []
}
```

**Error (500 Internal Server Error)**

```json
{
  "suggestions": []
}
```

Returns empty array on error to prevent breaking the UI.

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | Suggestions returned (or empty array) |
| 500 | Server error (returns empty array) |

##### Example Usage

```javascript
// Autocomplete with debouncing
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useQuery } from '@tanstack/react-query';

function SearchAutocomplete() {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, 300);

  const { data } = useQuery({
    queryKey: ['autocomplete', debouncedKeyword],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: debouncedKeyword,
        locale: 'nl'
      });

      const response = await fetch(`/api/autocomplete?${params}`);
      return response.json();
    },
    enabled: debouncedKeyword.length >= 2
  });

  return (
    <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      list="suggestions"
    />
    <datalist id="suggestions">
      {data?.suggestions.map(suggestion => (
        <option key={suggestion} value={suggestion} />
      ))}
    </datalist>
  );
}
```

##### Implementation

Location: `src/app/api/autocomplete/route.ts`

Uses: `productService.autocomplete()` from `@/lib/api/product.service`

**Performance Considerations**:
- Should be debounced on the client side (300-500ms recommended)
- Returns maximum 5-10 suggestions typically
- Cached responses (5 minutes stale time)

---

## Error Handling

### Standard Error Response Format

All API routes follow a consistent error response format:

```json
{
  "error": "Error message description"
}
```

### Common Error Scenarios

#### 400 Bad Request

Invalid request parameters or missing required fields.

**Example**:
```json
{
  "error": "No token provided"
}
```

#### 401 Unauthorized

Authentication failed or token is invalid.

**Example**:
```json
{
  "isValid": false,
  "error": "Invalid token"
}
```

#### 500 Internal Server Error

Server-side error during processing.

**Example**:
```json
{
  "error": "Internal server error"
}
```

#### 502 Bad Gateway

Backend API is unreachable or returned an error.

**Example**:
```json
{
  "error": "Search failed"
}
```

### Error Logging

All errors are logged to:
1. **Console**: `console.error()` for server logs
2. **Client Logs**: Can be sent to `/api/log` for client-side errors
3. **Sentry**: (Optional) Error monitoring service

### Retry Logic

API routes that call the backend API include automatic retry logic:
- **Retries**: 3 attempts
- **Backoff**: Exponential (1s, 2s, 4s)
- **Timeout**: 15 seconds (configurable via `FOODBOOK_API_TIMEOUT`)

Implemented in `src/lib/api/base.ts`.

---

## Rate Limiting

### Current Implementation

**Rate limiting is currently implemented at the API client level** (not at the route level):

- **Limit**: 1 request per second per endpoint
- **Mechanism**: Queue-based throttling in `src/lib/api/base.ts`

### Recommended Production Rate Limiting

For production, implement rate limiting using middleware or a reverse proxy:

#### Option 1: Nginx Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api/ {
  limit_req zone=api burst=20 nodelay;
  proxy_pass http://localhost:3000;
}
```

#### Option 2: Next.js Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? 'unknown';
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100;

    const rateLimit = rateLimitMap.get(ip);

    if (rateLimit) {
      if (now < rateLimit.resetTime) {
        if (rateLimit.count >= maxRequests) {
          return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    }
  }

  return NextResponse.next();
}
```

### Rate Limit Headers

When implementing rate limiting, include these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706356800
```

---

## API Client Usage

### Using TanStack Query

The recommended way to call these APIs is using TanStack Query (React Query):

```javascript
import { useQuery } from '@tanstack/react-query';

// Health check
const { data: health } = useQuery({
  queryKey: ['health'],
  queryFn: async () => {
    const res = await fetch('/api/health');
    return res.json();
  },
  refetchInterval: 30000 // Check every 30 seconds
});

// Product search
const { data: results } = useQuery({
  queryKey: ['products', 'search', keyword, filters],
  queryFn: async () => {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, filters })
    });
    return res.json();
  },
  enabled: Boolean(keyword), // Only fetch when there's a keyword
  staleTime: 5 * 60 * 1000 // 5 minutes
});
```

### Using Service Layer

The application provides service modules for type-safe API calls:

```javascript
import { productService } from '@/lib/api/product.service';

// Product search (returns ApiResult<SearchResults>)
const result = await productService.search({
  keyword: 'milk',
  locale: 'nl',
  pageIndex: 0,
  pageSize: 20
});

if (result.success) {
  console.log('Products:', result.data.products);
} else {
  console.error('Error:', result.error);
}
```

---

## Security Considerations

### Authentication

- **JWT Tokens**: Stored in HTTP-only cookies
- **Secret**: `JWT_SECRET` environment variable (min 32 characters)
- **Expiry**: Configurable via `SESSION_DURATION`
- **Signing Algorithm**: HS256 (HMAC with SHA-256)

### CORS

Currently, the API is same-origin only. To enable CORS:

```typescript
// In route handlers
export async function GET() {
  const response = NextResponse.json(data);

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST');

  return response;
}
```

### Input Validation

All API routes should validate input using Zod schemas:

```typescript
import { z } from 'zod';

const searchSchema = z.object({
  keyword: z.string().min(2).max(100),
  locale: z.enum(['nl', 'en', 'de', 'fr']),
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100)
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = searchSchema.parse(body); // Throws if invalid
  // ...
}
```

### Content Security Policy

Recommended CSP headers (configured in `next.config.ts`):

```
Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.psinfoodservice.com
```

---

## Monitoring and Observability

### Health Check Monitoring

Monitor `/api/health` endpoint:
- **Frequency**: Every 30 seconds
- **Timeout**: 10 seconds
- **Expected**: 200 OK with `status: "ok"`

### Logging

All API routes log to:
1. **Console** (stdout/stderr)
2. **Client Logs** (`/api/log` endpoint)
3. **Sentry** (optional, configured via `SENTRY_DSN`)

### Metrics to Track

1. **Request Volume**: Requests per endpoint per minute
2. **Response Times**: P50, P95, P99 latencies
3. **Error Rates**: 4xx and 5xx errors per endpoint
4. **Backend API Performance**: Response times for proxied requests

### Sentry Integration

Configure Sentry for error tracking:

```bash
# .env.production
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=ps-foodbook
```

Sentry will automatically capture:
- Unhandled errors
- API failures
- Performance issues

---

## Appendix

### Environment Variables

Required environment variables for API routes:

```bash
# Application
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://foodbook.psinfoodservice.com

# Backend API
FOODBOOK_API_URL=https://api.psinfoodservice.com
FOODBOOK_API_TIMEOUT=15000

# Authentication
JWT_SECRET=your-secure-secret-min-32-chars
COOKIE_DOMAIN=.psinfoodservice.com
SESSION_DURATION=86400

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### TypeScript Types

Key types used in API routes:

```typescript
// Search parameters
interface SearchParams {
  keyword?: string;
  locale?: Culture;
  pageIndex?: number;
  pageSize?: number;
  filters?: Record<string, string[]>;
  securityToken?: string;
}

// Search results
interface SearchResults {
  products: SearchProduct[];
  pagination: Pagination;
  filters: Filter[];
}

// API result wrapper
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Location: `src/types/`

### Testing API Routes

#### Unit Tests

```bash
# Run API route tests
npm test -- src/app/api
```

#### Integration Tests

```bash
# Test with real backend (staging)
curl -X POST https://staging.foodbook.psinfoodservice.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"keyword":"milk","locale":"nl"}'
```

#### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://foodbook.psinfoodservice.com/api/health

# Using k6
k6 run api-load-test.js
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-27
**Maintained By**: PS in Foodservice Development Team
