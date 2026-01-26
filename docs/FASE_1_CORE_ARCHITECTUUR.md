# FASE 1: CORE ARCHITECTUUR - Claude Code Prompt

**Project:** PS.Foodbook.Frontend Modernisering  
**Fase:** 1 - Core Architectuur  
**Duur:** 2 weken  
**Doel:** Fundamentele architectuur en routing  

---

## CONTEXT

PS.Foodbook.Frontend modernisering - Fase 1: Core Architectuur.
Het project is opgezet in Fase 0. Nu bouwen we de fundamentele architectuur.

## DOEL

Implementeer de core architectuur: routing met i18n, API client layer, type system, en utilities.
Dit vormt de basis voor alle features.

---

## REQUIREMENTS

### 1. LOCALE ROUTING (next-intl)

#### A. Installeer next-intl
```bash
npm install next-intl@^3.23.0
```

#### B. i18n Configuratie

**src/i18n/request.ts:**
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
```

**src/i18n/routing.ts:**
```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['nl', 'en', 'de', 'fr'],
  defaultLocale: 'nl',
  localePrefix: 'as-needed', // nl heeft geen prefix
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

**src/i18n/types.ts:**
```typescript
export type Locale = 'nl' | 'en' | 'de' | 'fr';

export const locales: Locale[] = ['nl', 'en', 'de', 'fr'];

export const localeNames: Record<Locale, string> = {
  nl: 'Nederlands',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};
```

#### C. Messages files

Creëer placeholder message files:
- `messages/nl.json`
- `messages/en.json`
- `messages/de.json`
- `messages/fr.json`

```json
{
  "common": {
    "search": "Zoeken",
    "loading": "Laden...",
    "error": "Er is een fout opgetreden"
  }
}
```

#### D. Middleware (middleware.ts in root)

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(nl|en|de|fr)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
```

#### E. App Router Structuur

```
src/app/
├── [locale]/
│   ├── layout.tsx                    # Root layout met IntlProvider
│   ├── page.tsx                      # Homepage (product search)
│   ├── loading.tsx                   # Loading state
│   ├── error.tsx                     # Error boundary
│   ├── not-found.tsx                 # 404 page
│   │
│   ├── product/
│   │   ├── page.tsx                  # Product search
│   │   └── [id]/
│   │       ├── page.tsx              # Product detail
│   │       └── loading.tsx           # Loading state
│   │
│   ├── brand/
│   │   └── [id]/
│   │       └── page.tsx              # Brand detail
│   │
│   ├── digitalcatalog/
│   │   └── [guid]/
│   │       ├── layout.tsx            # Catalog layout
│   │       ├── page.tsx              # Catalog home
│   │       ├── product/[id]/
│   │       └── brand/[id]/
│   │
│   └── productsheet/
│       └── [id]/
│           ├── page.tsx              # Sheet view
│           └── pdf/
│               └── route.ts          # PDF download
│
└── api/
    └── health/
        └── route.ts                  # Health check endpoint
