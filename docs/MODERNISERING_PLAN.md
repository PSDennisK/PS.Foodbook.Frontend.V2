# ANALYSE & MODERNISERINGS PLAN - PS.Foodbook.Frontend

**Versie:** 2.0  
**Datum:** 2026-01-26  
**Project:** Modernisering van Next.js 14 naar Next.js 15  
**Status:** Planning & Design

---

## EXECUTIVE SUMMARY

Na analyse van de huidige Next.js 14 applicatie stel ik voor om de **Foodbook applicatie** te moderniseren naar Next.js 15 met moderne tech stack, terwijl het **Website gedeelte** volledig naar WordPress verhuist.

**Belangrijkste bevindingen:**
- Huidige dual-app architectuur is ideaal voor scheiding
- 1,425 regels `server.ts` moet worden opgesplitst
- Middleware (10,772 regels) bevat te veel business logic
- Veel legacy patterns en code duplicatie
- WordPress integratie kan volledig worden verwijderd

**Tijdlijn:** 12-14 weken  
**Resources:** 1 Senior Frontend Developer (full-time)

---

## INHOUDSOPGAVE

1. [Architectuur Analyse](#1-architectuur-analyse)
2. [Nieuwe Architectuur Ontwerp](#2-nieuwe-architectuur-ontwerp)
3. [Feature Migratie Roadmap](#3-feature-migratie-roadmap)
4. [Implementatie Fases](#4-implementatie-fases)
5. [WordPress Scheiding](#5-wordpress-scheiding)
6. [Technische Specificaties](#6-technische-specificaties)
7. [Migratie Strategie](#7-migratie-strategie)
8. [Risico's & Mitigatie](#8-risicos--mitigatie)
9. [Success Metrics](#9-success-metrics)
10. [Timeline & Resources](#10-timeline--resources)

---

## 1. ARCHITECTUUR ANALYSE

### 1.1 Wat blijft (Next.js App)

**FOODBOOK APPLICATIE** - Pure applicatie functionaliteit:

✅ **Product Catalogus**
- Product zoeken en filteren
- Product detail pagina's
- Merk overzichtspagina's
- EAN/GTIN lookup
- Autocomplete zoekfunctie

✅ **Digitale Catalogi**
- Beveiligde catalogi met GUID tokens
- Custom theming per catalogus
- Product browsing binnen catalogus

✅ **Productsheets**
- Externe toegang via signed permalinks
- PDF generatie
- Delen functionaliteit

✅ **Data Features**
- Allergenen informatie
- Voedingswaarden
- Ingrediënten
- Logistieke details
- CO2 impact scores
- Keurmerken

### 1.2 Wat verdwijnt (naar WordPress)

❌ **WEBSITE APPLICATIE** - Alle marketing content:

- Homepage
- Blog (posts & overzicht)
- Content pagina's (about, contact, team, FAQ)
- Partner overzichten
- Prijzen pagina's
- BigMarker conferenties/agenda
- Contact formulieren
- Team pages
- Doelgroepen pagina's

**Geschatte impact:**
- ~40% van componenten verwijderen
- ~60% van routes verwijderen
- WordPress API calls volledig verwijderen
- Templates folder volledig verwijderen

### 1.3 Behouden Functionaliteit

**Authenticatie:**
- JWT token system (Jose)
- HTTP-only cookies
- Environment-specific cookie names
- Token validation API

**Digital Catalog Security:**
- GUID-based routing
- Security token propagation
- Custom theming system

**Permalink System:**
- HMAC-SHA256 signatures
- Expiry timestamps
- Middleware verification

**Multi-language:**
- 4 talen (nl, en, de, fr)
- Locale routing
- Translation helpers

---

## 2. NIEUWE ARCHITECTUUR ONTWERP

### 2.1 Project Structuur (Next.js 15)

```
ps-foodbook-app/                    # Nieuwe naam
├── src/
│   ├── app/                        # Next.js 15 App Router
│   │   ├── [locale]/
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── page.tsx            # Product search homepage
│   │   │   │
│   │   │   ├── product/
│   │   │   │   ├── page.tsx        # Search
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Product detail
│   │   │   │
│   │   │   ├── brand/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Brand detail
│   │   │   │
│   │   │   ├── digitalcatalog/
│   │   │   │   └── [guid]/
│   │   │   │       ├── layout.tsx  # Custom theme layout
│   │   │   │       ├── page.tsx    # Catalog overview
│   │   │   │       ├── product/[id]/
│   │   │   │       └── brand/[id]/
│   │   │   │
│   │   │   └── productsheet/       # Productsheet
│   │   │       └── [id]/
│   │   │           ├── page.tsx    # Sheet view
│   │   │           └── pdf/
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── product/
│   │       │   ├── [id]/
│   │       │   ├── search/
│   │       │   ├── autocomplete/
│   │       │   └── ean/
│   │       ├── brand/
│   │       ├── digitalcatalog/
│   │       ├── productsheet/
│   │       ├── auth/
│   │       └── health/
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── product/
│   │   ├── catalog/
│   │   ├── search/
│   │   └── layout/
│   │
│   ├── lib/
│   │   ├── api/                    # API clients
│   │   │   ├── product.service.ts
│   │   │   ├── brand.service.ts
│   │   │   ├── catalog.service.ts
│   │   │   ├── sheet.service.ts
│   │   │   └── auth.service.ts
│   │   ├── auth/                   # Authentication
│   │   ├── cache/                  # Cache utilities
│   │   └── utils/                  # Helpers
│   │
│   ├── hooks/
│   ├── stores/                     # Zustand (of Jotai)
│   ├── types/
│   └── config/
│
├── public/
├── tests/                          # Vitest + Testing Library
└── package.json
```

### 2.2 Tech Stack

**Core:**
- Next.js 15.1.x (App Router, React 19)
- TypeScript 5.7+ (strict mode)
- React Server Components (maximaal gebruik)

**UI & Styling:**
- shadcn/ui (Radix UI primitives)
- Tailwind CSS 4.x
- tailwind-merge + clsx
- Lucide React icons

**State Management:**
- Zustand 5.x (voor client state)
- React Context (voor theme/locale)
- TanStack Query v5 (voor server state & caching)

**Forms & Validation:**
- React Hook Form v7
- Zod (type-safe validation)

**Data Fetching:**
- Native fetch met Next.js 15 features
- TanStack Query voor client-side
- Suspense boundaries

**Authentication:**
- Jose (JWT)
- HTTP-only cookies
- Middleware-based auth

**i18n:**
- next-intl (vervangt next-i18next)
- Type-safe translations
- Server & Client support

**Testing:**
- Vitest (unit tests)
- Testing Library (component tests)
- Playwright (E2E tests)

**Developer Experience:**
- Biome (ESLint + Prettier vervanger)
- Husky + lint-staged
- TypeScript strict mode
- Path aliases (@/)

### 2.3 API Client Herstructurering

**Opsplitsing van monolithische `server.ts` (1,425 regels):**

```typescript
// lib/api/product.service.ts
export const productService = {
  getById: (id: string) => {},
  getByEan: (gtin: string) => {},
  search: (params: SearchParams) => {},
  autocomplete: (keyword: string) => {},
};

// lib/api/brand.service.ts
export const brandService = {
  getById: (id: string) => {},
  getAll: () => {},
  getFilters: () => {},
};

// lib/api/catalog.service.ts
export const catalogService = {
  getTheme: (guid: string) => {},
  getGuid: (token: string, abbr: string) => {},
  getLogo: (fileName: string) => {},
  getBanner: (fileName: string) => {},
};

// lib/api/sheet.service.ts
export const sheetService = {
  getById: (id: string) => {},
  generatePdf: (id: string) => {},
  getImpactScore: (mongoId: string) => {},
};

// lib/api/auth.service.ts
export const authService = {
  validateToken: (token: string) => {},
  refreshToken: () => {},
};
```

**Voordelen:**
- Modulair en testbaar
- Type-safe met Zod schemas
- Betere code organizatie
- Eenvoudiger onderhoud

### 2.4 Routes Overzicht

**Frontend Routes:**
```
/                                    → Product search homepage
/product                            → Product search
/product/[id]                       → Product detail
/brand/[id]                         → Brand detail
/digitalcatalog/[guid]              → Digital catalog home
/digitalcatalog/[guid]/product/[id] → Product in catalog
/digitalcatalog/[guid]/brand/[id]   → Brand in catalog
/productsheet/[id]                  → Productsheet view
/productsheet/[id]/pdf              → PDF download
```

**API Routes:**
```
/api/product/[id]                   → Get product
/api/product/search                 → Search products
/api/product/autocomplete           → Autocomplete
/api/product/ean/[gtin]             → EAN lookup
/api/brand/[id]                     → Get brand
/api/digitalcatalog/theme/[guid]    → Catalog theme
/api/digitalcatalog/guid            → Token → GUID conversion
/api/productsheet/[id]              → Get productsheet
/api/auth/validate                  → Validate JWT
/api/health                         → Health check
```

---

## 3. FEATURE MIGRATIE ROADMAP

### 3.1 Features Matrix

| Feature | Status | Complexity | Dependencies | Notes |
|---------|--------|------------|--------------|-------|
| **CORE FEATURES** |
| Product Search & Filters | Migrate | High | Filter system, API | Core functionaliteit |
| Product Detail Pages | Migrate | Medium | API, Types | Simplificeren structuur |
| Brand Pages | Migrate | Low | API | Eenvoudig |
| Autocomplete | Migrate | Medium | API, Debouncing | TanStack Query |
| **CATALOG FEATURES** |
| Digital Catalogs | Migrate | High | Auth, Theming | Custom theming behouden |
| Catalog Theming | Migrate | Medium | CSS vars | Vereenvoudigen |
| Catalog Navigation | Migrate | Medium | Layout | Nieuwe layout |
| **SHEET FEATURES** |
| Productsheets | Migrate | High | Auth, Permalinks | Security kritisch |
| Permalink System | Migrate | High | Crypto, Middleware | Behouden zoals is |
| PDF Generation | Migrate | Medium | API | Mogelijk verbeteren |
| **AUTH & SECURITY** |
| JWT Authentication | Migrate | Medium | Jose, Cookies | Middleware refactor |
| Token Validation | Migrate | Low | API route | Moderniseren |
| Security Headers | Migrate | Low | Middleware | Next.js 15 headers |
| **INTERNATIONALIZATION** |
| i18n System | Redesign | Medium | next-intl | next-i18next → next-intl |
| Locale Routing | Migrate | Low | Middleware | Simplificeren |
| Translation Helper | Migrate | Low | Utils | Type-safe maken |
| **UI COMPONENTS** |
| Product Components | Refactor | High | 50+ components | shadcn/ui patterns |
| Layout Components | Refactor | Medium | Headers, Footers | Minimalistisch |
| Filter Components | Refactor | High | Search system | Modern UI |
| **DATA & STATE** |
| Zustand Stores | Migrate | Medium | 3 stores | Mogelijk Jotai |
| Filter State | Refactor | High | URL params | Shareable filters |
| Auth State | Migrate | Medium | Middleware | Server-first |
| **REMOVED FEATURES** |
| WordPress Integration | Remove | - | 10+ API calls | Volledig verwijderen |
| Blog Components | Remove | - | 4 components | Naar WordPress |
| Templates | Remove | - | 14 templates | Naar WordPress |
| Contact Forms | Remove | - | CF7 integration | Naar WordPress |
| BigMarker Calendar | Remove | - | API integration | Naar WordPress |

### 3.2 Component Vereenvoudiging

**Product Components (50+ → ~20)**

**Behouden:**
- ProductCard (search results)
- ProductDetail (main container)
- ProductImage
- ProductAllergens
- ProductNutrients
- ProductIngredients
- ProductLogistics
- ProductDocuments
- ProductImpactScore
- ProductSheet

**Verwijderen/Samenvoegen:**
- Alle "Small" variants → Responsive design
- Meerdere allergenen components → 1 component
- Fragmentatie in sub-components → Logische grouping

**Layout Components (25+ → ~8)**

**Behouden:**
- AppHeader (vereenvoudigd)
- AppFooter (minimaal)
- CatalogHeader (custom theme)
- LanguageSwitcher
- Navigation
- Breadcrumbs (alleen in catalogs)

**Verwijderen:**
- Alle WordPress-specifieke layouts
- PageHeader/HeaderSmall duplication
- FooterBlock (WordPress ACF)

---

## 4. IMPLEMENTATIE FASES

### **FASE 0: VOORBEREIDING** (1 week)

**Doel:** Project setup en tooling

**Taken:**
1. Nieuw Next.js 15 project initialiseren
2. TypeScript configuratie (strict mode)
3. Biome setup (linting + formatting)
4. shadcn/ui installatie
5. TanStack Query setup
6. Testing framework (Vitest)
7. Git repository structuur
8. Environment variables

**Deliverables:**
- ✅ Werkende dev environment
- ✅ Clean project structuur
- ✅ Alle tooling geconfigureerd
- ✅ README met setup instructies

---

### **FASE 1: CORE ARCHITECTUUR** (2 weken)

**Doel:** Fundamentele architectuur en routing

#### 1.1 App Router Setup
- Locale routing met next-intl
- Layout hierarchie
- Middleware basis (auth, locale)
- Error boundaries
- Loading states
- Not-found pages

#### 1.2 API Client Layer
**Opsplitsen `server.ts` in modules:**
- `product.service.ts`
- `brand.service.ts`
- `catalog.service.ts`
- `sheet.service.ts`
- `auth.service.ts`

**Features:**
- Type-safe API clients met Zod
- Error handling utilities
- Retry logic met exponential backoff
- Rate limiting
- Request/Response interceptors

#### 1.3 Type System
- Foodbook types (behouden + vereenvoudigen)
- API response types met Zod schemas
- Component prop types
- Utility types
- Discriminated unions voor errors

#### 1.4 Utilities
- Helpers (vereenvoudigd)
- Translation utilities
- URL builders
- Date formatting
- Image helpers
- Safe HTML rendering

**Deliverables:**
- ✅ Werkende routing
- ✅ API clients getest
- ✅ Type-safe codebase
- ✅ Utility functions documented

---

### **FASE 2: AUTHENTICATIE** (1 week)

**Doel:** JWT auth en beveiliging

#### 2.1 Auth System
- JWT token validatie (Jose)
- HTTP-only cookie management
- Environment-specific cookies
- Middleware auth checks
- Token refresh flow
- Logout functionality

#### 2.2 Protected Routes
- Catalog routes bescherming
- Sheet permalink verificatie
- Auth state management (Zustand)
- Auth context provider
- Redirect logic

#### 2.3 Security
- Security headers (CSP, etc.)
- CSRF protection
- Rate limiting
- Input sanitization
- XSS prevention

**Deliverables:**
- ✅ Werkende authenticatie
- ✅ Beveiligde routes
- ✅ Token management
- ✅ Security audit passed

---

### **FASE 3: PRODUCT SEARCH & CATALOG** (3 weken)

**Doel:** Core product functionaliteit

#### 3.1 Product Search
- Search page met filters
- Filter sidebar (shadcn/ui)
- URL-based filter state
- Pagination
- Product grid
- Loading skeletons
- Empty states
- Error states

#### 3.2 Product Detail
**Product detail page met alle secties:**
- Basis info (naam, merk, EAN)
- Product afbeeldingen (gallery)
- Allergenen informatie
- Voedingswaarden tabel
- Ingrediënten lijst
- Logistieke details
- Verpakkingsinformatie
- Documenten download
- CO2 Impact score
- Keurmerken
- Contact informatie
- Responsive design

#### 3.3 Brand Pages
- Brand detail pagina
- Brand products overzicht
- Brand filtering
- Brand contact info

#### 3.4 Autocomplete
- Search autocomplete
- Debounced API calls
- Keyboard navigation
- Recent searches
- Suggested products

**Deliverables:**
- ✅ Volledig werkende product search
- ✅ Product detail pagina's
- ✅ Brand pagina's
- ✅ Autocomplete functionaliteit

---

### **FASE 4: DIGITALE CATALOGI** (2 weken)

**Doel:** Digital catalog systeem

#### 4.1 Catalog Routes
- GUID-based routing
- Catalog layout met custom theme
- Security token propagation
- Catalog navigation
- Breadcrumbs

#### 4.2 Custom Theming
- Theme API integration
- CSS custom properties
- Logo/banner display
- Color system
- Typography
- Dark mode compatibility

#### 4.3 Catalog Product Browsing
- Product search binnen catalog
- Brand filtering binnen catalog
- Product details in catalog context
- Catalog-specific layouts

**Deliverables:**
- ✅ Werkende digitale catalogi
- ✅ Custom theming
- ✅ Beveiligde toegang
- ✅ All catalog features

---

### **FASE 5: PRODUCTSHEETS & PDF** (2 weken)

**Doel:** Productsheet systeem

#### 5.1 Productsheets
- Sheet display pagina
- Permalink system
- Signed token verificatie
- Security middleware
- External access
- Share functionality

#### 5.2 PDF Generation
- PDF API routes
- PDF rendering
- Download functionality
- Print optimization
- PDF styling

#### 5.3 Sharing
- Share functionality
- Permalink generation
- Expiry handling
- Access logging

**Deliverables:**
- ✅ Werkende productsheets
- ✅ PDF generatie
- ✅ Beveiligde external access
- ✅ Share functionaliteit

---

### **FASE 6: UI/UX POLISH** (1 week)

**Doel:** User experience verbetering

#### 6.1 Components
- Loading states
- Empty states
- Error states
- Animations (Framer Motion?)
- Transitions
- Responsive design checks

#### 6.2 Accessibility
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader testing
- Color contrast checks
- WCAG 2.1 AA compliance

#### 6.3 Performance
- Image optimization
- Code splitting
- Bundle analysis
- Lazy loading
- Lighthouse scores

**Deliverables:**
- ✅ Gepolijste UI
- ✅ Toegankelijke app
- ✅ Snelle performance
- ✅ Mobile optimized

---

### **FASE 7: TESTING & QA** (2 weken)

**Doel:** Kwaliteit en stabiliteit

#### 7.1 Unit Tests
- Utilities testing
- Component testing
- API client testing
- Hook testing
- Store testing

#### 7.2 Integration Tests
- Search flow
- Auth flow
- Catalog flow
- Sheet flow
- PDF generation

#### 7.3 E2E Tests (Playwright)
- Critical user journeys
- Cross-browser testing
- Mobile testing
- Performance testing

#### 7.4 Bug Fixes
- Bug triaging
- Edge case handling
- Error scenario testing
- Regression testing

**Deliverables:**
- ✅ Test coverage >80%
- ✅ Bug-free critical paths
- ✅ Documented issues
- ✅ E2E tests passing

---

### **FASE 8: DEPLOYMENT & HANDOVER** (1 week)

**Doel:** Production ready

#### 8.1 Deployment Setup
- Docker containerization
- Environment configs (prod/staging/dev)
- CI/CD pipeline
- Monitoring setup (Sentry?)
- Logging infrastructure

#### 8.2 Documentation
- README
- API documentation
- Component documentation
- Deployment guide
- Troubleshooting guide

#### 8.3 Performance
- Caching strategy
- CDN setup
- Database optimization
- Load testing
- Performance monitoring

#### 8.4 Handover
- Knowledge transfer
- Admin training
- Maintenance guide
- Runbook

**Deliverables:**
- ✅ Production deployment
- ✅ Complete documentatie
- ✅ Team trained
- ✅ Monitoring active

---

## 5. WORDPRESS SCHEIDING

### 5.1 Website Features (naar WordPress)

**Content Management:**
- Homepage (ACF blocks blijven)
- About pagina's
- Contact pagina (CF7 blijft)
- Team pagina
- Partner overzichten
- FAQ's
- Prijzen
- Doelgroepen

**Blog:**
- Blog overzicht
- Blog posts
- Categorieën
- Tags
- Auteurs

**Andere:**
- BigMarker conferenties/agenda
- Collaboration pages
- News/Press releases

### 5.2 Integratie Punt

**Enige integratie:** Link van WordPress naar Foodbook

```php
// WordPress header
<a href="https://foodbook.psinfoodservice.com" class="cta-button">
  <?php _e('Open Foodbook', 'ps-foodservice'); ?>
</a>
```

**Geen andere integratie nodig:**
- Geen WordPress API calls in Foodbook
- Geen data uitwisseling
- Aparte cookies/sessions
- Aparte authentication

### 5.3 SEO Overwegingen

**Beide sites krijgen eigen SEO:**

**WordPress (site.psinfoodservice.com):**
- Marketing content
- Blog posts
- Company info
- Landing pages
- Yoast SEO

**Foodbook App (foodbook.psinfoodservice.com):**
- Product pages
- Dynamic sitemap
- Product schema.org
- Canonical URLs

**Link strategy:**
- WordPress → Foodbook: "Start zoeken" CTA's
- Foodbook → WordPress: Footer link "Over ons"
- Geen kruisende breadcrumbs

---

## 6. TECHNISCHE SPECIFICATIES

### 6.1 package.json

```json
{
  "name": "ps-foodbook-app",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-tabs": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.462.0",
    
    "@tanstack/react-query": "^5.59.0",
    "@tanstack/react-query-devtools": "^5.59.0",
    "zustand": "^5.0.0",
    
    "next-intl": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",
    
    "jose": "^5.9.0",
    "date-fns": "^4.1.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@biomejs/biome": "^1.9.0",
    
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@playwright/test": "^1.48.0",
    
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/lodash": "^4.17.0"
  }
}
```

### 6.2 Environment Variables

```bash
# App
NEXT_PUBLIC_APP_ENV=production|staging|development
NEXT_PUBLIC_APP_URL=https://foodbook.psinfoodservice.com

# API
FOODBOOK_API_URL=https://api.psinfoodservice.com
FOODBOOK_API_TIMEOUT=15000

# Auth
JWT_SECRET=<secret>
COOKIE_DOMAIN=.psinfoodservice.com
SESSION_DURATION=86400

# Permalink
PERMALINK_SECRET=<secret>
PERMALINK_MAX_AGE=600

# Cache
CACHE_REVALIDATE=300
CACHE_STALE_WHILE_REVALIDATE=600

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Feature Flags
FEATURE_IMPACT_SCORE=true
FEATURE_PDF_GENERATION=true
```

### 6.3 TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 6.4 Biome Config

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "useImportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  }
}
```

---

## 7. MIGRATIE STRATEGIE

### 7.1 Data Migratie

**Geen database migratie nodig** - Backend blijft hetzelfde.

**Wel te checken:**
- Analytics continuïteit (GTM events)
- Permalink backwards compatibility
- Cookie domein strategie
- Catalog GUID mapping

### 7.2 Deployment Strategie

**Blue-Green Deployment:**

1. **Oude app** blijft draaien op `psinfoodservice.com`
2. **Nieuwe app** deployen op `foodbook.psinfoodservice.com`
3. WordPress migreren naar `site.psinfoodservice.com`
4. **Redirects instellen:**
   - `psinfoodservice.com/product/*` → `foodbook.psinfoodservice.com/product/*`
   - `psinfoodservice.com/digitalcatalog/*` → `foodbook.psinfoodservice.com/digitalcatalog/*`
   - `psinfoodservice.com/productsheet/*` → `foodbook.psinfoodservice.com/productsheet/*`
   - `psinfoodservice.com/*` → `site.psinfoodservice.com/*`
5. **DNS switch** na testing periode

### 7.3 Rollback Plan

**In geval van problemen:**
1. DNS switch terug naar oude app
2. Redirects uitschakelen
3. Issue analysis
4. Fix implementeren
5. Opnieuw testen
6. Nieuwe deployment

### 7.4 Testing Plan

**Pre-launch testing:**

**Functional Testing:**
- [ ] All product searches work
- [ ] Product detail pages render correctly
- [ ] Filters work (all types)
- [ ] Pagination works
- [ ] Autocomplete works
- [ ] Brand pages work
- [ ] Digital catalogs accessible
- [ ] Catalog theming works
- [ ] Productsheets work
- [ ] Permalinks work (signed tokens)
- [ ] PDF generation works
- [ ] Authentication works
- [ ] Token refresh works
- [ ] Logout works

**Internationalization:**
- [ ] All 4 locales work (nl, en, de, fr)
- [ ] Locale switching works
- [ ] Translations complete
- [ ] RTL support (if needed)

**UI/UX:**
- [ ] Mobile responsive (all pages)
- [ ] Tablet responsive
- [ ] Desktop layout
- [ ] Dark mode (if applicable)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

**Performance:**
- [ ] Lighthouse score >90 (all categories)
- [ ] Core Web Vitals passed
- [ ] Image optimization works
- [ ] Code splitting works
- [ ] Lazy loading works

**Security:**
- [ ] Security audit passed
- [ ] Penetration testing done
- [ ] OWASP top 10 checked
- [ ] Security headers correct
- [ ] JWT validation secure

**Compatibility:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

**Accessibility:**
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader tested
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient

---

## 8. RISICO'S & MITIGATIE

| Risico | Impact | Probability | Mitigatie |
|--------|--------|-------------|-----------|
| API compatibiliteit issues | High | Low | Uitgebreide API testing in Fase 1 |
| Permalink backwards compatibility | High | Medium | Middleware redirects behouden |
| Performance regressie | Medium | Low | Performance monitoring vanaf Fase 1 |
| Digital Catalog theming breaks | Medium | Medium | Uitgebreide theming tests in Fase 4 |
| Lost SEO rankings | High | Medium | 301 redirects + sitemap continuïteit |
| WordPress migration delays | Medium | Medium | WordPress parallel development (extern) |
| Authentication issues | High | Low | Auth testing in geïsoleerde Fase 2 |
| Missing features discovered late | Medium | Medium | Feature audit in Fase 0 |
| Browser compatibility issues | Medium | Low | Cross-browser testing in Fase 7 |
| Security vulnerabilities | High | Low | Security audit + pen testing |
| Performance issues at scale | Medium | Medium | Load testing + monitoring |
| i18n translation gaps | Low | Medium | Translation audit before launch |

---

## 9. SUCCESS METRICS

### Performance Metrics

**Lighthouse Scores:**
- [ ] Performance: >90
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90

**Core Web Vitals:**
- [ ] LCP (Largest Contentful Paint): <2.5s
- [ ] FID (First Input Delay): <100ms
- [ ] CLS (Cumulative Layout Shift): <0.1

**Bundle Size:**
- [ ] Main bundle: <200KB (gzipped)
- [ ] Total JS: <500KB (gzipped)
- [ ] Initial load: <1MB

### Quality Metrics

**Code Quality:**
- [ ] Test coverage: >80%
- [ ] TypeScript strict mode: 100%
- [ ] No `any` types in production code
- [ ] Zero critical bugs
- [ ] Zero high severity bugs

**Accessibility:**
- [ ] WCAG 2.1 AA: 100% compliance
- [ ] Keyboard navigation: Fully functional
- [ ] Screen reader: Fully functional
- [ ] Color contrast: AAA where possible

### User Experience Metrics

**Functionality:**
- [ ] All existing features working
- [ ] No broken links
- [ ] No console errors
- [ ] All forms submitting
- [ ] All filters working

**Responsiveness:**
- [ ] Mobile: Fully responsive
- [ ] Tablet: Fully responsive
- [ ] Desktop: Optimized layout
- [ ] Touch interactions: Working

### Business Metrics

**Uptime & Reliability:**
- [ ] No downtime during migration
- [ ] 99.9% uptime target
- [ ] Error rate: <0.1%

**SEO:**
- [ ] All pages indexed
- [ ] Sitemap valid
- [ ] Robots.txt correct
- [ ] Schema.org markup valid
- [ ] No ranking drops

**Analytics:**
- [ ] GTM working
- [ ] All events tracking
- [ ] Conversion tracking intact
- [ ] User flows tracked

---

## 10. TIMELINE & RESOURCES

### Tijdlijn Overzicht

**Totaal: 12-14 weken**

```
Week 1:          Fase 0 - Voorbereiding
Week 2-3:        Fase 1 - Core Architectuur
Week 4:          Fase 2 - Authenticatie
Week 5-7:        Fase 3 - Product Search & Catalog
Week 8-9:        Fase 4 - Digitale Catalogi
Week 10-11:      Fase 5 - Productsheets & PDF
Week 12:         Fase 6 - UI/UX Polish
Week 13-14:      Fase 7 - Testing & QA
Week 15:         Fase 8 - Deployment

Parallel:        WordPress migration (externe team)
```

### Resources

**Development Team:**
- 1x Senior Frontend Developer (full-time, 12-14 weken)
  - Next.js 15 expertise
  - TypeScript expert
  - React Server Components ervaring
  - Testing ervaring

**Support:**
- 1x QA Engineer (part-time, laatste 3 weken)
- DevOps support voor deployment setup
- WordPress developer (extern, parallel track)

**Tools & Infrastructure:**
- Development environment
- Staging environment
- CI/CD pipeline
- Monitoring tools (Sentry/DataDog)
- Testing tools (Vitest/Playwright)

### Budget Overwegingen

**Licenties:**
- Geen extra licenties nodig (all open source)
- Mogelijk: Monitoring tool subscriptie
- Mogelijk: CDN kosten

**Hosting:**
- Staging environment
- Production environment (blijft hetzelfde?)

---

## VOLGENDE STAPPEN

1. **Review & Approval** van dit plan
2. **Resource allocatie** (developer, QA, DevOps)
3. **Environment setup** (dev, staging)
4. **Git repository** aanmaken
5. **Start Fase 0** met Claude Code prompts

---

## APPENDIX

### A. Verwijderde Componenten

**Te verwijderen uit codebase:**

```
components/
├── Blog/                    # 4 bestanden → WordPress
├── Templates/               # 14 bestanden → WordPress
├── Website/                 # 20+ bestanden → WordPress
└── Analytics/
    └── ProductSheetAnalytics.tsx  # Te behouden
```

**Te verwijderen API calls:**

```typescript
// Alle WordPress functies in app/api/server.ts:
- getPageBySlug()
- getAllLanguagesBySlug()
- getPosts()
- getPostBySlug()
- getMenu()
- getFooterData()
- getScripts()
- getContactForm()
- submitContactForm()
- getAllPagesAndPosts()

// BigMarker functies:
- getServerConferences()
- getServerConferencesByDateRange()
```

### B. Behouden Dependencies

**Core (blijven):**
- next
- react
- react-dom
- typescript

**Utilities (blijven):**
- lodash
- date-fns
- jose (JWT)
- zod (validation)

**Te vervangen:**
- next-i18next → next-intl
- Geen ESLint/Prettier → Biome

**Nieuwe toevoegingen:**
- @tanstack/react-query
- shadcn/ui components
- Vitest
- Playwright

### C. Middleware Vereenvoudiging

**Huidige middleware (10,772 regels!) moet worden:**
- Digital Catalog URL conversie
- Locale handling
- Auth verification
- Security headers
- Redirects

**~500 regels in nieuwe versie**

---

**Einde van document**
