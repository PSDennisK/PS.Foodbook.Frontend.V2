import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type RenderOptions, render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';
import nlMessages from '../../messages/nl.json';

// Create a new QueryClient for each test to avoid state pollution
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests for faster failures
        gcTime: 0, // Immediately garbage collect
      },
    },
  });

let testQueryClient: QueryClient;

const AllProviders = ({ children }: { children: React.ReactNode }) => {
  // Create QueryClient once per test (not on every render)
  if (!testQueryClient) {
    testQueryClient = createTestQueryClient();
  }
  return (
    <QueryClientProvider client={testQueryClient}>
      <NextIntlClientProvider locale="nl" messages={nlMessages}>
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: RenderOptions) => {
  // Reset QueryClient before each render
  testQueryClient = createTestQueryClient();
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render };