```

**src/app/[locale]/layout.tsx:**
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**src/app/[locale]/error.tsx:**
```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  return (
    <div>
      <h2>{t('error')}</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### 2. TYPE SYSTEM

#### A. Enums (src/types/enums.ts)

```typescript
export enum Culture {
  NL = 'nl-NL',
  EN = 'en-US',
  DE = 'de-DE',
  FR = 'fr-FR',
}

export enum FilterType {
  CHECKBOX = 'checkbox',
  RANGE = 'range',
  SELECT = 'select',
}

export enum ProductStatus {
  ACTIVE = 'active',
  OUTDATED = 'outdated',
  DRAFT = 'draft',
}
```

#### B. API Types (src/types/api.ts)

```typescript
export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };
```

#### C. Common Types (src/types/common.ts)

```typescript
import { Culture } from './enums';

export interface Translation {
  value: string;
  culture: Culture;
}

export interface LocalizedString {
  value: string;
  translation?: Translation[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}
```

#### D. Product Types (src/types/product.ts)

Zod schemas voor runtime validatie:

```typescript
import { z } from 'zod';
import { Culture } from './enums';

export const TranslationSchema = z.object({
  value: z.string(),
  culture: z.nativeEnum(Culture),
});

export const LocalizedStringSchema = z.object({
  value: z.string(),
  translation: z.array(TranslationSchema).optional(),
});

export const ProductSummarySchema = z.object({
  id: z.string(),
  mongoDbId: z.string().optional(),
  name: LocalizedStringSchema,
  ean: z.string(),
  brandname: z.string(),
  packshot: z.string().optional(),
  publiclyvisible: z.string(),
  lastupdatedon: z.coerce.date(),
});

export const AllergenSchema = z.object({
  name: LocalizedStringSchema,
  levelcode: z.string(),
  allergentype: z.string().optional(),
});

export const NutrientSchema = z.object({
  name: LocalizedStringSchema,
  value: z.string(),
  unit: z.string(),
  quantitytypecode: z.string().optional(),
});

export const IngredientSchema = z.object({
  name: LocalizedStringSchema,
  percentage: z.string().optional(),
  order: z.number().optional(),
});

export const ProductSchema = z.object({
  product: z.object({
    mongoDbId: z.string(),
    hasImpactScore: z.boolean().optional(),
    summary: ProductSummarySchema,
    productinfolist: z.object({
      productinfo: z.object({
        qualitymarkinfolist: z.any().optional(),
        fishingredientinfolist: z.any().optional(),
        characteristicinfolist: z.any().optional(),
      }),
    }).optional(),
    specificationinfolist: z.object({
      specificationinfo: z.object({
        ingredientset: z.object({
          ingredient: z.union([IngredientSchema, z.array(IngredientSchema)]).optional(),
        }).optional(),
        allergenset: z.object({
          allergen: z.union([AllergenSchema, z.array(AllergenSchema)]).optional(),
        }).optional(),
        nutrientset: z.object({
          nutrient: z.union([NutrientSchema, z.array(NutrientSchema)]).optional(),
        }).optional(),
      }),
    }).optional(),
  }),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductSummary = z.infer<typeof ProductSummarySchema>;
export type Allergen = z.infer<typeof AllergenSchema>;
export type Nutrient = z.infer<typeof NutrientSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
```

#### E. Brand Types (src/types/brand.ts)

```typescript
import { z } from 'zod';
import { LocalizedStringSchema } from './product';

export const BrandSchema = z.object({
  id: z.string(),
  name: LocalizedStringSchema,
  logo: z.string().optional(),
  description: LocalizedStringSchema.optional(),
  website: z.string().optional(),
  contactinfo: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export type Brand = z.infer<typeof BrandSchema>;
```

#### F. Catalog Types (src/types/catalog.ts)

```typescript
import { z } from 'zod';

export const CatalogThemeSchema = z.object({
  guid: z.string(),
  title: z.string().optional(),
  image: z.string().optional(),
  bannerImage: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export type CatalogTheme = z.infer<typeof CatalogThemeSchema>;
```

#### G. Auth Types (src/types/auth.ts)

```typescript
export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface TokenValidation {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
}
```

#### H. Filter Types (src/types/filter.ts)

```typescript
import { FilterType } from './enums';

export interface FilterOption {
  id: string | number;
  label: string;
  count?: number;
}

export interface Filter {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  min?: number;
  max?: number;
  value?: FilterValue;
}

export type FilterValue =
  | string
  | number
  | string[]
  | number[]
  | { min: number; max: number };

export interface SearchParams {
  keyword?: string;
  filters?: Record<string, FilterValue>;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults {
  products: ProductSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: Filter[];
}
```

### 3. API CLIENT LAYER

**BELANGRIJKSTE TAAK:** Split de oude server.ts (1,425 regels) op in modules.

#### A. API Base (src/lib/api/base.ts)

```typescript
import { env } from '@/config/env';
import { logger } from '@/lib/utils/logger';
import type { ApiError, ApiResult } from '@/types/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  token?: string;
}

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 3;
const RATE_LIMIT_MS = 1000;

let lastRequestTime = 0;

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;

  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }

  lastRequestTime = Date.now();
}

function isRetriableError(status: number): boolean {
  return status >= 500 || status === 429;
}

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResult<T>> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    token,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await enforceRateLimit();

      const controller = new AbortController();
      const timeoutMs = timeout * Math.pow(2, attempt - 1);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (attempt < retries && isRetriableError(response.status)) {
          const retryAfter = response.headers.get('Retry-After');
          const delayMs = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, attempt) * 1000;

          logger.warn(
            `API error ${response.status}, retrying (${attempt}/${retries})`,
            'apiFetch'
          );

          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };

        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      if (attempt < retries) {
        logger.warn(`Request failed, retrying (${attempt}/${retries})`, 'apiFetch');
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
      };

      logger.error(`API request failed: ${apiError.message}`, 'apiFetch');
      return { success: false, error: apiError };
    }
  }

  return {
    success: false,
    error: { message: 'Max retries exceeded', status: 0 },
  };
}
```

#### B. Product Service (src/lib/api/product.service.ts)

```typescript
import { env } from '@/config/env';
import { apiFetch } from './base';
import { ProductSchema, type Product, type ProductSummary } from '@/types/product';
import type { SearchParams, SearchResults, Filter } from '@/types/filter';
import type { Culture } from '@/types/enums';

const BASE_URL = env.api.foodbook;

export const productService = {
  async getById(id: string, token?: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductSheet/${id}`;
    const result = await apiFetch<any>(url, { token });

    if (!result.success) {
      return null;
    }

    // Validate with Zod
    const parsed = ProductSchema.safeParse(result.data);
    if (!parsed.success) {
      console.error('Product validation failed:', parsed.error);
      return null;
    }

    return parsed.data;
  },

  async getByEan(gtin: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductByEAN/${gtin}`;
    const result = await apiFetch<any>(url);

    if (!result.success) {
      return null;
    }

    const parsed = ProductSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async search(params: SearchParams): Promise<SearchResults | null> {
    const url = `${BASE_URL}/v2/Product/GetSearchResult`;
    const result = await apiFetch<any>(url, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!result.success) {
      return null;
    }

    // TODO: Parse with Zod schema
    return result.data as SearchResults;
  },

  async autocomplete(keyword: string, locale: Culture): Promise<string[]> {
    const url = `${BASE_URL}/v2/Product/GetAutocomplete/${locale}/${encodeURIComponent(keyword)}`;
    const result = await apiFetch<string[]>(url);

    return result.success ? result.data : [];
  },

  async getFilters(): Promise<Filter[]> {
    const url = `${BASE_URL}/v2/Product/GetFilters`;
    const result = await apiFetch<Filter[]>(url);

    return result.success ? result.data : [];
  },

  async getImpactScore(
    mongoId: string,
    type: 'farm' | 'gate'
  ): Promise<any | null> {
    const endpoint = type === 'farm' ? 'GetImpactScoreFarm' : 'GetImpactScoreGate';
    const url = `${BASE_URL}/v2/Product/${endpoint}/${mongoId}`;
    const result = await apiFetch<any>(url);

    return result.success ? result.data : null;
  },
};
```

#### C. Brand Service (src/lib/api/brand.service.ts)

```typescript
import { env } from '@/config/env';
import { apiFetch } from './base';
import { BrandSchema, type Brand } from '@/types/brand';

const BASE_URL = env.api.foodbook;

export const brandService = {
  async getById(id: string, token?: string): Promise<Brand | null> {
    const url = `${BASE_URL}/v2/Brand/GetBrand/${id}`;
    const result = await apiFetch<any>(url, { token });

    if (!result.success) {
      return null;
    }

    const parsed = BrandSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async getAll(token?: string): Promise<Brand[]> {
    const url = `${BASE_URL}/v2/Brand/GetBrands`;
    const result = await apiFetch<any[]>(url, { token });

    if (!result.success) {
      return [];
    }

    return result.data
      .map((item) => BrandSchema.safeParse(item))
      .filter((parsed) => parsed.success)
      .map((parsed) => parsed.data!);
  },

  async getFilters(token?: string): Promise<any> {
    const url = `${BASE_URL}/v2/Brand/GetBrandFilters`;
    const result = await apiFetch<any>(url, { token });

    return result.success ? result.data : null;
  },
};
```

#### D. Catalog Service (src/lib/api/catalog.service.ts)

```typescript
import { env } from '@/config/env';
import { apiFetch } from './base';
import { CatalogThemeSchema, type CatalogTheme } from '@/types/catalog';

const BASE_URL = env.api.foodbook;

export const catalogService = {
  async getTheme(guid: string): Promise<CatalogTheme | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetTheme/${guid}`;
    const result = await apiFetch<any>(url);

    if (!result.success) {
      return null;
    }

    const parsed = CatalogThemeSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async getGuid(token: string, abbr: string): Promise<string | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetGuid/${token}/${abbr}`;
    const result = await apiFetch<{ guid: string }>(url);

    return result.success ? result.data.guid : null;
  },

  async getLogo(fileName: string): Promise<string | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetLogo/${fileName}`;
    const result = await apiFetch<{ base64: string }>(url);

    return result.success ? result.data.base64 : null;
  },

  async getBanner(fileName: string): Promise<string | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetBanner/${fileName}`;
    const result = await apiFetch<{ base64: string }>(url);

    return result.success ? result.data.base64 : null;
  },
};
```

