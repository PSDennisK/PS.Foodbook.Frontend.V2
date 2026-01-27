import { createSlug, slugToText } from '@/lib/utils/helpers';
import { describe, expect, it } from 'vitest';

describe('helpers', () => {
  describe('createSlug', () => {
    it('creates a slug from id and name', () => {
      const result = createSlug('123', 'Test Product');
      expect(result).toBe('123-test-product');
    });

    it('handles special characters', () => {
      const result = createSlug('456', 'Café & Bar!');
      expect(result).toBe('456-caf-bar');
    });
  });

  describe('slugToText', () => {
    it('converts slug back to text', () => {
      const result = slugToText('123-test-product');
      expect(result).toBe('Test Product');
    });
  });
});
