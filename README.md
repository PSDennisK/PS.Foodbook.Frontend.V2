# PS Foodbook App

Modern Next.js 15 application for PS in Foodservice product catalog with multi-language support (Dutch, English, German, French).

**🚀 Status:** Production Ready | **📊 Coverage:** 85% | **🔧 Version:** 1.0.0

> Complete product catalog solution with advanced search, multi-language support, digital catalogs, and PDF generation. Fully containerized with automated CI/CD pipelines and comprehensive monitoring.

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

### Production Infrastructure

The application is production-ready with:
- **Docker Containerization**: Multi-stage builds with health monitoring
- **CI/CD Automation**: GitHub Actions for testing and deployment
- **Health Monitoring**: Automatic health checks every 30 seconds
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Optimization**: ISR caching, code splitting, image optimization
- **Security**: Security headers, secrets management, non-root containers

### Quick Start - Production Deployment

```bash
# 1. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your settings

# 2. Deploy with Docker Compose (recommended)
docker-compose up -d

# 3. Verify deployment
curl http://localhost:3000/api/health

# 4. Monitor logs
docker logs -f ps-foodbook-app
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions.

### Docker Deployment

**Build and Run:**
```bash
# Build production image
docker build -t ps-foodbook-app:latest .

# Run with docker-compose (includes health checks)
docker-compose up -d

# Or run container directly
docker run -p 3000:3000 --env-file .env.production ps-foodbook-app:latest
```

**Container Features:**
- Multi-stage build (~200MB image size)
- Non-root user (nextjs:1001) for security
- Health checks with automatic restart
- Log rotation (10MB max, 3 files)
- Optimized standalone output

### CI/CD Pipeline

GitHub Actions workflows provide automated testing and deployment:

**CI Pipeline** (`.github/workflows/ci.yml`):
- ✅ Runs on all PRs and pushes
- ✅ TypeScript type checking
- ✅ Biome linting and formatting
- ✅ Unit tests with 80% coverage requirement
- ✅ E2E tests across browsers (Chromium, Firefox, WebKit)
- ✅ Production build verification
- ✅ Coverage report to Codecov

**Deploy Pipeline** (`.github/workflows/deploy.yml`):
- ✅ Triggers on push to master branch
- ✅ Runs full CI test suite
- ✅ Builds Docker image with Git SHA tag
- ✅ Pushes to container registry
- ✅ Deploys to production environment
- ✅ Manual trigger option for rollbacks

### Environment Configurations

Three environment templates are provided:

| Environment | File | Cache | Logging | Use Case |
|------------|------|-------|---------|----------|
| Development | `.env.local.example` | Disabled | Debug | Local development |
| Staging | `.env.staging.example` | 60s | Debug | Pre-production testing |
| Production | `.env.production.example` | 300s | Info | Production deployment |

**Key Configuration Areas:**
- Application settings (environment, URLs)
- API configuration (endpoint, timeout, retry)
- Authentication (JWT secrets, session duration)
- Caching strategy (ISR revalidation)
- Feature flags (impact score, PDF generation)
- Monitoring (Sentry DSN, Google Tag Manager)
- Internationalization (supported locales)

### Monitoring & Health Checks

**Application Health:**
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-27T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Container Health:**
- Automatic health checks every 30 seconds
- 3 retries before marking unhealthy
- Automatic container restart on failure
- 40 second grace period on startup

**Error Tracking:**
- Sentry integration for error monitoring
- Client and server-side error capture
- Performance transaction tracking
- Core Web Vitals monitoring
- Release tracking for regression detection

**Logging:**
```bash
# View all logs
docker logs ps-foodbook-app

# Follow logs in real-time
docker logs -f ps-foodbook-app

# View last 100 lines
docker logs --tail 100 ps-foodbook-app

# View logs since time
docker logs --since 30m ps-foodbook-app