#### E. Sheet Service (src/lib/api/sheet.service.ts)

```typescript
import { env } from '@/config/env';
import { apiFetch } from './base';
import type { Product } from '@/types/product';
import type { Culture } from '@/types/enums';

const BASE_URL = env.api.foodbook;

export const sheetService = {
  async getById(id: string, token?: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductSheet/${id}`;
    const result = await apiFetch<any>(url, { token });

    return result.success ? result.data : null;
  },

  async generatePdf(id: string, locale: Culture): Promise<Blob | null> {
    const url = `${BASE_URL}/v2/Product/GeneratePDF/${locale}/${id}`;
    const result = await apiFetch<Blob>(url);

    return result.success ? result.data : null;
  },
};
```

#### F. Auth Service (src/lib/api/auth.service.ts)

```typescript
import { env } from '@/config/env';
import { apiFetch } from './base';
import type { TokenValidation } from '@/types/auth';

const BASE_URL = env.api.foodbook;

export const authService = {
  async validateToken(token: string): Promise<TokenValidation> {
    const url = `${BASE_URL}/v2/Auth/Validate`;
    const result = await apiFetch<any>(url, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (!result.success) {
      return { isValid: false, error: 'Validation failed' };
    }

    return { isValid: true, payload: result.data };
  },

  async refreshToken(): Promise<string | null> {
    const url = `${BASE_URL}/v2/Auth/Refresh`;
    const result = await apiFetch<{ token: string }>(url, {
      method: 'POST',
    });

    return result.success ? result.data.token : null;
  },
};
```

#### G. TanStack Query Setup (src/lib/api/query-client.ts)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Query keys factory
export const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: any) => [...queryKeys.products.lists(), params] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    details: () => [...queryKeys.brands.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.brands.details(), id] as const,
  },
  catalogs: {
    all: ['catalogs'] as const,
    theme: (guid: string) => [...queryKeys.catalogs.all, 'theme', guid] as const,
  },
};
```

**src/components/providers/query-provider.tsx:**
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/api/query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Update **src/app/[locale]/layout.tsx** om QueryProvider toe te voegen.

### 4. UTILITIES

#### A. Helpers (src/lib/utils/helpers.ts)

```typescript
import { env } from '@/config/env';
import type { Culture } from '@/types/enums';
import type { LocalizedString } from '@/types/common';

export function getAppEnv(): string {
  return env.app.env || 'development';
}

export function getCookieName(): string {
  const envName = getAppEnv();

  switch (envName) {
    case 'test':
      return 'PsFoodbookTokenT';
    case 'staging':
      return 'PsFoodbookTokenST';
    default:
      return 'PsFoodbookToken';
  }
}

export function createSlug(id: string, name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${id}/${cleanName}`;
}

