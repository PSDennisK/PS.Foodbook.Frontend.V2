# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PS Foodbook is a Next.js 15 application for PS in Foodservice product catalog. The application is built with React 19, TypeScript, and uses the App Router architecture. It supports multi-language (nl, en, de, fr) with Dutch as the default locale.

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting and formatting (using Biome)
npm run lint           # Check only
npm run lint:fix       # Fix issues automatically
npm run format         # Format code

# Testing
npm test               # Run unit tests (Vitest)
npm run test:ui        # Run tests with UI
npm test -- --coverage # Run with coverage report
npm run test:e2e       # Run E2E tests (Playwright)
npm run test:e2e:ui    # Run E2E tests with UI

# Run a single test file
npm test -- path/to/test.spec.ts

# Run tests in watch mode (default)
npm test

# Run a specific E2E test
npm run test:e2e -- tests/e2e/specific-test.spec.ts
```

## Architecture

### Tech Stack Core
- **Framework**: Next.js 15 with App Router (standalone output mode)
- **React**: Version 19
- **TypeScript**: 5.7 with strict mode and noUncheckedIndexedAccess enabled
- **Styling**: Tailwind CSS 4 with custom PS Foodservice brand colors (ps-blue, ps-green)
- **UI Components**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand for global state
- **Server State**: TanStack Query (React Query) with devtools
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Icons**: Lucide React
- **Notifications**: Sonner for toast notifications
- **Date Handling**: date-fns
- **Auth**: JWT via jose library

### Directory Structure

```
src/
├── app/
│   ├── [locale]/           # Locale-based routing
│   │   ├── layout.tsx      # Root layout with i18n and providers
│   │   ├── page.tsx        # Homepage
│   │   ├── error.tsx       # Error boundary
│   │   ├── loading.tsx     # Loading state
│   │   ├── not-found.tsx   # 404 page
│   │   ├── product/        # Product pages
│   │   ├── brand/          # Brand pages
│   │   ├── digitalcatalog/ # Digital catalog pages
│   │   └── productsheet/   # Product sheet pages
│   └── api/                # API routes
│       ├── health/         # Health check endpoint
│       └── log/            # Client-side logging endpoint
├── components/
│   ├── providers/          # React context providers
│   │   └── query-provider.tsx  # TanStack Query provider
│   └── ui/                 # shadcn/ui components
├── config/
│   ├── env.ts              # Environment variable configuration
│   └── site.ts             # Site configuration
├── i18n/
│   ├── request.ts          # next-intl request config
│   ├── routing.ts          # Locale routing configuration
│   └── types.ts            # i18n type definitions
├── lib/
│   ├── api/                # API client layer
│   │   ├── base.ts         # Base fetch with retry/rate limit
│   │   ├── query-client.ts # TanStack Query configuration
│   │   ├── product.service.ts
│   │   ├── brand.service.ts
│   │   ├── catalog.service.ts
│   │   ├── sheet.service.ts
│   │   └── auth.service.ts
│   └── utils/              # Utility functions
│       ├── helpers.ts      # General helpers
│       ├── translation.ts  # Translation utilities
│       ├── url.ts          # URL builders
│       ├── date.ts         # Date formatting
│       ├── image.ts        # Image helpers
│       ├── logger.ts       # Logging utility
│       └── validation.ts   # Validation functions
├── stores/                 # Zustand stores
│   ├── auth.store.ts       # Authentication state
│   └── filter.store.ts     # Filter/search state
└── types/                  # TypeScript types
    ├── enums.ts            # Enumerations
    ├── api.ts              # API response types
    ├── common.ts           # Common shared types
    ├── product.ts          # Product types with Zod schemas
    ├── brand.ts            # Brand types with Zod schemas
    ├── catalog.ts          # Catalog types with Zod schemas
    ├── auth.ts             # Auth types
    └── filter.ts           # Filter/search types

messages/                   # i18n translation files
├── nl.json
├── en.json
├── de.json
└── fr.json

