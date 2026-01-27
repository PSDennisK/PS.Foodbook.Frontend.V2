import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Set up test environment variables
process.env.FOODBOOK_API_URL = 'https://api.test.com';
process.env.JWT_SECRET = 'test-secret';
process.env.PERMALINK_SECRET = 'test-permalink-secret';

// Polyfill ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};
