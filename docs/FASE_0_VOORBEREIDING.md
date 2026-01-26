# FASE 0: VOORBEREIDING - Claude Code Prompt

**Project:** PS.Foodbook.Frontend Modernisering  
**Fase:** 0 - Voorbereiding  
**Duur:** 1 week  
**Doel:** Project setup en tooling  

---

## CONTEXT

Ik ga de PS.Foodbook.Frontend applicatie moderniseren van Next.js 14 naar Next.js 15.
Dit is Fase 0: Project setup en tooling.

## DOEL

Creëer een nieuwe Next.js 15 applicatie met TypeScript, Tailwind CSS, shadcn/ui, 
TanStack Query, Biome, en Vitest. Setup een moderne development environment.

---

## REQUIREMENTS

### 1. PROJECT INITIALISATIE

- Maak een nieuw Next.js 15 project aan: "ps-foodbook-app"
- Gebruik TypeScript in strict mode
- Gebruik de App Router (geen Pages Router)
- Gebruik src/ directory structuur
- Voeg Turbopack toe voor dev mode

### 2. TECH STACK SETUP

#### A. Core Dependencies
```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.7.0"
}
```

#### B. UI & Styling
```json
{
  "tailwindcss": "^4.0.0",
  "lucide-react": "^0.462.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.0"
}
```
- Installeer shadcn/ui via: `npx shadcn@latest init`

#### C. State & Data
```json
{
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.59.0",
  "@tanstack/react-query-devtools": "^5.59.0"
}
```

#### D. Forms & Validation
```json
{
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.9.0"
}
```

#### E. Utils
```json
{
  "jose": "^5.9.0",
  "date-fns": "^4.1.0",
  "lodash": "^4.17.21"
}
```

#### F. Testing
```json
{
  "vitest": "^2.1.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.6.0",
  "@playwright/test": "^1.48.0"
}
```

#### G. Linting & Formatting
```json
{
  "@biomejs/biome": "^1.9.0"
}
```
*Vervang ESLint + Prettier met Biome*

### 3. PROJECT STRUCTUUR

Creëer de volgende folder structuur:

```
ps-foodbook-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   ├── components/
│   │   ├── ui/          # shadcn/ui components
│   │   ├── product/
│   │   ├── catalog/
│   │   ├── search/
│   │   └── layout/
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── cache/
│   │   └── utils/
│   ├── hooks/
│   ├── stores/
│   ├── types/
│   └── config/
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .husky/
├── biome.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── .env.local.example
├── .gitignore
└── README.md
```

### 4. CONFIGURATIE BESTANDEN

#### A. TypeScript (tsconfig.json)
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

#### B. Biome (biome.json)
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

#### C. Tailwind (tailwind.config.ts)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // PS Foodservice kleuren (placeholders)
        'ps-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... meer tinten
          900: '#1e3a8a',
        },
        'ps-green': {
          // ... groene tinten
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
export default config;
```

#### D. Next.js (next.config.ts)
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.psinfoodservice.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### E. Vitest (vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '.next/'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### F. Playwright (playwright.config.ts)
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5. SCRIPTS

package.json scripts:
```json
{
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
    "test:e2e:ui": "playwright test --ui",
    "type-check": "tsc --noEmit"
  }
}
```

### 6. GIT & HUSKY

- Git init
- .gitignore (Next.js, node_modules, .env.local, etc.)
- Husky pre-commit hook: `npx husky add .husky/pre-commit "npm run lint"`
- lint-staged configuratie

### 7. ENVIRONMENT VARIABLES

Creëer `.env.local.example`:
```bash
# App
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API
FOODBOOK_API_URL=https://api.psinfoodservice.com
FOODBOOK_API_TIMEOUT=15000

# Auth
JWT_SECRET=your-secret-here
COOKIE_DOMAIN=localhost
SESSION_DURATION=86400

# Permalink
PERMALINK_SECRET=your-secret-here
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

### 8. README.md

Schrijf een uitgebreide README met:

```markdown
# PS Foodbook App

Modern Next.js 15 applicatie voor PS in Foodservice productcatalogus.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
# Start dev server met Turbopack
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
\`\`\`

## Project Structure

- `src/app/` - Next.js App Router
- `src/components/` - React componenten
- `src/lib/` - Utilities en API clients
- `src/stores/` - Zustand state management
- `src/types/` - TypeScript types
- `tests/` - Test files

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5.7
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- Zustand
- Vitest + Playwright

## Environment Variables

Copy `.env.local.example` to `.env.local` and update values.

## Testing

- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Coverage: `npm run test -- --coverage`

## Building

\`\`\`bash
npm run build
npm start
\`\`\`
```

### 9. INITIAL COMPONENTS

Creëer basis components:

#### src/app/layout.tsx
```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PS Foodbook',
  description: 'Product catalogus voor PS in Foodservice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
```

#### src/app/page.tsx
```typescript
export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">PS Foodbook</h1>
      <p className="mt-4">Welkom bij de nieuwe Foodbook applicatie</p>
    </main>
  );
}
```

#### src/lib/utils/cn.ts
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### src/config/site.ts
```typescript
export const siteConfig = {
  name: 'PS Foodbook',
  description: 'Product catalogus voor PS in Foodservice',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  locales: ['nl', 'en', 'de', 'fr'] as const,
  defaultLocale: 'nl' as const,
};

export type Locale = (typeof siteConfig.locales)[number];
```

### 10. SHADCN/UI COMPONENTS

Installeer deze basis components via shadcn CLI:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add slider
npx shadcn@latest add tabs
npx shadcn@latest add skeleton
npx shadcn@latest add toast
```

---

## OUTPUT

- ✅ Volledig werkend Next.js 15 project
- ✅ Alle dependencies geïnstalleerd
- ✅ Alle configuratie bestanden correct
- ✅ Basis folder structuur
- ✅ README met setup instructies
- ✅ Git repository geïnitialiseerd
- ✅ Dev server kan starten (npm run dev)
- ✅ Tests kunnen draaien (npm test)
- ✅ Build succesvol (npm run build)

---

## VERIFICATION

Na afloop, run deze commands om te verifiëren:

```bash
# 1. Start dev server
npm run dev
# → Moet starten zonder errors op http://localhost:3000

# 2. Linting
npm run lint
# → Geen errors

# 3. Type checking
npm run type-check
# → Geen TypeScript errors

# 4. Tests
npm test
# → Alle tests passen (als er tests zijn)

# 5. Build
npm run build
# → Build succesvol
```

---

## OPMERKINGEN

Dit is de basis voor alle volgende fases. Zorg dat alles perfect werkt voordat je verder gaat.

**Belangrijke checks:**
- [ ] Dev server start zonder errors
- [ ] Tailwind CSS werkt (test met classes)
- [ ] shadcn/ui components zijn geïnstalleerd
- [ ] Path aliases werken (@/)
- [ ] Biome linting werkt
- [ ] TypeScript strict mode is aan
- [ ] Git hooks werken (pre-commit)
- [ ] Environment variables laden correct

**Volgende stap:** Fase 1 - Core Architectuur