# Count errors
docker logs ps-foodbook-app | grep ERROR | wc -l
```

See [MONITORING_GUIDE.md](./MONITORING_GUIDE.md) for comprehensive monitoring setup.

### Rollback Procedure

If a deployment causes issues:

```bash
# 1. Identify last good version
docker images ps-foodbook-app

# 2. Update docker-compose.yml with previous version
# image: ps-foodbook-app:v1.0.0

# 3. Restart with previous version
docker-compose down
docker-compose up -d

# 4. Verify health
curl http://localhost:3000/api/health
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Health Check Response | < 100ms | ~50ms |
| Home Page Load (P95) | < 2s | ~1.2s |
| Product Search (P95) | < 1.5s | ~800ms |
| Product Detail (P95) | < 2s | ~1.0s |
| Test Coverage | > 80% | 85% |
| Bundle Size | < 500KB | ~420KB |

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

### Deployment Architecture

```
GitHub Repository
      ↓
GitHub Actions (CI/CD)
      ↓
Docker Build → Container Registry
      ↓
Production Server
      ↓
Docker Container (Port 3000)
      ↓
┌─────────┬─────────┬──────────┐
│ Sentry  │ Logging │  Health  │
│Monitoring│ System │ Checks   │
└─────────┴─────────┴──────────┘
```

**Container Features:**
- Multi-stage Docker build (~200MB)
- Health checks every 30 seconds
- Automatic restart on failure
- Log rotation (10MB × 3 files)
- Non-root user execution

**Monitoring Stack:**
- Sentry: Error tracking and performance monitoring
- Docker Logs: Application and system logs
- Health Endpoint: `/api/health` with automatic checks
- Alerts: Configured for critical errors and downtime

## Production Readiness

The application is fully production-ready with:

### ✅ Infrastructure
- Docker containerization with multi-stage builds
- Health checks with automatic restart
- Standalone Next.js output for minimal bundle
- Resource-optimized containers (~200MB)

### ✅ CI/CD Automation
- Automated testing on all PRs and pushes
- TypeScript, linting, unit, and E2E tests
- Automated deployment on master merge
- Docker image builds with Git SHA tags

### ✅ Monitoring & Observability
- Sentry error tracking (client & server)
- Structured logging system
- Health endpoint monitoring
- Performance metrics (Web Vitals)
- Alert configuration for critical issues

### ✅ Security (Enterprise-Grade)
- **XSS Protection**: Triple-layer defense (DOMPurify + CSP + X-XSS-Protection)
- **Input Validation**: Runtime Zod validation on all API routes
- **Token Security**: Authorization headers (no tokens in URLs)
- **Rate Limiting**: Per-endpoint protection (30-100 req/min)
- **CORS Policy**: Explicit cross-origin configuration
- **Password Hashing**: PBKDF2 with 100,000 iterations (OWASP compliant)
- **Error Boundaries**: Graceful React error handling
- **Content Security Policy**: Strict CSP with resource whitelisting
- **Security Headers**: Comprehensive headers (X-Frame-Options, CSP, Permissions-Policy)
- **JWT Authentication**: Secure token management with secrets
- **Non-root Containers**: Docker security best practices
- **9 Security Issues Fixed**: 1 Critical, 3 High, 5 Medium (86% risk reduction)

### ✅ Performance
- ISR caching (300s revalidation)
- Code splitting and lazy loading
- Image optimization (AVIF, WebP)
- Bundle size optimization (~420KB)
- TanStack Query caching (5min stale time)

### ✅ Quality Assurance
- 85% test coverage (target: 80%)
- 118 unit tests passing
- 5 integration test flows
- 14 E2E scenarios across browsers
- WCAG 2.1 AA accessibility compliance
- Cross-browser compatibility verified

### ✅ Documentation
- Complete operations runbook
- Step-by-step deployment guide
- Security best practices
- Monitoring and troubleshooting guide
- Team handover materials
- API documentation

## Documentation

### Operations Documentation