tests/
├── setup.ts                # Vitest setup
├── utils/                  # Test utilities
│   ├── test-utils.tsx      # Custom render with providers
│   └── mock-data.ts        # Mock data for tests
├── unit/                   # Unit tests
└── e2e/                    # E2E tests
```

### Import Aliases

The project uses `@/` as an alias for `./src/` in both TypeScript and Vitest configurations.

### Code Quality Tools

- **Linter/Formatter**: Biome (replacing ESLint + Prettier)
  - Single quotes, semicolons required, ES5 trailing commas
  - 100 character line width, 2 space indentation
  - `useImportType: error` - must use type imports for types
  - `noExplicitAny: warn` - avoid explicit any
- **Pre-commit Hook**: Husky runs `npm run lint` before commits
- **Testing**:
  - Vitest with jsdom for unit tests
  - Coverage thresholds: 80% for lines, functions, branches, statements
  - Playwright for E2E with auto-started dev server
- **Type Safety**: TypeScript strict mode with noUncheckedIndexedAccess

### Environment Configuration

Copy `.env.local.example` to `.env.local`. Key environment variables:

- `NEXT_PUBLIC_APP_ENV` - Environment (development/staging/production)
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `FOODBOOK_API_URL` - Backend API endpoint
- `FOODBOOK_API_TIMEOUT` - API request timeout in ms
- `JWT_SECRET` - JWT signing secret
- `PERMALINK_SECRET` - Secret for permalink generation
- `CACHE_REVALIDATE` - ISR revalidation time in seconds
- `FEATURE_IMPACT_SCORE` - Feature flag for impact score
- `FEATURE_PDF_GENERATION` - Feature flag for PDF generation

### Next.js Configuration

- **Output Mode**: Standalone (for Docker/container deployments)
- **Image Optimization**: AVIF and WebP formats, allows `*.psinfoodservice.com` remote patterns
- **Security Headers**: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy
- **Build**: TypeScript errors block builds (ignoreBuildErrors: false)

### Testing Setup

- **Unit Tests**: Vitest with React Testing Library, jsdom environment
- **E2E Tests**: Playwright tests all major browsers (Chromium, Firefox, WebKit) plus Mobile Chrome
- **Coverage**: V8 provider with HTML/JSON/text reports
- **Test Location**: Unit tests anywhere, E2E tests in `tests/e2e/`

### Styling Conventions

- Tailwind CSS 4 with dark mode support (class strategy)
- Typography plugin enabled
- Custom color palette for PS branding (ps-blue and ps-green with full shade ranges)
- Component styling follows shadcn/ui patterns with class-variance-authority

### Multi-Language Support (next-intl)

The application uses next-intl for internationalization:

- **Supported Locales**: Dutch (nl), English (en), German (de), French (fr)
- **Default Locale**: Dutch (nl)
- **Locale Prefix**: `as-needed` - Dutch has no prefix in URLs, other locales have `/en/`, `/de/`, `/fr/` prefixes
- **Configuration**: `src/i18n/routing.ts` defines routing, `src/i18n/request.ts` handles message loading
- **Message Files**: JSON files in `messages/` directory for each locale
- **Middleware**: `middleware.ts` at root handles automatic locale detection and routing
- **Usage**: Use `useTranslations()` hook from next-intl in components
- **Navigation**: Use `Link`, `redirect`, `usePathname`, `useRouter` from `src/i18n/routing.ts` for locale-aware navigation

### API Client Architecture

All API calls go through a unified client layer with automatic retry, rate limiting, and error handling:

- **Base Client** (`src/lib/api/base.ts`):
  - Automatic retry with exponential backoff (3 retries by default)
  - Rate limiting (1 request per second)
  - Request timeout with progressive increase on retries
  - Bearer token support for authentication
  - Unified error handling returning `ApiResult<T>` type

- **Service Modules**: Each domain has its own service module
  - `product.service.ts` - Product search, details, autocomplete, filters, impact scores
  - `brand.service.ts` - Brand details and filters
  - `catalog.service.ts` - Digital catalog themes and assets
  - `sheet.service.ts` - Product sheets and PDF generation
  - `auth.service.ts` - Token validation and refresh

- **TanStack Query Integration**:
  - Query client configured in `src/lib/api/query-client.ts`
  - 5-minute stale time, 10-minute garbage collection time
  - Query key factory pattern for consistent cache keys
  - React Query DevTools available in development

### Type System

The codebase uses a comprehensive type system with runtime validation:

- **Zod Schemas**: Runtime validation for API responses (Product, Brand, Catalog types)
- **Enumerations**: `Culture`, `FilterType`, `ProductStatus` in `src/types/enums.ts`
- **Type Inference**: All types inferred from Zod schemas using `z.infer<>`
- **Strict Mode**: TypeScript strict mode with `noUncheckedIndexedAccess` enabled
- **Localized Strings**: `LocalizedString` type with `Translation[]` for multi-language content

### State Management

- **Server State**: TanStack Query for all API data (products, brands, catalogs)
- **Client State**: Zustand stores for UI state
  - `auth.store.ts` - Authentication token (persisted to localStorage)
  - `filter.store.ts` - Product search filters and pagination
- **Provider Setup**: `QueryProvider` wraps the app in `src/app/[locale]/layout.tsx`

### Utility Functions

Organized utility modules in `src/lib/utils/`:

- **helpers.ts**: `createSlug()`, `slugToText()`, `normalizeToArray()`, cookie name helpers
- **translation.ts**: `getTranslation()` for extracting localized strings from API data
- **url.ts**: `buildProductUrl()`, `getLocalizedPath()`, `getHomeUrl()` for locale-aware URLs
- **date.ts**: `formatDate()`, `formatDateTime()`, `isOutdated()` with locale support
- **image.ts**: `getProductImage()`, `getOptimizedImageUrl()` for product images
- **logger.ts**: Unified logging that sends client-side logs to `/api/log` endpoint
- **validation.ts**: `validateEan()`, `validateGuid()`, `sanitizeHtml()`

### Routing Structure

All pages are under `src/app/[locale]/` for automatic locale handling:

- `/` - Homepage (product search)
- `/product` - Product search page
- `/product/[id]` - Product detail page
- `/brand/[id]` - Brand detail page
- `/digitalcatalog/[guid]` - Digital catalog home
- `/digitalcatalog/[guid]/product/[id]` - Product in catalog context
- `/digitalcatalog/[guid]/brand/[id]` - Brand in catalog context
- `/productsheet/[id]` - Product sheet view
- `/productsheet/[id]/pdf` - PDF download route

### API Endpoints

- `/api/health` - Health check endpoint returning status, timestamp, environment, version
- `/api/log` - Client-side logging endpoint (POST)

## Docker & Deployment

### Docker Commands

```bash
# Build production image
docker build -t ps-foodbook-app:latest .

