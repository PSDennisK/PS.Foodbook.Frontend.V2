# Project Handover Documentation

This document provides comprehensive handover information for the PS Foodbook Frontend project, including team training materials, knowledge transfer, and ongoing maintenance procedures.

## Table of Contents

- [Project Overview](#project-overview)
- [Team Responsibilities](#team-responsibilities)
- [Codebase Structure](#codebase-structure)
- [Development Workflow](#development-workflow)
- [Deployment Process](#deployment-process)
- [Common Tasks](#common-tasks)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Knowledge Resources](#knowledge-resources)
- [Contact Information](#contact-information)

## Project Overview

**Project Name:** PS Foodbook Frontend
**Version:** 1.0.0
**Technology:** Next.js 15, React 19, TypeScript 5.7
**Purpose:** Product catalog and search platform for PS in Foodservice

### Key Features

- Multi-language support (Dutch, English, German, French)
- Advanced product search with filtering
- Digital catalog management
- Product sheet generation with PDF export
- Accessibility compliant (WCAG 2.1 AA)
- Mobile-responsive design

### Critical Business Functions

1. **Product Search**: Primary user entry point, must maintain 99.9% uptime
2. **Product Details**: Essential for product information display
3. **PDF Generation**: Important for sales and customer support
4. **Digital Catalogs**: Key marketing feature for campaigns

## Team Responsibilities

### Frontend Development Team

**Responsibilities:**
- Feature development and enhancements
- Bug fixes and maintenance
- Code reviews and quality assurance
- Unit and integration testing
- Performance optimization

**Key Skills Required:**
- Next.js 15 and React 19
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Testing (Vitest, Playwright)

### DevOps Team

**Responsibilities:**
- CI/CD pipeline maintenance
- Docker container management
- Environment configuration
- Deployment coordination
- Infrastructure monitoring

**Key Skills Required:**
- Docker and container orchestration
- GitHub Actions
- Environment management
- Application monitoring

### Support Team

**Responsibilities:**
- First-line incident response
- Log analysis for user issues
- Coordination with development team
- Monitoring dashboard review

**Key Skills Required:**
- Basic log analysis
- Sentry error tracking
- Docker basics (viewing logs, restarting containers)

## Codebase Structure

### High-Level Architecture

```
Frontend Application (Next.js)
        ↓
    API Layer (src/lib/api/)
        ↓
    Backend API (PS Foodbook API)
        ↓
    Database (PostgreSQL)
```

### Directory Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Locale-based routing
│   └── api/               # API routes (health, logging)
├── components/            # React components
│   ├── layout/           # Header, Footer, Navigation
│   ├── product/          # Product-related components
│   ├── search/           # Search and filtering
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   └── providers/        # Context providers
├── lib/
│   ├── api/              # API client layer
│   └── utils/            # Utility functions
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
├── i18n/                 # Internationalization config
└── config/               # Application configuration

messages/                 # Translation files (nl, en, de, fr)
tests/                    # Unit, integration, and E2E tests
```

### Critical Files

| File | Purpose | Importance |
|------|---------|------------|
| `src/app/[locale]/layout.tsx` | Root layout with providers | Critical |
| `src/lib/api/base.ts` | API client with retry logic | Critical |
| `src/stores/filter.store.ts` | Search state management | High |
| `middleware.ts` | Locale routing middleware | High |
| `next.config.ts` | Next.js configuration | High |
| `docker-compose.yml` | Container orchestration | High |

### Technology Stack

**Framework & Core:**
- Next.js 15 (App Router, Standalone output)
- React 19 with Server Components
- TypeScript 5.7 (strict mode)

**UI & Styling:**
- Tailwind CSS 4 with custom PS brand colors
- shadcn/ui components (Radix UI primitives)
- Lucide React icons

**State Management:**
- TanStack Query for server state
- Zustand for client state

**Testing:**
- Vitest for unit/integration tests
- Playwright for E2E tests
- 80% code coverage requirement

**Monitoring:**
- Sentry for error tracking
- Docker health checks
- Custom logging to `/api/log`

## Development Workflow

### Setting Up Development Environment

1. **Clone Repository:**
```bash
git clone <repository-url>
cd PS.Foodbook.Frontend.v2
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environment:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. **Start Development Server:**
```bash
npm run dev
```

Application runs at http://localhost:3000

### Branch Strategy

**Branches:**
- `master` - Production branch (protected)
- `staging` - Staging environment
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes

**Workflow:**
1. Create feature branch from `master`
2. Develop and test locally
3. Create Pull Request to `master`
4. Code review by team member
5. CI pipeline runs automatically
6. Merge after approval and passing tests
7. Auto-deploy to production (master branch)

### Code Review Checklist

**Reviewer should verify:**
- [ ] Code follows TypeScript strict mode
- [ ] All tests pass (unit, integration, E2E)
- [ ] Type imports used correctly (`import type`)
- [ ] No console.log statements (use logger utility)
- [ ] Accessibility attributes present (ARIA labels)
- [ ] Translations added for new text
- [ ] Error handling implemented
- [ ] Performance impact considered

### Testing Requirements

**Before Committing:**
```bash
npm run type-check      # TypeScript errors
npm run lint            # Linting issues
npm test -- --run       # Unit tests
```

**Before Merging:**
```bash
npm run test:e2e        # E2E tests
npm test -- --coverage  # Coverage report (80% minimum)
```

## Deployment Process

### Automatic Deployment

Deployments to production are automatic when code is merged to `master`:

1. **Merge to master** → Triggers deploy workflow
2. **CI Tests** → Runs full test suite
3. **Build Docker Image** → Creates production image
4. **Push to Registry** → Uploads image (configure in workflow)
5. **Deploy** → Updates production containers
6. **Health Check** → Verifies deployment

**Monitoring Deployment:**
- Watch GitHub Actions workflow progress
- Check Sentry for new errors after deployment
- Monitor `/api/health` endpoint
- Review Docker logs for issues

### Manual Deployment

For emergency deployments or rollbacks:

```bash
# Build and tag image
docker build -t ps-foodbook-app:v1.0.0 .

# Push to registry
docker push ps-foodbook-app:v1.0.0

# SSH to production server
ssh production-server

# Pull new image
docker pull ps-foodbook-app:v1.0.0

# Update docker-compose with new image tag
docker-compose pull
docker-compose up -d

# Verify health
curl http://localhost:3000/api/health
```

### Rollback Procedure

If a deployment causes issues:

1. **Identify Last Good Version:**
```bash
docker images ps-foodbook-app
```

2. **Update docker-compose.yml:**
```yaml
services:
  app:
    image: ps-foodbook-app:v0.9.9  # Previous version
```

3. **Restart Container:**
```bash
docker-compose up -d
```

4. **Verify:**
```bash
curl http://localhost:3000/api/health
docker logs -f ps-foodbook-app
```

5. **Notify Team:**
- Post in #deployments Slack channel
- Update incident in Sentry
- Create rollback report

### Environment Configuration

**Production:** `.env.production`
```bash
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://foodbook.psfoodservice.com
FOODBOOK_API_URL=https://api.psfoodservice.com
CACHE_REVALIDATE=300
LOG_LEVEL=info
```

**Staging:** `.env.staging`
```bash
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging-foodbook.psfoodservice.com
FOODBOOK_API_URL=https://staging-api.psfoodservice.com
CACHE_REVALIDATE=60
LOG_LEVEL=debug
```

## Common Tasks

### 1. Adding a New Feature

**Steps:**
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement feature with tests
3. Add translations to all locale files (messages/*.json)
4. Update types if API changes (src/types/)
5. Run full test suite
6. Create PR with description and screenshots
7. Address review comments
8. Merge after approval

**Example: Adding a new filter type**
```typescript
// 1. Add enum to src/types/enums.ts
export enum FilterType {
  BRAND = 'brand',
  CATEGORY = 'category',
  NEW_FILTER = 'newfilter',  // Add new type
}

// 2. Update filter schema in src/types/filter.ts
export const FilterOptionSchema = z.object({
  // ... existing fields
});

// 3. Add component in src/components/search/
export function NewFilter() {
  // Component implementation
}

// 4. Add translations in messages/nl.json
{
  "search": {
    "filters": {
      "newfilter": "Nieuwe Filter"
    }
  }
}

// 5. Write tests in tests/unit/components/search/
describe('NewFilter', () => {
  it('renders correctly', () => {
    // Test implementation
  });
});
```

### 2. Fixing a Bug

**Steps:**
1. Reproduce bug locally
2. Check Sentry for error details
3. Create bugfix branch: `git checkout -b bugfix/issue-description`
4. Write failing test that reproduces bug
5. Implement fix
6. Verify test now passes
7. Test manually in browser
8. Create PR with issue reference
9. Deploy to staging first for verification

**Bug Report Template:**
```markdown
## Bug Description
[Describe the issue]

## Steps to Reproduce
1. Go to [page]
2. Click on [element]
3. Observe [issue]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser: Chrome 120
- Device: Desktop
- Locale: nl

## Sentry Link
[Link to Sentry issue]

## Fix Verification
- [ ] Test passes
- [ ] Manual testing completed
- [ ] Verified on staging
```

### 3. Updating Dependencies

**Regular Updates (Monthly):**
```bash
# Check for updates
npm outdated

# Update non-major versions
npm update

# Test thoroughly
npm test
npm run test:e2e

# Build and verify
npm run build
```

**Major Updates:**
```bash
# Update one package at a time
npm install react@latest react-dom@latest

# Check for breaking changes in changelog
# Update code as needed
# Run full test suite
# Test in staging environment
```

**Security Updates (Immediate):**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Manual fix for high/critical
npm audit fix --force  # Use with caution

# Test and deploy ASAP
```

### 4. Adding a New Locale

**Steps:**
1. Add locale to `src/i18n/routing.ts`:
```typescript
export const routing = {
  locales: ['nl', 'en', 'de', 'fr', 'es'],  // Add 'es'
  defaultLocale: 'nl'
};
```

2. Create translation file `messages/es.json` (copy from nl.json)
3. Translate all strings
4. Update locale switcher in header component
5. Test all pages in new locale
6. Update documentation

### 5. Optimizing Performance

**Common Optimization Tasks:**

1. **Analyze Bundle Size:**
```bash
npm run build:analyze
```

2. **Optimize Images:**
- Use next/image component
- Serve WebP/AVIF formats
- Set appropriate sizes

3. **Reduce JavaScript:**
- Use dynamic imports for heavy components
- Implement route-based code splitting
- Remove unused dependencies

4. **Improve Caching:**
- Increase CACHE_REVALIDATE for stable content
- Use stale-while-revalidate strategy
- Implement ISR for product pages

## Troubleshooting Guide

### Common Issues

#### Issue: Application Won't Start

**Symptoms:**
- Container exits immediately
- Port 3000 not accessible
- "Cannot find module" errors

**Solutions:**
```bash
# Check logs
docker logs ps-foodbook-app

# Common causes:
# 1. Missing environment variables
# 2. Port already in use
# 3. Dependencies not installed

# Fix: Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up
```

#### Issue: API Calls Failing

**Symptoms:**
- 500 errors in Sentry
- "Failed to fetch" errors
- Timeout errors

**Solutions:**
```bash
# Check API connectivity
curl https://api.psfoodservice.com/health

# Verify environment variables
docker exec ps-foodbook-app env | grep FOODBOOK_API

# Check API logs in Sentry
# Look for network errors, timeouts

# Common fixes:
# - Verify FOODBOOK_API_URL is correct
# - Check firewall rules
# - Increase FOODBOOK_API_TIMEOUT
# - Verify JWT_SECRET matches backend
```

#### Issue: Memory Leaks

**Symptoms:**
- Container restarts
- Slow performance over time
- High memory usage

**Solutions:**
```bash
# Monitor memory usage
docker stats ps-foodbook-app

# Check heap snapshots in Sentry
# Look for increasing memory over time

# Common causes:
# - TanStack Query cache too large
# - Event listeners not cleaned up
# - Large images not optimized

# Fix: Restart container as temporary measure
docker-compose restart app

# Permanent fix: Identify leak and patch
```

#### Issue: Translation Missing

**Symptoms:**
- English text showing in other locales
- Console warnings about missing keys

**Solutions:**
```bash
# Check translation file exists
ls messages/

# Verify key exists in all locales
grep -r "search.filters.brand" messages/

# Add missing translations
# Edit messages/[locale].json

# Restart dev server
npm run dev
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# In .env.local or .env.production
LOG_LEVEL=debug
NEXT_PUBLIC_LOG_LEVEL=debug

# Restart application
docker-compose restart app

# View debug logs
docker logs -f ps-foodbook-app
```

**Remember:** Disable debug mode in production after troubleshooting.

## Knowledge Resources

### Documentation

Internal documentation in repository:
- [README.md](./README.md) - Getting started guide
- [RUNBOOK.md](./RUNBOOK.md) - Operations procedures
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Internal API reference
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment procedures
- [SECURITY.md](./SECURITY.md) - Security best practices
- [MONITORING_GUIDE.md](./MONITORING_GUIDE.md) - Monitoring and observability
- [CLAUDE.md](./CLAUDE.md) - AI assistant instructions

### External Resources

**Next.js:**
- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [Next.js GitHub](https://github.com/vercel/next.js)

**React:**
- [React Documentation](https://react.dev)
- [React Server Components](https://react.dev/reference/rsc/server-components)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

**TanStack Query:**
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query in Next.js](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)

**Testing:**
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

**Tailwind CSS:**
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

**Monitoring:**
- [Sentry Documentation](https://docs.sentry.io)
- [Docker Logging](https://docs.docker.com/config/containers/logging/)

### Training Materials

**For New Developers:**
1. Week 1: Setup environment, understand codebase structure
2. Week 2: Build simple feature (e.g., add new filter)
3. Week 3: Write tests, fix bugs
4. Week 4: Deploy to staging, learn monitoring

**For Operations Team:**
1. Day 1: Docker basics, container management
2. Day 2: Deployment process, rollback procedures
3. Day 3: Monitoring tools (Sentry, logs)
4. Day 4: Common issues and troubleshooting

**For Support Team:**
1. Overview: Application features and user flows
2. Monitoring: How to check Sentry for errors
3. Logs: Basic log analysis and Docker commands
4. Escalation: When to involve development team

### Code Examples

**Making API Calls:**
```typescript
// src/lib/api/product.service.ts
import { apiClient } from './base';

export async function searchProducts(filters: SearchFilters) {
  const result = await apiClient.get<SearchResults>('/api/search', {
    params: filters
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
```

**Using TanStack Query:**
```typescript
// In component
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/lib/api/product.service';

export function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => searchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return <div>{/* Render products */}</div>;
}
```

**Using Zustand Store:**
```typescript
// src/stores/filter.store.ts
import { create } from 'zustand';

export const useFilterStore = create<FilterStore>((set) => ({
  keyword: '',
  setKeyword: (keyword) => set({ keyword }),
  clearFilters: () => set({ keyword: '', brands: [], categories: [] })
}));

// In component
import { useFilterStore } from '@/stores/filter.store';

export function SearchBar() {
  const { keyword, setKeyword } = useFilterStore();

  return (
    <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
    />
  );
}
```

## Contact Information

### Team Contacts

**Development Team:**
- Lead Developer: [Name] - [email] - Slack: @username
- Frontend Developer: [Name] - [email] - Slack: @username
- Frontend Developer: [Name] - [email] - Slack: @username

**DevOps Team:**
- DevOps Engineer: [Name] - [email] - Slack: @username
- Infrastructure Lead: [Name] - [email] - Slack: @username

**Support Team:**
- Support Lead: [Name] - [email] - Slack: @username
- Support Engineer: [Name] - [email] - Slack: @username

### Communication Channels

**Slack Channels:**
- `#foodbook-dev` - Development discussions
- `#foodbook-support` - User issues and support
- `#alerts-critical` - Production alerts
- `#alerts-errors` - Error notifications
- `#deployments` - Deployment notifications

**Email Lists:**
- `dev-team@psfoodservice.com` - Development team
- `ops-team@psfoodservice.com` - Operations team
- `support-team@psfoodservice.com` - Support team

### Escalation Process

**Level 1: Support Team**
- First response to user issues
- Basic troubleshooting
- Log analysis

**Level 2: On-Call Developer**
- Complex bugs requiring code analysis
- Performance issues
- Deployment problems

**Level 3: Tech Lead**
- Architectural decisions
- Major incidents
- Critical production issues

**Escalation Criteria:**
- Severity 1 (Critical): Immediate escalation to on-call developer
- Severity 2 (High): Escalate if not resolved within 2 hours
- Severity 3 (Medium): Escalate if not resolved within 1 business day
- Severity 4 (Low): Handle via normal development workflow

### Emergency Contacts

**Production Down:**
1. Check #alerts-critical Slack channel
2. Page on-call developer via PagerDuty
3. Notify tech lead
4. Post in #foodbook-dev

**Security Incident:**
1. Immediately notify security team
2. Do not discuss publicly
3. Follow security incident response plan
4. Document all actions

## Handover Checklist

### For Outgoing Team Member

- [ ] Document ongoing work and tasks
- [ ] Transfer repository access
- [ ] Share credentials (use password manager)
- [ ] Introduce to team members
- [ ] Review critical features and codebase sections
- [ ] Explain recent changes and decisions
- [ ] Share tribal knowledge and gotchas
- [ ] Provide contact information for questions

### For Incoming Team Member

- [ ] Receive repository access
- [ ] Setup development environment
- [ ] Review all documentation
- [ ] Join Slack channels
- [ ] Setup monitoring accounts (Sentry, etc.)
- [ ] Complete training materials
- [ ] Shadow deployment process
- [ ] Fix first bug or build small feature
- [ ] Ask questions and clarify unknowns

### For Team Lead

- [ ] Ensure all documentation is up to date
- [ ] Verify access credentials are managed securely
- [ ] Schedule knowledge transfer sessions
- [ ] Arrange pair programming sessions
- [ ] Monitor progress during transition period
- [ ] Collect feedback on handover process
- [ ] Update handover documentation based on feedback

## Maintenance Schedule

### Daily Tasks
- Monitor Sentry for new errors
- Review health check status
- Check for security alerts

### Weekly Tasks
- Review and triage Sentry issues
- Update dependencies (patch versions)
- Check monitoring dashboards
- Review performance metrics

### Monthly Tasks
- Update minor versions of dependencies
- Review and optimize bundle size
- Audit error handling coverage
- Update documentation
- Security audit

### Quarterly Tasks
- Major dependency updates
- Performance optimization sprint
- Review and update monitoring alerts
- Team training and knowledge sharing
- Architecture review

---

**Document Version:** 1.0.0
**Last Updated:** 2024-01-27
**Next Review:** 2024-04-27

For questions or updates to this document, contact the development team lead or post in #foodbook-dev Slack channel.