Complete guides for operating and maintaining the application:

- 📖 [**RUNBOOK.md**](./RUNBOOK.md) - Day-to-day operations and maintenance procedures
  - Emergency procedures and incident response
  - Common operations (deployment, rollback, scaling)
  - Maintenance tasks and schedules
  - Performance optimization

- 🚀 [**DEPLOYMENT_GUIDE.md**](./DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
  - Prerequisites and environment setup
  - Docker deployment procedures
  - CI/CD pipeline usage
  - Rollback procedures and verification

- 🔒 [**SECURITY.md**](./SECURITY.md) - Security best practices and checklist
  - Authentication and authorization
  - Data protection and encryption
  - API security and rate limiting
  - Environment security
  - Incident response procedures

- 🛡️ [**SECURITY_IMPROVEMENTS.md**](./SECURITY_IMPROVEMENTS.md) - Detailed security implementation log
  - Complete audit and remediation (9 issues fixed)
  - Phase 1: Critical vulnerabilities (XSS, validation, tokens)
  - Phase 2: High priority (CORS, hashing, rate limiting)
  - Phase 3: Resilience (Error Boundaries, CSP)
  - Technical implementation details
  - Before/after security posture comparison

- 📋 [**SECURITY_SUMMARY.md**](./SECURITY_SUMMARY.md) - Executive security summary
  - Security metrics and risk reduction (86%)
  - Defense-in-depth layers
  - Compliance (OWASP, RFC standards)
  - Build verification and testing results

- 📊 [**MONITORING_GUIDE.md**](./MONITORING_GUIDE.md) - Monitoring and observability setup
  - Health checks configuration
  - Sentry error tracking
  - Application logging
  - Performance monitoring
  - Alert configuration
  - Troubleshooting guide

### Technical Documentation

- 🔧 [**API_DOCUMENTATION.md**](./API_DOCUMENTATION.md) - Internal API routes reference
  - Health check endpoint (`/api/health`)
  - Logging endpoint (`/api/log`)
  - Request/response formats
  - Error handling

- 👥 [**HANDOVER.md**](./HANDOVER.md) - Team handover and training materials
  - Project overview and responsibilities
  - Codebase structure and architecture
  - Development workflow
  - Common tasks and examples
  - Troubleshooting guide
  - Training materials and resources

- 🤖 [**CLAUDE.md**](./CLAUDE.md) - AI assistant instructions
  - Project structure and conventions
  - Development commands
  - Architecture decisions
  - Testing guidelines

### Project Phase Summaries

Detailed summaries of each development phase:

- ✨ [**FASE_6_SUMMARY.md**](./FASE_6_SUMMARY.md) - UI/UX Polish Phase
  - Accessibility improvements (WCAG 2.1 AA compliance)
  - Performance optimization
  - Error handling enhancements
  - Loading states and skeleton screens

- 🧪 [**FASE_7_TESTING_SUMMARY.md**](./FASE_7_TESTING_SUMMARY.md) - Testing & QA Phase
  - Test infrastructure setup
  - Unit tests (118 tests, 85% coverage)
  - Integration tests (5 flows)
  - E2E tests (14 scenarios)
  - Performance and accessibility testing

- 🚢 [**FASE_8_DEPLOYMENT_SUMMARY.md**](./FASE_8_DEPLOYMENT_SUMMARY.md) - Deployment & Handover Phase
  - Docker infrastructure
  - CI/CD pipelines
  - Monitoring setup
  - Complete documentation suite
  - Production readiness checklist

### Quick Reference

**Health Check:**
```bash
GET /api/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-27T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Container Logs:**
```bash
docker logs -f ps-foodbook-app
```

**Resource Usage:**
```bash
docker stats ps-foodbook-app
```

**Emergency Restart:**
```bash
docker-compose restart app
```

For detailed information on any topic, refer to the specific documentation file above.

## License

Private - PS in Foodservice
