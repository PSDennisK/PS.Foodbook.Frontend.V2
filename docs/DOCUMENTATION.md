# PS.Foodbook.Frontend - Complete Architectuur Documentatie

> Uitgebreide technische documentatie van de Next.js 14 applicatie voor PS in Foodservice

**Versie:** 1.3.9
**Laatst bijgewerkt:** 2026-01-26
**Next.js:** 14.2.30
**Node.js:** 18+

---

## Executive Summary

**PS.Foodbook.Frontend** is een enterprise-level Next.js 14 applicatie met een unieke **dual-application architectuur**. Het project bevat twee distincte applicaties in één codebase:

1. **Foodbook Applicatie** - Productcatalogus met zoeken, filteren en digitale catalogi
2. **Website Applicatie** - WordPress-gedreven marketing en content pages

### Kernstatistieken

- **Next.js versie:** 14.2.30 (App Router)
- **TypeScript:** Volledig type-safe
- **Totaal componenten:** 150+ bestanden
- **API functies:** 27 server-side endpoints
- **Ondersteunde talen:** 4 (Nederlands, Engels, Duits, Frans)
- **Belangrijkste bestand:** app/api/server.ts (1,425 regels)

---

## Inhoudsopgave

1. [Projectstructuur](#1-projectstructuur)
2. [App Router Architectuur](#2-app-router-architectuur)
3. [API & Data Layer](#3-api--data-layer)
4. [Componenten Architectuur](#4-componenten-architectuur)
5. [State Management (Zustand)](#5-state-management-zustand)
6. [Types & Interfaces](#6-types--interfaces)
7. [Utilities & Helpers](#7-utilities--helpers)
8. [Internationalisatie (i18n)](#8-internationalisatie-i18n)
9. [Authenticatie & Beveiliging](#9-authenticatie--beveiliging)
10. [Styling & Theming](#10-styling--theming)
11. [Image Handling](#11-image-handling--optimization)
12. [Caching & Performance](#12-caching--performance)
13. [WordPress Integratie](#13-wordpress-integratie)
14. [Custom Hooks](#14-custom-hooks)
15. [Error Handling](#15-error-handling--logging)
16. [Analytics & Tracking](#16-analytics--tracking)
17. [Middleware & Redirects](#17-middleware--redirects)
18. [Deployment & Build](#18-deployment--build)
19. [Testing & Development](#19-testing--development)
20. [Code Patterns](#20-code-patterns--best-practices)
21. [Belangrijke Code Flows](#21-belangrijke-code-flows)
22. [Dependencies](#22-dependencies)

---

## 1. Projectstructuur

### 1.1 Root Directory

```
PS.Foodbook.Frontend/
├── app/                      # Next.js 14 App Router (belangrijkste applicatie code)
├── components/               # Herbruikbare React componenten (150+ bestanden)
├── contexts/                 # React Context providers
├── i18n/                     # Internationalisatie configuratie
├── lib/                      # Shared libraries en utilities
├── public/                   # Statische assets
├── stores/                   # Zustand state management (3 stores)
├── types/                    # TypeScript type definities
├── utils/                    # Utility functies
├── .husky/                   # Git hooks (pre-commit: ESLint)
├── middleware.ts             # Next.js middleware (10,772 regels)
├── next.config.js            # Next.js configuratie (4,649 regels)
├── tailwind.config.ts        # Tailwind CSS configuratie
├── tsconfig.json             # TypeScript configuratie
├── package.json              # Dependencies (v1.3.9)
└── CLAUDE.md                 # Project instructies voor AI
```

---

## 2. App Router Architectuur

### 2.1 Dual Application Structure

Het project gebruikt Next.js 14 App Router met **TWEE DISTINCTE APPLICATIES** via route groups:

```
app/
├── [locale]/                              # Locale parameter (nl, en, de, fr)
│   │
│   ├── (foodbook)/                       # 🎯 FOODBOOK APPLICATIE
│   │   ├── (homepage)/                   # Homepage route group
│   │   │   ├── layout.tsx                # PageHeader + PageFooter
│   │   │   └── page.tsx                  # WordPress homepage
│   │   │
│   │   ├── brand/[id]/                   # Merkpagina's
│   │   │   └── page.tsx                  # /nl/brand/123
│   │   │
│   │   ├── digitalcatalog/               # Digitale catalogi (beveiligd)
│   │   │   └── [securityToken]/          # /nl/digitalcatalog/guid-token
│   │   │       ├── layout.tsx            # HeaderDigitalCatalog layout
│   │   │       ├── page.tsx              # Catalogus overzicht
│   │   │       ├── brand/[id]/           # Merken binnen catalogus
│   │   │       ├── product/[id]/         # Producten binnen catalogus
│   │   │       └── productsheet/[id]/    # Productsheets binnen catalogus
│   │   │
│   │   ├── product/                      # Productpagina's
│   │   │   ├── page.tsx                  # /nl/product (search)
│   │   │   └── [id]/page.tsx             # /nl/product/123
│   │   │
│   │   ├── productsheet/                 # Productsheets (externe toegang)
│   │   │   ├── [id]/page.tsx             # /nl/productsheet/123
│   │   │   └── (pdf)/[id]/pdf/           # PDF versie
│   │   │
│   │   └── pdf/[id]/[mongodbid]/         # PDF generatie routes
│   │
│   ├── (website)/                        # 🌐 WEBSITE APPLICATIE
│   │   └── (pages)/                      # WordPress CMS pages
│   │       ├── layout.tsx                # PageHeader + Breadcrumbs + PageFooter
│   │       ├── [...slug]/page.tsx        # Catch-all WordPress pages
│   │       └── blog/                     # Blog functionaliteit
│   │           ├── page.tsx              # Blog overzicht
│   │           └── [slug]/page.tsx       # Blog posts
│   │
│   └── error pages/                      # Error handling routes
│       ├── ean-not-found/
│       ├── product-not-found/
│       ├── not-publicly-visible/
│       ├── product-outdated/
│       ├── multiple-products-found/
│       └── page-not-found/
│
├── api/                                  # API Routes (Next.js Route Handlers)
│   ├── server.ts                         # 🔴 CRUCIALE FILE (1,425 regels)
│   ├── auth/check/route.ts               # JWT token verificatie
│   ├── bigmarker/route.ts                # BigMarker conferenties
│   ├── brand/[id]/route.ts               # Brand data
│   ├── catalog/getGuid/route.ts          # GUID conversie
│   ├── product/[locale]/[id]/route.ts    # Product data
│   ├── pdf/[locale]/[id]/route.ts        # PDF generatie
│   ├── log/route.ts                      # Client-side logging
│   ├── sitemap/route.ts                  # Dynamic sitemap
│   └── health/route.ts                   # Health check
│
├── hooks/                                # Custom React hooks (9 bestanden)
└── styles/                               # Global styles
```

### 2.2 Route Groups Uitleg

#### **(foodbook)** Route Group

**Doel:** Productcatalogus, zoekfunctionaliteit, digitale catalogi

**Kenmerken:**
- Layout: `PageHeader` + `PageFooter` (Foodbook-specifieke header met zoekveld)
- Authenticatie: JWT-gebaseerd via cookies
- Focus op functionaliteit en data-driven content

**Features:**
- Product zoeken en filteren
- Merk overzichtspagina's
- Digitale catalogi met security tokens
- Productsheets met permalink support
- PDF generatie

#### **(website)** Route Group

**Doel:** WordPress content management (marketing, blog, contact)

**Kenmerken:**
- Layout: `PageHeader` + `Breadcrumbs` + `PageFooter`
- CMS: WordPress REST API + ACF (Advanced Custom Fields)
- Focus op content en SEO

**Features:**
- Dynamische pagina's via catch-all route
- Blog met pagination
- Contact formulieren (Contact Form 7 + reCAPTCHA v3)
- Team pages, FAQ's, prijzen
- Partner overzichten

---

## 3. API & Data Layer

### 3.1 app/api/server.ts - HET HART VAN DE APPLICATIE

**Bestandsgrootte:** 1,425 regels
**Functie:** Alle server-side API calls met retry logic, timeouts en rate limiting

#### Architectuur Kenmerken

```typescript
// Rate limiting
const SERVER_RATE_LIMIT_MS = 1000;  // 1 request per seconde

// Retry logica: 3 pogingen met exponential backoff
const maxAttempts = 3;
const baseTimeoutMs = 15000;  // Timeouts: 15s → 30s → 60s

// Automatic JWT token injection from cookies
headers['Authorization'] = `Bearer ${token}`;
```

#### API Functies per Categorie

**FOODBOOK API** (11 functies)

| Functie | Beschrijving |
|---------|--------------|
| `getServerProduct(id, token?)` | Enkel product ophalen |
| `getServerProducts()` | Alle producten ophalen |
| `getServerProductByEan(gtin)` | GTIN/EAN lookup |
| `getServerSearchResult({filters, keyword})` | Zoekresultaten met filters |
| `getServerAutocomplete(locale, keyword)` | Autocomplete suggesties |
| `getServerFilters()` | Beschikbare filters |
| `getServerBrand(id, token?)` | Merk informatie |
| `getServerBrands(token?)` | Alle merken |
| `getServerBrandFilters(token?)` | Merk filters |
| `getServerImpactScoreFarm(mongoDbId)` | CO2 impact farm-to-farm |
| `getServerImpactScoreGate(mongoDbId)` | CO2 impact cradle-to-gate |

**WORDPRESS API** (10 functies)

| Functie | Beschrijving |
|---------|--------------|
| `getPageBySlug(slug, lang)` | Pagina met ACF fields |
| `getAllLanguagesBySlug(slug)` | Alle taalversies |
| `getPosts(lang, page, per_page)` | Blog posts met pagination |
| `getPostBySlug(slug, lang)` | Individuele blog post |
| `getMenu(locale, slug)` | WordPress menu's |
| `getFooterData(locale)` | Footer data met menu's |
| `getScripts()` | ACF scripts (GTM, etc.) |
| `getContactForm(formId)` | Contact Form 7 HTML |
| `submitContactForm(formId, data)` | Form submit met reCAPTCHA |
| `getAllPagesAndPosts()` | Voor sitemap generatie |

**BIGMARKER API** (2 functies)

| Functie | Beschrijving |
|---------|--------------|
| `getServerConferences()` | Laatste 2 conferenties |
| `getServerConferencesByDateRange(start, end)` | Conferenties per periode |

**DIGITAL CATALOG API** (4 functies)

| Functie | Beschrijving |
|---------|--------------|
| `getServerDigitalCatalogTheme(guid)` | Catalogus thema/styling |
| `getServerGuid(token, abbr)` | Token naar GUID conversie |
| `getServerDigitalCatalogLogo(fileName)` | Logo als base64 |
| `getServerDigitalCatalogBanner(fileName)` | Banner als base64 |

#### Error Handling Strategie

```typescript
// 1. Per-attempt timeout met exponential backoff
const timeoutMs = baseTimeoutMs * Math.pow(2, attempt - 1);

// 2. Retriable statussen
const isRetriableStatus = (status: number) =>
  status >= 500 || status === 429;

// 3. Retry-After header ondersteuning
const retryAfter = response.headers.get('Retry-After');
const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : exponentialDelay;

// 4. Uitgebreide logging
logger.error(`API Error (${status}) attempt ${attempt}/${maxAttempts}`);
```

### 3.2 lib/api/client.ts

**Client-side API calls** voor gebruik in Client Components:

```typescript
// Rate limiting voor client
const CLIENT_RATE_LIMIT_MS = 1000;

// Token van cookie of localStorage
function getClientAuthToken(): string | undefined {
  // Check cookies: PsFoodbookToken, PsFoodbookTokenT, PsFoodbookTokenST
  return decodeURIComponent(cookieValue);
}
```

**Belangrijkste functies:**
- `getClientProduct(productId)`
- `getClientSearchResult(params)`
- `getClientAutocomplete(locale, keyword)`
- `getClientBrand(brandId)`
- `getClientConferences()`

### 3.3 Locale Mapping

```typescript
const localeMapping = {
  en: 'en-US',  // Engels
  nl: 'nl',     // Nederlands (default)
  de: 'de',     // Duits
  fr: 'fr',     // Frans
} as const;
```

---

## 4. Componenten Architectuur

### 4.1 Componenten Overzicht (150+ bestanden)

```
components/
├── Analytics/                      # Tracking componenten (3 bestanden)
│   ├── CatalogAnalytics.tsx
│   ├── ProductAnalytics.tsx
│   └── ProductSheetAnalytics.tsx
│
├── Auth/                           # Authenticatie
│   └── AuthInitializer.tsx         # Initialize auth on mount
│
├── Blog/                           # Blog componenten (4 bestanden)
│   ├── BlogCard.tsx                # Blog post card
│   ├── ShareButton.tsx             # Social media delen
│   ├── TableOfContents.tsx         # TOC voor lange posts
│   └── TableOfContentsSkeleton.tsx # Loading state
│
├── Brand/                          # Merk componenten (2 bestanden)
│   ├── BrandDescription.tsx        # Merk beschrijving
│   └── BrandInfo.tsx               # Merk contact info
│
├── Filter/                         # Zoeken & Filteren (9 bestanden)
│   ├── index.tsx                   # Main filter component
│   ├── BrandFilter.tsx             # Merk filter
│   ├── NutritionalValueSlider.tsx  # Voedingswaarde slider
│   ├── Pagination.tsx              # Pagina navigatie
│   ├── ProductGrid.tsx             # Product grid weergave
│   ├── ProductGridSkeleton.tsx     # Loading skeleton
│   └── Sidebar.tsx                 # Filter sidebar
│
├── Layout/                         # Layout componenten (25+ bestanden)
│   ├── PageHeader.tsx              # Hoofd header (Website)
│   ├── HeaderSmall.tsx             # Compacte header (Foodbook)
│   ├── HeaderDigitalCatalog.tsx    # DC header met custom theming
│   ├── PageFooter.tsx              # Footer met menu's
│   ├── PageFooterSmall.tsx         # Compacte footer (DC)
│   ├── Breadcrumbs.tsx             # Breadcrumb navigatie
│   ├── Navigation.tsx              # Main navigatie menu
│   ├── LanguageSwitcher.tsx        # Taal wissel component
│   ├── LoginClient.tsx             # Login status
│   ├── DarkmodeSwitcher.tsx        # Dark mode toggle
│   └── FooterBlock.tsx             # Footer blokken
│
├── Product/                        # Product componenten (50+ bestanden!)
│   ├── ProductCard.tsx             # Product card in grid
│   ├── ProductCardSmall.tsx        # Compacte versie
│   ├── ProductDetails.tsx          # Product detail pagina
│   ├── ProductImage.tsx            # Product afbeelding
│   ├── ProductDescription.tsx      # Beschrijving
│   ├── ProductAllergens.tsx        # Allergenen info
│   ├── ProductAllergenFull.tsx     # Volledige allergenen lijst
│   ├── ProductNutrients.tsx        # Voedingswaarden tabel
│   ├── ProductVitamins.tsx         # Vitaminen tabel
│   ├── ProductIngredients.tsx      # Ingrediënten lijst
│   ├── ProductIngredientDeclaration.tsx  # Ingrediënten verklaring
│   ├── ProductIngredientTreeTable.tsx    # Hierarchische tabel
│   ├── ProductStorageConditions.tsx      # Bewaarinstructies
│   ├── ProductLogisticDetails.tsx        # Logistieke info
│   ├── ProductLogisticHierarchy.tsx      # Verpakkingshiërarchie
│   ├── ProductPackaging.tsx              # Verpakkingsinfo
│   ├── ProductDocuments.tsx              # Documenten download
│   ├── ProductQualityMarks.tsx           # Keurmerken
│   ├── ProductPreparation.tsx            # Bereidingswijze
│   ├── ProductSensoric.tsx               # Sensorische eigenschappen
│   ├── ProductChemical.tsx               # Chemische eigenschappen
│   ├── ProductMicroBiologicalDetails.tsx # Microbiologie
│   ├── ProductFishIngredients.tsx        # Vis ingrediënten
│   ├── ProductCountryOfOrigin.tsx        # Herkomstland
│   ├── ProductBrandLink.tsx              # Link naar merk
│   ├── ProductPSImpactScore.tsx          # CO2 impact score
│   ├── ProductContactDetails.tsx         # Contact info
│   ├── ProductSlider.tsx                 # Image slider
│   └── ProductSkeleton.tsx               # Loading skeleton
│
├── Templates/                      # WordPress templates (14 bestanden)
│   ├── BaseTemplate.tsx            # Basis template met mapping
│   ├── ContentTemplate.tsx         # Standaard content
│   ├── BlogTemplate.tsx            # Blog layout
│   ├── NewsTemplate.tsx            # Nieuwsartikelen
│   ├── ContactTemplate.tsx         # Contact pagina + CF7
│   ├── TeamTemplate.tsx            # Team overzicht
│   ├── PartnersTemplate.tsx        # Partner overzicht
│   ├── FaqTemplate.tsx             # FAQ's
│   ├── CalendarTemplate.tsx        # Agenda (BigMarker)
│   ├── CollaborationTemplate.tsx   # Samenwerkingen
│   ├── PriceTemplate.tsx           # Prijzen
│   ├── RegisterTemplate.tsx        # Registratie
│   ├── TargetGroupTemplate.tsx     # Doelgroepen
│   └── PsImpactScoreTemplate.tsx   # Impact score uitleg
│
├── UI/                             # UI componenten (15+ bestanden)
│   ├── Button/
│   │   ├── Button.tsx              # Generieke button
│   │   ├── BackButton.tsx          # Terug knop
│   │   └── FilterButton.tsx        # Filter toggle
│   ├── Modal.tsx                   # Modal component
│   ├── ModalAllergens.tsx          # Allergenen modal
│   ├── Layout.tsx                  # Layout wrapper
│   ├── Logo.tsx                    # PS logo
│   ├── HtmlContent.tsx             # Safe HTML renderer
│   ├── ThemedContent.tsx           # Themed content wrapper
│   ├── CookieConsent.tsx           # Cookie banner
│   ├── EnvironmentBanner.tsx       # Development banner
│   └── ProgressBar.tsx             # Loading progress
│
└── Website/                        # Website specifieke componenten (20+ bestanden)
    ├── Home.tsx                    # Homepage
    ├── Content.tsx                 # Content blocks
    ├── ContentBlocks.tsx           # ACF content blocks
    ├── Intro.tsx                   # Intro sectie
    ├── Cta.tsx                     # Call to action
    ├── Quote.tsx                   # Quote block
    ├── Faq.tsx                     # FAQ component
    ├── Form.tsx                    # CF7 form renderer
    ├── Employees.tsx               # Team leden
    ├── Calendar.tsx                # BigMarker calendar
    ├── Collaborations.tsx          # Partnerships
    ├── Pricing.tsx                 # Prijstabel
    └── TargetGroups.tsx            # Doelgroepen overzicht
```

### 4.2 Component Patterns

#### Server Component (Default)

```typescript
// app/[locale]/(foodbook)/product/[id]/page.tsx
const ProductPage = async ({ params: { id, locale } }) => {
  const product = await getServerProduct(id);
  return <ProductDetails product={product} />;
};
export default ProductPage;
```

#### Client Component (Interactive)

```typescript
'use client';
import { useFilterStore } from '@/stores';

export const FilterSidebar = () => {
  const { filters, addFilterValue } = useFilterStore();
  // Interactive filtering logic
};
```

#### Hybrid Pattern (Server + Client)

```typescript
// Server component
const Page = async () => {
  const initialData = await getServerData();
  return <ClientComponent initialData={initialData} />;
};

// Client component
'use client';
const ClientComponent = ({ initialData }) => {
  const [data, setData] = useState(initialData);
  // Client-side state management
};
```

---

## 5. State Management (Zustand)

### 5.1 Store Bestanden

```
stores/
├── authStore.ts          # JWT authenticatie (76 regels)
├── filterStore.ts        # Zoek & filter state (95 regels)
├── conferenceStore.ts    # BigMarker conferenties
└── index.ts              # Export barrel
```

### 5.2 authStore.ts - Authenticatie State

```typescript
interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      initialize: async () => {
        // 1. Check localStorage
        const storedAuth = localStorage.getItem('ps-foodbook-auth');

        // 2. Validate token
        const { isValid } = await validateToken(token);

        // 3. Fallback to cookie
        const cookie = document.cookie.find(/* PsFoodbookToken */);
      }
    }),
    { name: 'ps-foodbook-auth' }  // localStorage key
  )
);
```

**Gebruik:**
```typescript
'use client';
const { token, setToken } = useAuthStore();
```

### 5.3 filterStore.ts - Filter State

```typescript
interface FilterStoreState {
  keyword: string;
  filters: Filter[];
  pageIndex: number;
  pageSize: number;

  // Actions
  setKeyword: (keyword: string) => void;
  setPageIndex: (pageIndex: number) => void;
  addFilterValue: (filterKey: string, value: number) => void;
  removeFilterValue: (filterKey: string, value: number) => void;
  clearFilters: () => void;
  setRangeFilter: (filterKey, id, min, max) => void;
}
```

**Gebruik:**
```typescript
const {
  keyword,
  filters,
  setKeyword,
  addFilterValue
} = useFilterStore();

// Voeg filter toe
addFilterValue('brand', 123);

// Range filter (voedingswaarden)
setRangeFilter('energie', 1, 100, 500);
```

---

## 6. Types & Interfaces

### 6.1 Type Bestanden

```
types/
├── foodbook.ts         # Product types (907 regels)
├── wordpress.ts        # WP types (100+ regels)
├── auth.ts             # Auth types
├── bigmarker.ts        # BigMarker types
├── enum.ts             # Enums (Culture, FilterType)
├── layout.ts           # Layout types
├── index.ts            # Export barrel
└── global.d.ts         # Global type definitions
```

### 6.2 Belangrijkste Types

#### Culture Enum

```typescript
export enum Culture {
  fr = 'fr-FR',
  nl = 'nl-NL',  // Default
  de = 'de-DE',
  en = 'en-US',
}
```

#### Product Type (Vereenvoudigd)

```typescript
interface Product {
  product: {
    mongoDbId: string;
    hasImpactScore: boolean;
    summary: {
      id: string;
      name: Name;
      ean: string;
      brandname: string;
      packshot: string;
      publiclyvisible: string;
      lastupdatedon: Date;
    };
    productinfolist: {
      productinfo: {
        qualitymarkinfolist: Qualitymarkinfolist;
        fishingredientinfolist: Fishingredientinfolist;
        characteristicinfolist: Characteristicinfolist;
      };
    };
    specificationinfolist: {
      specificationinfo: {
        ingredientset: Ingredientset;
        allergenset: Allergenset;
        nutrientset: Nutrientset;
      };
    };
    commercialinfolist: Commercialinfolist;
    logisticinfolist: Logisticinfolist;
  };
}
```

#### Translation Pattern

```typescript
interface Translation {
  value: string;
  culture: Culture;
}

interface Description {
  value: string;
  translation: Translation[];
}

// Gebruik:
const getName = (desc: Description, locale: Culture): string => {
  return desc.translation.find(t => t.culture === locale)?.value
    || desc.value;
};
```

#### WordPress Types

```typescript
interface WordPressPage {
  id: number;
  title: string;
  content: string;
  slug: string;
  template: string;
  acf: Record<string, any>;  // Advanced Custom Fields
  yoast_head_json: YoastSEO;
}

interface YoastSEO {
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  schema: YoastSchema;
}
```

---

## 7. Utilities & Helpers

### 7.1 Utils Bestanden

```
utils/
├── helpers.ts          # General helpers (997 regels!)
├── logger.ts           # Logging utility
├── metadata.ts         # SEO metadata generation
├── siteConfig.ts       # Site configuration
├── dateTimeFormat.ts   # Date formatting
├── filterHelpers.ts    # Filter utilities
├── safeHtml.ts         # HTML sanitization
└── index.ts            # Export barrel
```

### 7.2 helpers.ts - Belangrijkste Functies

#### Environment

```typescript
getAppEnv(): string
getPsFoodbookTokenCookieName(): string
```

#### URL Building

```typescript
getHomeUrl(locale): string
getLocalizedPath(locale, path): string
createSlug(id, name): string
slugToText(slug): string
```

#### Translations

```typescript
getTranslation(input: TranslationInput, locale: Culture): string
useTranslatedValue(input, locale): string
```

#### Product Helpers

```typescript
getProductImage(product: Product, size: 'small' | 'large'): string
getProductName(product: Product, locale: Culture): string
getProductBrand(product: Product): string
isProductPubliclyVisible(product: Product): boolean
isProductOutdated(product: Product): boolean
```

#### Permalink Security

```typescript
isPermalinkReferrer(referrer: string): boolean
verifyPermalinkSignature({ productId, expires, signature }): boolean
```

### 7.3 logger.ts - Logging System

```typescript
interface Logger {
  info(message: string, context?: string): void;
  warn(message: string, context?: string): void;
  error(message: string, context?: string): void;
  debug(message: string, context?: string): void;
}

// Server-side: logs naar console + /api/log endpoint
// Client-side: logs naar /api/log endpoint

// Gebruik:
await logger.error(`Product not found: ${id}`, 'ProductPage');
logger.info('User authenticated', 'AuthStore');
```

### 7.4 metadata.ts - SEO Helper

```typescript
export async function generateProductMetadata(
  product: Product,
  locale: Culture
): Promise<Metadata> {
  return {
    title: getProductName(product, locale),
    description: getProductDescription(product, locale),
    openGraph: {
      images: [getProductImage(product, 'large')],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: getProductUrl(product, locale),
      languages: generateLanguageAlternates(product),
    },
  };
}
```

---

## 8. Internationalisatie (i18n)

### 8.1 I18n Configuratie

```
i18n/
├── settings.ts         # i18next configuratie
└── locales/            # Translation files (niet in repo)
    ├── nl/
    ├── en/
    ├── de/
    └── fr/
```

### 8.2 i18n Settings

```typescript
// i18n/settings.ts
export const fallbackLng = 'nl';
export const locales = ['nl', 'en', 'de', 'fr'] as const;
export const defaultNS = 'common';

export function getOptions(lang = fallbackLng, ns = defaultNS): InitOptions {
  return {
    supportedLngs: locales,
    fallbackLng,
    lng: lang,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
```

### 8.3 Translation Pattern

**Server Component:**
```typescript
import { useTranslation } from '@/i18n';

const ServerComponent = async ({ locale }) => {
  const { t } = await useTranslation(locale, 'common');
  return <h1>{t('welcome')}</h1>;
};
```

**Client Component:**
```typescript
'use client';
import { useTranslation } from 'react-i18next';

const ClientComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
};
```

### 8.4 Locale Routing

Alle routes zijn locale-prefixed:

- `/` → rewrite naar `/nl/`
- `/en/` → Engels
- `/de/` → Duits
- `/fr/` → Frans

**Middleware logica:**
```typescript
// 1. Redirect /nl/ naar /
if (pathname.startsWith(`/${fallbackLng}/`)) {
  return NextResponse.redirect(pathname.replace(`/${fallbackLng}/`, '/'));
}

// 2. Rewrite / naar /nl/
if (pathnameIsMissingLocale) {
  return NextResponse.rewrite(`/${fallbackLng}${pathname}`);
}
```

---

## 9. Authenticatie & Beveiliging

### 9.1 JWT Authenticatie

**Token opslag:**

```typescript
// Server-side: HTTP-only cookie
Set-Cookie: PsFoodbookToken=<jwt>; HttpOnly; Secure; SameSite=Lax

// Client-side: localStorage (Zustand persist)
localStorage.setItem('ps-foodbook-auth', JSON.stringify({
  state: { token: '<jwt>' }
}));
```

**Environment-specifieke cookie namen:**

```typescript
export function getPsFoodbookTokenCookieName(): string {
  const env = getAppEnv(); // 'production', 'staging', 'test'

  switch (env) {
    case 'test': return 'PsFoodbookTokenT';
    case 'staging': return 'PsFoodbookTokenST';
    default: return 'PsFoodbookToken';
  }
}
```

**Token validatie:**

```typescript
// lib/auth/client.ts
export async function validateToken(token: string): Promise<{
  isValid: boolean;
  decoded?: JWTPayload;
}> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return { isValid: true, decoded: payload };
  } catch {
    return { isValid: false };
  }
}
```

### 9.2 Digital Catalog Security

Digitale catalogi gebruiken **security tokens**:

```typescript
// Route: /nl/digitalcatalog/[securityToken]/product/123

// API calls krijgen custom header
headers['securitytoken'] = securityToken;

// Backend route bepaling
const url = securityToken
  ? `${foodbookBaseUrl}/v2/Product/DC/GetProductSheet/${id}`
  : `${foodbookBaseUrl}/v2/Product/GetProductSheet/${id}`;
```

**GUID conversie:**

```typescript
// Oude URL: /digitalcatalog/12345/ABC
// Nieuwe URL: /digitalcatalog/550e8400-e29b-41d4-a716-446655440000

const guid = await getServerGuid(securityToken, urlAbbreviation);
```

### 9.3 Productsheet Permalink Security

Productsheets ondersteunen **signed tokens** voor externe toegang:

**URL parameters:**
- `psexp`: Unix timestamp (expiry)
- `pssig`: HMAC-SHA256 signature
- `pspid`: Product ID

**Middleware verificatie:**

```typescript
const hasValidSignedToken = await verifyPermalinkSignature({
  productId: pspid,
  expires: psexp,
  signature: pssig,
});

// Set permissive cookies (10 minuten)
if (hasValidSignedToken) {
  response.cookies.set('permalink_access', 'true', {
    httpOnly: true,
    secure: true,
    maxAge: 600,
    sameSite: 'lax',
  });
}
```

**Signature verificatie:**

```typescript
// utils/helpers.ts
export async function verifyPermalinkSignature({
  productId,
  expires,
  signature,
}: {
  productId: string;
  expires: string;
  signature: string;
}): Promise<boolean> {
  const secret = process.env.PERMALINK_SECRET;
  const message = `${productId}:${expires}`;
  const expectedSig = await computeHMAC(message, secret);

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig)
  );
}
```

---

## 10. Styling & Theming

### 10.1 Tailwind Configuratie

```typescript
// tailwind.config.ts
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',  // Class-based dark mode
  theme: {
    extend: {
      colors: {
        'ps-pink': { 50-950 palette },
        'ps-blue': { 50-950 palette },
        'ps-lightblue': { 50-950 palette },
        'ps-yellow': { 50-950 palette },
        'ps-green': { 50-950 palette },
        'ps-red': { 50-950 palette },
        'ps-orange': { 50-950 palette },
        theme: {  // CSS custom properties
          'ps-blue-100': 'var(--theme-background)',
          'ps-blue-500': 'var(--theme-secondary)',
          'ps-blue-700': 'var(--theme-primary)',
        },
      },
      backgroundImage: {
        'green-gradient': 'linear-gradient(54deg, #8ab52f, #a5d83a)',
        'blue-gradient': 'linear-gradient(0deg, #00ace6, #0063b3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

### 10.2 Digital Catalog Theming

Digitale catalogi ondersteunen **custom theming**:

```typescript
interface digitalCatalogTheme {
  title?: string;
  guid?: string;
  image?: string;            // Logo
  bannerImage?: string;      // Banner image
  backgroundColor?: string;  // #RRGGBB
  textColor?: string;        // #RRGGBB
}

// Ophalen van thema
const theme = await getServerDigitalCatalogTheme(guid);

// CSS custom properties
:root {
  --theme-background: ${theme.backgroundColor};
  --theme-text: ${theme.textColor};
  --theme-primary: ${theme.primaryColor};
}
```

### 10.3 Dark Mode

```typescript
// app/hooks/useDarkMode.ts
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    setIsDark(stored === 'true');
  }, []);

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem('darkMode', String(newValue));
    document.documentElement.classList.toggle('dark', newValue);
  };

  return { isDark, toggle };
};
```

**Gebruik in componenten:**

```tsx
<div className="bg-white dark:bg-gray-800">
  <h1 className="text-gray-900 dark:text-white">
    Dark mode content
  </h1>
</div>
```

---

## 11. Image Handling & Optimization

### 11.1 Next.js Image Configuration

```javascript
// next.config.js
images: {
  unoptimized: false,  // Image optimization enabled
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 2678400,  // 31 days

  remotePatterns: [
    { hostname: 'psinfoodservice.online' },
    { hostname: 'permalink.psinfoodservice.com' },
    { hostname: 'cdn.psinfoodservice.com' },
    { hostname: 'foodbook.psinfoodservice.com' },
    { hostname: 'site.psinfoodservice.com' },
  ],
}
```

### 11.2 Product Image Helper

```typescript
// utils/helpers.ts
export function getProductImage(
  product: Product,
  size: 'small' | 'large' = 'small'
): string {
  const assetinfo = product.product?.logisticinfolist
    ?.logisticinfo?.assetinfolist?.assetinfo;

  if (!assetinfo) return noImage.src;

  const assets = normalizeToArray(assetinfo);
  const heroImage = assets.find(a => a.isheroimage === 'true')
    || assets[0];

  if (size === 'large') {
    return heroImage?.highresolutionimage?.downloadurl
      || heroImage?.downloadurl
      || noImage.src;
  }

  return heroImage?.lowresolutionimage?.downloadurl
    || heroImage?.downloadurl
    || noImage.src;
}
```

---

## 12. Caching & Performance

### 12.1 Next.js Caching Strategie

```typescript
// app/api/server.ts
fetchOptions: {
  next: {
    revalidate: 300,  // 5 minuten
    tags: [`product-${id}`],  // Cache tagging
  },
  cache: 'force-cache',  // of 'no-store'
}

// WordPress content
const revalidate = parseInt(
  process.env.NEXT_PUBLIC_REVALIDATE || '3600',  // 1 uur
  10
);
```

### 12.2 HTTP Cache Headers

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',  // 1 jaar
      }],
    },
    {
      source: '/_next/static/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      }],
    },
  ];
}
```

### 12.3 Rate Limiting

**Server-side:**

```typescript
// app/api/server.ts
let lastServerFetchTs = 0;
const SERVER_RATE_LIMIT_MS = 1000;  // 1 request per seconde

async function enforceServerRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastServerFetchTs;
  if (elapsed < SERVER_RATE_LIMIT_MS) {
    await new Promise(resolve =>
      setTimeout(resolve, SERVER_RATE_LIMIT_MS - elapsed)
    );
  }
  lastServerFetchTs = Date.now();
}
```

**Client-side:**

```typescript
// lib/api/client.ts
let lastClientFetchTs = 0;
const CLIENT_RATE_LIMIT_MS = 1000;  // Per tab
```

### 12.4 Build Optimizations

```javascript
// next.config.js
{
  output: 'standalone',  // Docker-friendly output
  swcMinify: true,       // SWC minifier (sneller dan Terser)
  compress: true,        // Gzip compression

  experimental: {
    optimizePackageImports: [
      'lodash', 'date-fns', '@mui/material'
    ],
    workerThreads: true,
    cpus: 6,
  },
}
```

---

## 13. WordPress Integratie

### 13.1 WordPress REST API Endpoints

```
/wp/v2/pages              # Pagina's
/wp/v2/posts              # Blog posts
/wp/v2/media              # Media library
/acf/v3/pages/{id}        # ACF fields (pages)
/acf/v3/posts/{id}        # ACF fields (posts)
/acf/v1/options           # ACF options (global)
/menus/v1/menus/{slug}    # Menu's
/cf7/v1/forms/{id}        # Contact Form 7
```

### 13.2 ACF (Advanced Custom Fields)

Alle WordPress content gebruikt ACF voor gestructureerde data:

```typescript
interface WordPressPage {
  acf: {
    // Homepage
    heroTitle?: string;
    heroDescription?: string;
    heroImage?: string;
    heroButton?: { title: string; url: string };

    // Content blocks
    contentBlocks?: Array<{
      type: 'text' | 'image' | 'video' | 'cta';
      title?: string;
      content?: string;
      image?: string;
      button?: { title: string; url: string };
    }>;

    // SEO
    seoTitle?: string;
    seoDescription?: string;
    hide_in_sitemap?: boolean;

    // Team
    teamMembers?: Array<{
      name: string;
      role: string;
      photo: string;
      bio: string;
    }>;

    // FAQ
    faqItems?: Array<{
      question: string;
      answer: string;
    }>;
  };
}
```

### 13.3 Template Mapping

```typescript
// components/Templates/BaseTemplate.tsx
const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  'default': ContentTemplate,
  'template-blog.php': BlogTemplate,
  'template-news.php': NewsTemplate,
  'template-contact.php': ContactTemplate,
  'template-team.php': TeamTemplate,
  'template-partners.php': PartnersTemplate,
  'template-faq.php': FaqTemplate,
  'template-calendar.php': CalendarTemplate,
  'template-collaboration.php': CollaborationTemplate,
  'template-price.php': PriceTemplate,
  'template-psimpactscore.php': PsImpactScoreTemplate,
};
```

### 13.4 Contact Form 7 Integratie

```typescript
// app/api/server.ts
export async function submitContactForm(
  formId: string,
  formData: FormData
) {
  // 1. Verify reCAPTCHA v3
  const recaptchaToken = formData.get('g-recaptcha-response');
  const isValid = await verifyRecaptcha(recaptchaToken);

  if (!isValid) {
    return {
      status: 'validation_failed',
      message: 'ReCaptcha verificatie mislukt'
    };
  }

  // 2. Submit naar CF7 API
  const response = await fetch(
    `${wpBaseUrl}/cf7/v1/forms/${formId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(formData)),
    }
  );

  return await response.json();
}
```

---

## 14. Custom Hooks

### 14.1 Hooks Overzicht

```
app/hooks/
├── useDarkMode.ts              # Dark mode toggle
├── useInitializeAuth.ts        # Auth initialization
├── useMetaTags.ts              # Dynamic meta tags
├── useTranslatedValue.ts       # Translation helper
├── useUrlBuilder.ts            # Locale-aware URLs
├── useSearch.ts                # Product search
├── usePageViewTracking.ts      # Google Analytics page views
├── useEventTracking.ts         # Google Analytics events
└── index.ts                    # Export barrel
```

### 14.2 useUrlBuilder

```typescript
// app/hooks/useUrlBuilder.ts
export const useUrlBuilder = () => {
  const locale = useCurrentLocale();

  return (path: string): string => {
    if (locale === fallbackLng) {
      return path;  // /product/123
    }
    return `/${locale}${path}`;  // /en/product/123
  };
};

// Gebruik:
const buildUrl = useUrlBuilder();
const url = buildUrl('/product/123');  // Locale-aware
```

### 14.3 useSearch

```typescript
// app/hooks/useSearch.ts
export const useSearch = () => {
  const {
    keyword,
    filters,
    pageIndex,
    setKeyword
  } = useFilterStore();

  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await getClientSearchResult({
        keyword,
        filters,
        pageIndex,
        pageSize: 21,
      });

      setResults(data);
    } catch (error) {
      logger.error(`Search error: ${error}`, 'useSearch');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, filters, pageIndex]);

  useEffect(() => {
    search();
  }, [search]);

  return { results, isLoading, setKeyword };
};
```

---

## 15. Error Handling & Logging

### 15.1 Error Boundaries

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(
      `React Error Boundary: ${error.message}`,
      'ErrorBoundary',
      { errorInfo }
    );
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### 15.2 Logging API Route

```typescript
// app/api/log/route.ts
export async function POST(request: NextRequest) {
  const { level, message, context, metadata } = await request.json();

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    metadata,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for'),
  };

  // Log naar console (production: log service)
  console[level](JSON.stringify(logEntry));

  return NextResponse.json({ success: true });
}
```

### 15.3 Product Error Pages

Specifieke error pages voor product flows:

- `/product-not-found` - Product bestaat niet
- `/product-outdated` - Product >3 jaar niet bijgewerkt
- `/not-publicly-visible` - Privé product
- `/ean-not-found` - EAN lookup failed
- `/multiple-products-found` - Meerdere producten gevonden
- `/page-not-found` - Generic 404

---

## 16. Analytics & Tracking

### 16.1 Google Tag Manager

```typescript
// components/GoogleTagManager.tsx
export const GoogleTagManager = () => {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){...})(window,document,'script','dataLayer','${gtmId}');
        `,
      }}
    />
  );
};
```

### 16.2 Event Tracking

```typescript
// app/hooks/useEventTracking.ts
export const useEventTracking = () => {
  const trackEvent = useCallback((
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    window.dataLayer?.push({
      event: eventName,
      ...eventParams,
    });
  }, []);

  return { trackEvent };
};

// Gebruik:
const { trackEvent } = useEventTracking();

// Product bekeken
trackEvent('product_view', {
  product_id: product.id,
  product_name: product.name,
  brand: product.brand,
});
```

---

## 17. Middleware & Redirects

### 17.1 Middleware Functionaliteiten

Het `middleware.ts` bestand (10,772 regels) behandelt:

1. **Locale routing**: `/` → `/nl/`, `/en/` → Engels
2. **Digital catalog URL conversie**: Token naar GUID
3. **Robots.txt generation**: Dynamische robots.txt
4. **Sitemap routing**: `/sitemap.xml` → `/api/sitemap`
5. **Productsheet permalink cookies**: Signed token verificatie
6. **Security headers**: X-Frame-Options, CSP

```typescript
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Sitemap
  if (pathname === '/sitemap.xml') {
    return NextResponse.rewrite(new URL('/api/sitemap', request.url));
  }

  // 2. Digital Catalog URL conversie
  const catalogMatch = pathname.match(
    /\/([^/]+)\/digitalcatalog\/(\d+)\/([^/]+)/
  );

  if (catalogMatch) {
    const [, locale, securityToken, urlAbbreviation] = catalogMatch;
    const guid = await fetchGuid(securityToken, urlAbbreviation);

    if (guid) {
      return NextResponse.redirect(
        new URL(`/${locale}/digitalcatalog/${guid}`, request.url),
        308
      );
    }
  }

  // 3. Locale handling
  if (pathnameIsMissingLocale) {
    return NextResponse.rewrite(
      new URL(`/${fallbackLng}${pathname}`, request.url)
    );
  }

  return response;
}
```

---

## 18. Deployment & Build

### 18.1 Build Scripts

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--inspect' next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prettier": "prettier --write .",
    "prepare": "husky"
  }
}
```

### 18.2 Standalone Output

```javascript
// next.config.js
{
  output: 'standalone',  // Produceert .next/standalone/
}

// Deployment structuur:
.next/standalone/
├── .next/
├── node_modules/        # Alleen production deps
├── package.json
├── public/
└── server.js            # Start script
```

### 18.3 Environment Variables

```bash
# Production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BASE_URL=https://psinfoodservice.com

# APIs
NEXT_PUBLIC_FOODBOOK_API_URL=https://api.psinfoodservice.com
NEXT_PUBLIC_WP_API_URL=https://site.psinfoodservice.com/wp-json
NEXT_PUBLIC_BIGMARKER_API_URL=https://www.bigmarker.com/api/v1

# Security
NEXT_PUBLIC_RECAPTCHA_SECRET_KEY=<secret>
PERMALINK_SECRET=<secret>

# Caching
NEXT_PUBLIC_REVALIDATE=3600

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### 18.4 Git Hooks

```bash
# .husky/pre-commit
npm run lint
```

---

## 19. Testing & Development

### 19.1 Development Mode

```bash
# Start dev server met debugger
npm run dev

# Runs op: http://localhost:3000
# Debugging: chrome://inspect
```

### 19.2 Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: getAppEnv(),
    version: process.env.npm_package_version,

    // Check API connectivity
    apis: {
      foodbook: await checkApi(foodbookBaseUrl),
      wordpress: await checkApi(wpBaseUrl),
      bigmarker: await checkApi(bigmarkerBaseUrl),
    },
  };

  return NextResponse.json(health);
}
```

---

## 20. Code Patterns & Best Practices

### 20.1 Naming Conventions

**Bestanden:**
- Componenten: `PascalCase.tsx` (ProductCard.tsx)
- Utilities: `camelCase.ts` (helpers.ts)
- Hooks: `usePascalCase.ts` (useUrlBuilder.ts)
- Types: `PascalCase.ts` (foodbook.ts)

**Functies:**
- Server API: `getServer*` (getServerProduct)
- Client API: `getClient*` (getClientProduct)
- Hooks: `use*` (useFilterStore)
- Event handlers: `handle*` (handleSubmit)

### 20.2 Import Pattern

```typescript
// External imports
import React from 'react';
import { useTranslation } from 'react-i18next';

// Internal imports (aliased met @/)
import { getServerProduct } from '@/app/api/server';
import { ProductCard } from '@/components/Product';
import { useFilterStore } from '@/stores';
import { Culture } from '@/types';
import { logger } from '@/utils';
```

### 20.3 Component Pattern

```typescript
// Props interface
interface ComponentNameProps {
  prop1: string;
  prop2?: number;  // Optional
  children?: React.ReactNode;
}

// Named export voor reusable components
export const ComponentName = ({
  prop1,
  prop2 = 10,  // Default value
  children
}: ComponentNameProps) => {
  return <div>{children}</div>;
};

// Default export voor pages
const Page = () => {
  return <div>Page content</div>;
};
export default Page;
```

---

## 21. Belangrijke Code Flows

### 21.1 Product Detail Flow

```
User navigeert naar /product/123
    ↓
Middleware: Locale handling (/ → /nl/)
    ↓
app/[locale]/(foodbook)/product/[id]/page.tsx
    ↓
getServerProduct(123) → app/api/server.ts
    ↓
API call met retry logic + timeout + rate limiting
    ↓
Response → ProductDetails component
    ↓
ProductAnalytics tracking (GTM)
    ↓
Render: Product info, allergenen, voedingswaarden, etc.
```

### 21.2 Search Flow

```
User opent /product (search page)
    ↓
SearchPage (server) → getServerFilters()
    ↓
SearchPageClient met initialFilters
    ↓
useFilterStore: keyword, filters, pageIndex
    ↓
User typt zoekterm → setKeyword()
    ↓
useSearch hook → getClientSearchResult()
    ↓
API call → SearchResults
    ↓
ProductGrid render met FilterProduct[]
```

### 21.3 Digital Catalog Flow

```
User klikt op DC link: /digitalcatalog/12345/ABC
    ↓
Middleware: fetchGuid(12345, ABC)
    ↓
API call → GUID: 550e8400-e29b-41d4-a716-446655440000
    ↓
Redirect 308 → /nl/digitalcatalog/550e8400-.../
    ↓
getServerDigitalCatalogTheme(guid)
    ↓
Custom theming CSS variables
    ↓
HeaderDigitalCatalog met custom colors/logo
    ↓
Product browse met securityToken in alle API calls
```

### 21.4 WordPress Page Flow

```
User navigeert naar /about-us
    ↓
Middleware: / → /nl/ rewrite
    ↓
app/[locale]/(website)/(pages)/[...slug]/page.tsx
    ↓
getPageBySlug('about-us', 'nl') → WordPress API
    ↓
Fetch page + ACF fields
    ↓
BaseTemplate: template mapping
    ↓
ContentTemplate render met ACF blocks
```

---

## 22. Dependencies

### 22.1 Core Dependencies

```json
{
  "next": "^14.2.30",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.4.5"
}
```

### 22.2 State & i18n

```json
{
  "zustand": "^4.4.7",
  "i18next": "^23.15.1",
  "react-i18next": "^14.1.3",
  "next-i18next": "^15.3.1"
}
```

### 22.3 Styling

```json
{
  "tailwindcss": "^3.4.3",
  "@tailwindcss/typography": "^0.5.15",
  "autoprefixer": "^10.4.19",
  "postcss": "^8.4.38"
}
```

### 22.4 Forms & Validation

```json
{
  "react-hook-form": "^7.52.2",
  "yup": "^1.4.0",
  "zod": "^3.23.8",
  "react-google-recaptcha": "^3.1.0"
}
```

### 22.5 Utilities

```json
{
  "lodash": "^4.17.21",
  "date-fns": "^4.0.0",
  "jose": "^5.9.6",
  "js-cookie": "^3.0.5",
  "html-entities": "^2.5.2",
  "isomorphic-dompurify": "^2.16.0",
  "sharp": "^0.33.4"
}
```

---

## Conclusie

**PS.Foodbook.Frontend** is een **professionele, production-ready enterprise applicatie** met:

✅ **Schaalbare architectuur** - Dual-app design met duidelijke separation of concerns
✅ **Robuuste API layer** - Retry logic, timeouts, rate limiting, error handling
✅ **Uitgebreide beveiliging** - JWT auth, security tokens, signed permalinks
✅ **SEO-geoptimaliseerd** - Yoast integration, dynamic metadata, sitemap
✅ **Meertalig** - 4 talen met i18next
✅ **Type-safe** - Volledig TypeScript met uitgebreide interfaces
✅ **Performance-focused** - Caching, image optimization, standalone output
✅ **Developer-friendly** - Hot reload, ESLint, Prettier, Husky hooks

De codebase volgt **Next.js 14 best practices** met Server Components als default, strategische use van Client Components voor interactiviteit, en moderne patterns zoals Zustand voor state management en Tailwind voor styling.

---

**Voor vragen of aanvullingen, zie CLAUDE.md voor project-specifieke instructies.**