export function slugToText(slug: string): string {
  return slug
    .split('/')
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()) || '';
}

export function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
```

#### B. Translation (src/lib/utils/translation.ts)

```typescript
import type { Culture } from '@/types/enums';
import type { LocalizedString } from '@/types/common';

export function getTranslation(
  input: LocalizedString | string | undefined,
  locale: Culture
): string {
  if (!input) return '';
  if (typeof input === 'string') return input;

  const translation = input.translation?.find((t) => t.culture === locale);
  return translation?.value || input.value || '';
}

export function useTranslatedValue(
  input: LocalizedString | string | undefined,
  locale: Culture
): string {
  return getTranslation(input, locale);
}
```

#### C. URL Helpers (src/lib/utils/url.ts)

```typescript
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';
import { createSlug } from './helpers';

export function getHomeUrl(locale: Culture): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const localePath = locale === Culture.NL ? '' : `/${locale.split('-')[0]}`;

  return `${baseUrl}${localePath}`;
}

export function getLocalizedPath(locale: Culture, path: string): string {
  const localePrefix = locale === Culture.NL ? '' : `/${locale.split('-')[0]}`;
  return `${localePrefix}${path}`;
}

export function buildProductUrl(product: Product, locale: Culture): string {
  const id = product.product.summary.id;
  const name = product.product.summary.name.value;
  const slug = createSlug(id, name);

  return getLocalizedPath(locale, `/product/${slug}`);
}
```

#### D. Date Formatting (src/lib/utils/date.ts)

```typescript
import { format } from 'date-fns';
import { nl, enUS, de, fr } from 'date-fns/locale';
import type { Culture } from '@/types/enums';

