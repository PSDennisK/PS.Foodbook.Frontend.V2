# PS Foodbook App

Modern Next.js 15 applicatie voor PS in Foodservice productcatalogus.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Development

```bash
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
```

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

```bash
npm run build
npm start
```

## Development Tools

- **Biome**: Linting and formatting
- **Husky**: Git hooks for pre-commit checks
- **Turbopack**: Fast dev builds

## License

Private - PS in Foodservice
