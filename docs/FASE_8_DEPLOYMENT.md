# FASE 8: DEPLOYMENT & HANDOVER - Claude Code Prompt

**Fase:** 8 - Deployment & Handover  
**Duur:** 1 week  
**Doel:** Production ready deployment  

## DOEL
Deploy naar production, setup monitoring, en complete documentatie.

## DEEL 1: DOCKER SETUP

### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://foodbook.psinfoodservice.com
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### .dockerignore
```
node_modules
.next
.git
*.log
.env.local
```

## DEEL 2: CI/CD PIPELINE

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t foodbook-app .
      
      - name: Deploy to production
        run: |
          # Deploy commands here
```

## DEEL 3: ENVIRONMENT CONFIGS

### Production (.env.production)
```bash
# App
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://foodbook.psinfoodservice.com

# API
FOODBOOK_API_URL=https://api.psinfoodservice.com
FOODBOOK_API_TIMEOUT=15000

# Auth
JWT_SECRET=${{ secrets.JWT_SECRET }}
COOKIE_DOMAIN=.psinfoodservice.com
SESSION_DURATION=86400

# Permalink
PERMALINK_SECRET=${{ secrets.PERMALINK_SECRET }}
PERMALINK_MAX_AGE=600

# Cache
CACHE_REVALIDATE=300
CACHE_STALE_WHILE_REVALIDATE=600

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Features
FEATURE_IMPACT_SCORE=true
FEATURE_PDF_GENERATION=true
```

### Staging (.env.staging)
```bash
# Same as production but with staging URLs
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.foodbook.psinfoodservice.com
```

## DEEL 4: MONITORING SETUP

### Sentry Integration
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 0.1,
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 0.1,
});
```

### Health Check
```typescript
// src/app/api/health/route.ts (already created in Fase 1)
// Add more checks:

export async function GET() {
  const checks = {
    api: await checkApiConnection(),
    database: await checkDatabaseConnection(),
    cache: await checkCacheConnection(),
  };

  const status = Object.values(checks).every(c => c) ? 'healthy' : 'unhealthy';

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    checks,
  }, {
    status: status === 'healthy' ? 200 : 503,
  });
}
```

## DEEL 5: DOCUMENTATION

### README.md (Production)
```markdown
# PS Foodbook App - Production

## Architecture
- Next.js 15 App Router
- React 19
- TypeScript 5.7
- TanStack Query for data fetching
- Zustand for state management

## Deployment
Production: https://foodbook.psinfoodservice.com
Staging: https://staging.foodbook.psinfoodservice.com

## Monitoring
- Sentry: [link]
- Logs: [link]
- Metrics: [link]

## Runbook
See RUNBOOK.md for operations guide.
```

### RUNBOOK.md
```markdown
# Operations Runbook

## Health Checks
- Health endpoint: /api/health
- Expected: 200 OK

## Common Issues

### API Connection Failures
**Symptoms:** Products niet laden
**Check:** /api/health → api: false
**Solution:** Check API credentials, network

### Auth Issues
**Symptoms:** Unauthorized errors
**Check:** JWT token validity
**Solution:** Clear cookies, re-login

### Performance Issues
**Symptoms:** Slow page loads
**Check:** Lighthouse scores
**Solution:** Check CDN, cache headers

## Restart Procedures
```bash
# Docker
docker-compose restart app

# Check logs
docker-compose logs -f app
```

## Rollback
```bash
# Revert to previous version
docker-compose down
docker-compose up -d --build [previous-version]
```
```

### API_DOCUMENTATION.md
```markdown
# API Documentation

## Internal API Routes

### Product Endpoints
- GET /api/product/[id] - Get product by ID
- POST /api/product/search - Search products
- GET /api/product/autocomplete - Autocomplete

### Auth Endpoints
- POST /api/auth/validate - Validate token
- POST /api/auth/logout - Logout

### Health Check
- GET /api/health - System health
```

## DEEL 6: PERFORMANCE OPTIMIZATION

### CDN Setup
- Static assets → CDN
- Images → Image CDN
- Fonts → Font CDN

### Caching Strategy
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, stale-while-revalidate=604800',
        },
      ],
    },
  ];
}
```

## DEEL 7: SECURITY CHECKLIST

- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Secrets in environment variables
- [ ] No sensitive data in logs
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] SQL injection prevention
- [ ] CSRF tokens implemented

## DEEL 8: HANDOVER

### Team Training
- Admin dashboard tour
- Common operations
- Troubleshooting guide
- Contact for issues

### Documentation Checklist
- [ ] README complete
- [ ] API docs complete
- [ ] Runbook complete
- [ ] Architecture diagram
- [ ] Deployment guide
- [ ] Monitoring setup
- [ ] Backup procedures
- [ ] Rollback procedures

## OUTPUT
- ✅ Docker setup
- ✅ CI/CD pipeline
- ✅ Production deployment
- ✅ Monitoring active
- ✅ Complete documentation
- ✅ Team trained
- ✅ Rollback tested

## FINAL VERIFICATION
```bash
# Production checks:
1. All routes accessible
2. All features working
3. Performance >90 (Lighthouse)
4. No console errors
5. Monitoring active
6. Backups configured
7. SSL certificate valid
8. Health check passing
9. Logs working
10. Rollback tested

# Sign-off:
- [ ] Development team
- [ ] QA team
- [ ] Operations team
- [ ] Product owner
```

**PROJECT COMPLETE! 🎉**