const localeMap = {
  [Culture.NL]: nl,
  [Culture.EN]: enUS,
  [Culture.DE]: de,
  [Culture.FR]: fr,
};

export function formatDate(date: Date, locale: Culture): string {
  return format(date, 'dd-MM-yyyy', { locale: localeMap[locale] });
}

export function formatDateTime(date: Date, locale: Culture): string {
  return format(date, 'dd-MM-yyyy HH:mm', { locale: localeMap[locale] });
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

export function isOutdated(date: Date, yearsThreshold: number = 3): boolean {
  const now = new Date();
  const diffYears = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears > yearsThreshold;
}
```

#### E. Image Helpers (src/lib/utils/image.ts)

```typescript
import type { Product } from '@/types/product';
import { normalizeToArray } from './helpers';

const NO_IMAGE = '/images/no-image.png';

export function getProductImage(
  product: Product,
  size: 'small' | 'large' = 'small'
): string {
  const assetinfo = product.product?.logisticinfolist?.logisticinfo?.assetinfolist?.assetinfo;

  if (!assetinfo) return NO_IMAGE;

  const assets = normalizeToArray(assetinfo);
  const heroImage = assets.find((a) => a.isheroimage === 'true') || assets[0];

  if (!heroImage) return NO_IMAGE;

  if (size === 'large') {
    return (
      heroImage.highresolutionimage?.downloadurl ||
      heroImage.downloadurl ||
      NO_IMAGE
    );
  }

  return (
    heroImage.lowresolutionimage?.downloadurl || heroImage.downloadurl || NO_IMAGE
  );
}

export function getOptimizedImageUrl(url: string, width: number): string {
  if (!url || url === NO_IMAGE) return NO_IMAGE;

  // Next.js Image optimization
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}
```

#### F. Logger (src/lib/utils/logger.ts)

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: object;
  timestamp: string;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: string,
  meta?: object
): LogEntry {
  return {
    level,
    message,
    context,
    meta,
    timestamp: new Date().toISOString(),
  };
}

async function sendToApi(entry: LogEntry): Promise<void> {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.error('Failed to send log to API:', error);
  }
}

function log(level: LogLevel, message: string, context?: string, meta?: object): void {
  const entry = createLogEntry(level, message, context, meta);

  // Server-side: alleen console
  if (typeof window === 'undefined') {
    console[level](JSON.stringify(entry));
    return;
  }

  // Client-side: console + API
  console[level](message, context, meta);
  sendToApi(entry);
}

export const logger = {
  info: (message: string, context?: string, meta?: object) =>
    log('info', message, context, meta),
  warn: (message: string, context?: string, meta?: object) =>
    log('warn', message, context, meta),
  error: (message: string, context?: string, meta?: object) =>
    log('error', message, context, meta),
  debug: (message: string, context?: string, meta?: object) =>
    log('debug', message, context, meta),
};
```

**API Route: src/app/api/log/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // In production: send to logging service (Sentry, DataDog, etc.)
    console.log(JSON.stringify(body));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

#### G. Validation (src/lib/utils/validation.ts)

```typescript
export function validateEan(ean: string): boolean {
  // EAN-13 or EAN-8 validation
  if (!/^\d{8}$|^\d{13}$/.test(ean)) {
    return false;
  }

  // Checksum validation
  const digits = ean.split('').map(Number);
  const checksum = digits.pop()!;
  const sum = digits.reduce((acc, digit, i) => {
    return acc + digit * (i % 2 === 0 ? 1 : 3);
  }, 0);

  return (10 - (sum % 10)) % 10 === checksum;
}

export function validateGuid(guid: string): boolean {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
}

export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}
```

### 5. ENVIRONMENT CONFIG

**src/config/env.ts:**
```typescript
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || defaultValue!;
}

export const env = {
  app: {
    env: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development'),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  },
  api: {
    foodbook: getEnvVar('FOODBOOK_API_URL'),
    timeout: parseInt(getEnvVar('FOODBOOK_API_TIMEOUT', '15000')),
  },
  auth: {
    jwtSecret: getEnvVar('JWT_SECRET'),
    cookieDomain: getEnvVar('COOKIE_DOMAIN', 'localhost'),
    sessionDuration: parseInt(getEnvVar('SESSION_DURATION', '86400')),
  },
  permalink: {
    secret: getEnvVar('PERMALINK_SECRET'),
    maxAge: parseInt(getEnvVar('PERMALINK_MAX_AGE', '600')),
  },
  cache: {
    revalidate: parseInt(getEnvVar('CACHE_REVALIDATE', '300')),
    staleWhileRevalidate: parseInt(getEnvVar('CACHE_STALE_WHILE_REVALIDATE', '600')),
  },
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  },
  features: {
    impactScore: getEnvVar('FEATURE_IMPACT_SCORE', 'true') === 'true',
    pdfGeneration: getEnvVar('FEATURE_PDF_GENERATION', 'true') === 'true',
  },
} as const;
```

### 6. ZUSTAND STORES

#### A. Auth Store (src/stores/auth.store.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: 'ps-foodbook-auth',
    }
  )
);
```

#### B. Filter Store (src/stores/filter.store.ts)

```typescript
import { create } from 'zustand';
import type { Filter, FilterValue } from '@/types/filter';