# Run with docker-compose (recommended)
docker-compose up        # Start in foreground
docker-compose up -d     # Start in background (detached)
docker-compose down      # Stop containers
docker-compose restart   # Restart containers

# Run container directly
docker run -p 3000:3000 --env-file .env.production ps-foodbook-app:latest

# View container logs
docker logs ps-foodbook-app         # All logs
docker logs -f ps-foodbook-app      # Follow logs
docker logs --tail 100 ps-foodbook-app  # Last 100 lines

# Check container health
docker ps                           # View running containers
docker inspect ps-foodbook-app      # Detailed container info
curl http://localhost:3000/api/health  # Test health endpoint

# Container management
docker stats ps-foodbook-app        # Resource usage
docker exec -it ps-foodbook-app sh  # Access container shell
```

### CI/CD Pipelines

The project uses GitHub Actions for automated CI/CD:

**CI Pipeline** (`.github/workflows/ci.yml`):
- Triggers on all PRs and pushes
- Runs type checking and linting
- Executes unit tests with coverage
- Runs E2E tests with Playwright
- Verifies production build

**Deploy Pipeline** (`.github/workflows/deploy.yml`):
- Triggers on push to master branch
- Runs full CI test suite
- Builds Docker image with Git SHA tag
- Pushes to container registry
- Deploys to production

### Environment Configuration

Three environment configurations are available:

1. **Development** - `.env.local`
   - Hot reload enabled
   - Debug logging
   - Short/no caching
   - Local API endpoint

2. **Staging** - `.env.staging.example`
   - 60s cache revalidation
   - Debug logging enabled
   - Staging API endpoint
   - Staging monitoring

3. **Production** - `.env.production.example`
   - 300s cache revalidation
   - Info logging only
   - Production API endpoint
   - Full monitoring enabled

### Monitoring & Operations

**Health Monitoring:**
- Container health checks run every 30 seconds
- Application health endpoint: `/api/health`
- Automatic restart on failure (3 retries)

**Error Tracking:**
- Sentry for error monitoring (configured via `NEXT_PUBLIC_SENTRY_DSN`)
- Client and server-side error capture
- Performance monitoring and transaction tracking

**Logging:**
- Client logs sent to `/api/log` endpoint
- Server logs to stdout (captured by Docker)
- Log rotation: 10MB max per file, 3 files retained

**Useful Monitoring Commands:**
```bash
# Check application health
curl http://localhost:3000/api/health

# Monitor resource usage
docker stats ps-foodbook-app

# View recent logs
docker logs --since 30m ps-foodbook-app

# Count errors in logs
docker logs ps-foodbook-app | grep ERROR | wc -l

# Export logs for analysis
docker logs ps-foodbook-app > app-logs-$(date +%Y%m%d).log
```

## Documentation Reference

The project includes comprehensive documentation:

- **README.md** - Project overview, setup, and getting started
- **RUNBOOK.md** - Operations procedures and maintenance tasks
- **API_DOCUMENTATION.md** - Internal API routes reference
- **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
- **SECURITY.md** - Security best practices and checklist
- **MONITORING_GUIDE.md** - Monitoring setup and troubleshooting
- **HANDOVER.md** - Team handover and training materials
- **FASE_6_SUMMARY.md** - UI/UX polish phase summary
- **FASE_7_TESTING_SUMMARY.md** - Testing and QA phase summary
- **FASE_8_DEPLOYMENT_SUMMARY.md** - Deployment phase summary
