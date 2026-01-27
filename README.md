# PS Foodbook App

Modern Next.js 15 application for PS in Foodservice product catalog with multi-language support (Dutch, English, German, French).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Documentation](#documentation)

## Features

- **Multi-Language Support**: Full i18n with next-intl (nl, en, de, fr)
- **Product Search**: Advanced filtering with pagination and autocomplete
- **Digital Catalogs**: Theme-based product collections with custom layouts
- **Product Sheets**: Generate and view product data sheets with PDF export
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- **Responsive Design**: Mobile-first design with touch-optimized interfaces
- **Performance**: ISR caching, code splitting, and optimized image loading
- **Type Safety**: Full TypeScript with runtime validation using Zod
- **Testing**: 80%+ coverage with unit, integration, and E2E tests

## Tech Stack

### Core Framework
- **Next.js 15** - App Router, React Server Components, Standalone output
- **React 19** - Latest React features
- **TypeScript 5.7** - Strict mode with noUncheckedIndexedAccess

### UI & Styling
- **Tailwind CSS 4** - Utility-first styling with custom PS brand colors
- **shadcn/ui** - Radix UI-based component library
- **Framer Motion** - Optional animations
- **Lucide React** - Icon library

### State & Data
- **TanStack Query** - Server state management with caching
- **Zustand** - Client-side state management
- **React Hook Form** - Form handling with Zod validation
- **Zod** - Runtime type validation

### Internationalization
- **next-intl** - Multi-language support with locale-based routing

### Testing & Quality
- **Vitest** - Unit and integration testing
- **Playwright** - E2E testing across browsers
- **Biome** - Fast linting and formatting
- **Husky** - Git hooks for pre-commit checks

### Monitoring & Analytics
- **Sentry** - Error tracking and performance monitoring
- **Google Tag Manager** - Analytics and tracking

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Docker**: For containerized deployment (optional)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PS.Foodbook.Frontend.v2

# Install dependencies
npm install
```

### Environment Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Configure required environment variables:
```bash
# Application
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
FOODBOOK_API_URL=https://your-api-endpoint.com
FOODBOOK_API_TIMEOUT=15000

# Authentication
JWT_SECRET=your-jwt-secret-min-32-characters
COOKIE_DOMAIN=localhost
SESSION_DURATION=86400

# Permalink Security
PERMALINK_SECRET=your-permalink-secret
PERMALINK_MAX_AGE=600
```

See `.env.production.example` for production configuration.

### Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack (port 3000)

# Type Checking
npm run type-check       # Run TypeScript compiler checks

# Linting & Formatting
npm run lint             # Check for linting issues
npm run lint:fix         # Fix linting issues automatically
npm run format           # Format code with Biome

# Testing
npm test                 # Run unit tests in watch mode
npm test -- --run        # Run unit tests once
npm test -- --coverage   # Run with coverage report
npm run test:ui          # Run tests with Vitest UI
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # Run E2E tests with Playwright UI

# Building
npm run build            # Build for production
npm run build:analyze    # Build with bundle analyzer
npm start                # Start production server

# Docker
docker-compose up        # Start with Docker Compose
docker-compose up -d     # Start in detached mode
docker-compose down      # Stop containers
```

### Running Specific Tests

```bash
# Run a single test file
npm test -- path/to/test.spec.ts

# Run tests matching a pattern
npm test -- --grep "ProductCard"

# Run a specific E2E test
npm run test:e2e -- tests/e2e/product-search.spec.ts
```

### Code Quality

The project uses **Biome** for linting and formatting with the following rules:
- Single quotes, semicolons required
- 100 character line width, 2 space indentation
- `useImportType: error` - Must use type imports for types
- `noExplicitAny: warn` - Avoid explicit any

Pre-commit hooks automatically run linting on staged files.

## Testing

### Test Structure

```
tests/
├── setup.ts              # Vitest global setup
├── utils/
│   ├── test-utils.tsx    # Custom render with providers
│   └── mock-data.ts      # Mock data generators
├── unit/                 # Component and function tests
│   ├── components/
│   ├── hooks/
│   ├── stores/
│   └── utils/
├── integration/          # Multi-component interaction tests
└── e2e/                  # End-to-end browser tests
```

### Coverage Requirements

Minimum 80% coverage for:
- Lines
- Functions
- Branches
- Statements

### Running Tests in CI

Tests are automatically run in GitHub Actions:
- Unit tests on all PRs and pushes
- E2E tests on all PRs and pushes
- Coverage reports uploaded to Codecov

## Building

### Local Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Build

```bash
# Build Docker image
docker build -t ps-foodbook-app:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production ps-foodbook-app:latest

# Or use Docker Compose
docker-compose up -d
```

### Build Output

- **Standalone Output**: Optimized for container deployment
- **Static Assets**: Optimized images, fonts, and CSS
- **Source Maps**: Generated for production debugging

## Deployment

### Production Deployment

The application is deployed using Docker containers with health checks:

1. **Environment Setup**: Configure `.env.production`
2. **Build Image**: `docker build -t ps-foodbook-app:latest .`
3. **Run Container**: `docker-compose up -d`
4. **Health Check**: Monitor `/api/health` endpoint

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

### CI/CD Pipeline

GitHub Actions workflows:
- **CI** (`.github/workflows/ci.yml`): Runs on all PRs and pushes
  - Lint and type check
  - Unit tests with coverage
  - E2E tests
  - Build verification

- **Deploy** (`.github/workflows/deploy.yml`): Runs on master branch
  - All CI checks
  - Docker image build
  - Container registry push
  - Deployment to production

### Staging Environment

Use `.env.staging.example` for staging configuration:
- Shorter cache times for testing
- Debug logging enabled
- Staging API endpoints
- Staging monitoring (Sentry, GTM)

### Environment-Specific Configurations

| Environment | API URL | Cache | Logging | Monitoring |
|------------|---------|-------|---------|------------|
| Development | localhost | Disabled | Debug | Disabled |
| Staging | staging-api | 60s | Debug | Enabled |
| Production | api | 300s | Info | Enabled |

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-based routing
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Homepage
│   │   ├── product/         # Product pages
│   │   ├── brand/           # Brand pages
│   │   ├── digitalcatalog/  # Digital catalog pages
│   │   └── productsheet/    # Product sheet pages
│   └── api/                 # API routes
│       ├── health/          # Health check
│       └── log/             # Client-side logging
│
├── components/              # React components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── product/            # Product-specific components
│   ├── search/             # Search and filter components
│   ├── providers/          # React context providers
│   └── ui/                 # Reusable UI components (shadcn/ui)
│
├── lib/                     # Core utilities
│   ├── api/                # API client layer
│   │   ├── base.ts         # Base fetch with retry/rate limit
│   │   ├── query-client.ts # TanStack Query config
│   │   └── *.service.ts    # Domain-specific services
│   └── utils/              # Utility functions
│       ├── helpers.ts      # General helpers
│       ├── translation.ts  # i18n utilities
│       ├── url.ts          # URL builders
│       ├── date.ts         # Date formatting
│       └── logger.ts       # Unified logging
│
├── stores/                  # Zustand stores
│   ├── auth.store.ts       # Authentication state
│   └── filter.store.ts     # Search/filter state
│
├── types/                   # TypeScript types
│   ├── enums.ts            # Enumerations
│   ├── api.ts              # API response types
│   └── *.ts                # Domain-specific types with Zod schemas
│
├── i18n/                    # Internationalization
│   ├── request.ts          # next-intl request config
│   ├── routing.ts          # Locale routing
│   └── types.ts            # i18n types
│
└── config/                  # Configuration
    ├── env.ts              # Environment variables
    └── site.ts             # Site metadata

messages/                    # Translation files
├── nl.json                 # Dutch (default)
├── en.json                 # English
├── de.json                 # German
└── fr.json                 # French
```

### Key Architectural Decisions

1. **App Router**: Leveraging Next.js 15 App Router for optimal performance
2. **Standalone Output**: Optimized for Docker containerization
3. **ISR Caching**: Incremental Static Regeneration for dynamic content
4. **Type Safety**: Zod schemas for runtime validation of API responses
5. **Locale-Based Routing**: next-intl with `as-needed` prefix strategy
6. **State Separation**: TanStack Query for server state, Zustand for UI state
7. **API Client Layer**: Unified fetch with retry, rate limiting, and error handling

### Data Flow

```
User Action → Zustand Store → TanStack Query → API Service → Backend API
                                      ↓
                                 Cache Layer
                                      ↓
                             React Components
```

## Documentation

### Additional Documentation

- [RUNBOOK.md](./RUNBOOK.md) - Operations and maintenance procedures
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Internal API routes
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment procedures
- [SECURITY.md](./SECURITY.md) - Security best practices
- [MONITORING_GUIDE.md](./MONITORING_GUIDE.md) - Monitoring and observability
- [CLAUDE.md](./CLAUDE.md) - AI assistant instructions

### Phase Summaries

- [FASE_6_SUMMARY.md](./FASE_6_SUMMARY.md) - UI/UX Polish
- [FASE_7_TESTING_SUMMARY.md](./FASE_7_TESTING_SUMMARY.md) - Testing & QA
- [FASE_8_DEPLOYMENT_SUMMARY.md](./FASE_8_DEPLOYMENT_SUMMARY.md) - Deployment & Handover

### Health Check

The application exposes a health check endpoint:

```bash
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-27T12:00:00Z",
  "environment": "production",
  "version": "1.0.0"
}
```

## License

Private - PS in Foodservice