interface FilterState {
  keyword: string;
  filters: Record<string, FilterValue>;
  pageIndex: number;
  pageSize: number;

  // Actions
  setKeyword: (keyword: string) => void;
  addFilter: (key: string, value: FilterValue) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  resetPagination: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  keyword: '',
  filters: {},
  pageIndex: 0,
  pageSize: 21,

  setKeyword: (keyword) =>
    set(() => ({ keyword, pageIndex: 0 })),

  addFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pageIndex: 0,
    })),

  removeFilter: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.filters;
      return { filters: rest, pageIndex: 0 };
    }),

  clearFilters: () =>
    set(() => ({ filters: {}, keyword: '', pageIndex: 0 })),

  setPage: (pageIndex) => set(() => ({ pageIndex })),

  resetPagination: () => set(() => ({ pageIndex: 0 })),
}));
```

### 7. TESTING SETUP

#### A. Test Utils (tests/utils/test-utils.tsx)

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/query-client';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const customRender = (ui: ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

#### B. Mock Data (tests/utils/mock-data.ts)

```typescript
import type { Product, ProductSummary } from '@/types/product';
import { Culture } from '@/types/enums';

export const mockProductSummary: ProductSummary = {
  id: '123',
  name: {
    value: 'Test Product',
    translation: [
      { value: 'Test Product', culture: Culture.EN },
      { value: 'Test Produkt', culture: Culture.DE },
    ],
  },
  ean: '1234567890123',
  brandname: 'Test Brand',
  packshot: 'https://example.com/image.jpg',
  publiclyvisible: 'true',
  lastupdatedon: new Date('2024-01-01'),
};

export const mockProduct: Product = {
  product: {
    mongoDbId: 'abc123',
    hasImpactScore: false,
    summary: mockProductSummary,
    productinfolist: {
      productinfo: {
        qualitymarkinfolist: undefined,
        fishingredientinfolist: undefined,
        characteristicinfolist: undefined,
      },
    },
    specificationinfolist: {
      specificationinfo: {
        ingredientset: undefined,
        allergenset: undefined,
        nutrientset: undefined,
      },
    },
  },
};
```

#### C. Example Test (tests/unit/utils/helpers.test.ts)

```typescript
import { describe, it, expect } from 'vitest';
import { createSlug, slugToText } from '@/lib/utils/helpers';

describe('helpers', () => {
  describe('createSlug', () => {
    it('creates a slug from id and name', () => {
      const result = createSlug('123', 'Test Product');
      expect(result).toBe('123/test-product');
    });

    it('handles special characters', () => {
      const result = createSlug('456', 'Café & Bar!');
      expect(result).toBe('456/caf-bar');
    });
  });

  describe('slugToText', () => {
    it('converts slug back to text', () => {
      const result = slugToText('123/test-product');
      expect(result).toBe('Test Product');
    });
  });
});
```

### 8. BASIC PAGES

#### src/app/[locale]/page.tsx (Homepage)

```typescript
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{t('search')}</h1>
      <p className="mt-4">Product search coming soon...</p>
    </main>
  );
}
```

#### src/app/[locale]/product/page.tsx

```typescript
export default function ProductSearchPage() {
  return (
    <div>
      <h1>Product Search</h1>
      <p>Coming soon...</p>
    </div>
  );
}
```

#### src/app/[locale]/product/[id]/page.tsx

```typescript
interface Props {
  params: { id: string; locale: string };
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <div>
      <h1>Product Detail: {params.id}</h1>
      <p>Coming soon...</p>
    </div>
  );
}
```

### 9. HEALTH CHECK ENDPOINT

**src/app/api/health/route.ts:**
```typescript
import { NextResponse } from 'next/server';
import { env } from '@/config/env';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.app.env,
    version: process.env.npm_package_version || '0.0.0',
  };

  return NextResponse.json(health);
}
```

---

## OUTPUT

- ✅ Werkende routing met 4 locales (nl, en, de, fr)
- ✅ API client layer volledig geïmplementeerd en gemodulariseerd
- ✅ Type-safe codebase met Zod schemas
- ✅ Utilities geïmplementeerd en getest
- ✅ Zustand stores werkend
- ✅ Placeholder pages met correct types
- ✅ TanStack Query configured
- ✅ Test infrastructure werkend
- ✅ Health check endpoint

---

## VERIFICATION

```bash
# 1. Dev server
npm run dev
# → Alle routes bereikbaar: /, /en/, /product, /product/123, etc.

# 2. Type check
npm run type-check
# → Geen TypeScript errors

# 3. Tests
npm run test
# → Alle tests passen

# 4. Linting
npm run lint
# → Geen linting errors

# 5. Test API calls (in browser console)
fetch('/api/health').then(r => r.json()).then(console.log)

# 6. Test locale switching
# → Navigeer naar /, /en/, /de/, /fr/

# 7. Test error boundaries
# → Gooi een error in een component

# 8. Test loading states
# → Check loading.tsx rendering
```

---

## OPMERKINGEN

Deze fase legt de fundamenten voor alle features. Alles moet 100% type-safe en getest zijn.

**Kritische checks:**
- [ ] Alle API services werken met mock data
- [ ] Zod schemas valideren correct
- [ ] Retry logic werkt (test met timeout)
- [ ] Rate limiting werkt (test met snelle requests)
- [ ] Locale routing werkt voor alle talen
- [ ] Type checking passeert zonder `any` types
- [ ] Error boundaries vangen errors
- [ ] Logger werkt client + server side

**Volgende stap:** Fase 2 - Authenticatie
