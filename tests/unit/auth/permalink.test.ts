import { generatePermalinkSignature, verifyPermalinkSignature } from '@/lib/auth/permalink';
import { describe, expect, it } from 'vitest';

describe('Permalink security', () => {
  describe('generatePermalinkSignature', () => {
    it('generates valid permalink signature', async () => {
      const productId = '123';
      const params = await generatePermalinkSignature(productId, 600);

      expect(params.productId).toBe(productId);
      expect(params.expires).toBeDefined();
      expect(params.signature).toBeDefined();
      expect(typeof params.signature).toBe('string');
      expect(params.signature.length).toBeGreaterThan(0);
    });

    it('generates different signatures for different products', async () => {
      const params1 = await generatePermalinkSignature('123', 600);
      const params2 = await generatePermalinkSignature('456', 600);

      expect(params1.signature).not.toBe(params2.signature);
    });
  });

  describe('verifyPermalinkSignature', () => {
    it('verifies valid permalink signature', async () => {
      const productId = '123';
      const params = await generatePermalinkSignature(productId, 600);

      const isValid = await verifyPermalinkSignature(params);
      expect(isValid).toBe(true);
    });

    it('rejects expired permalink', async () => {
      const params = {
        productId: '123',
        expires: '1000000000', // Way in the past (Sep 9, 2001)
        signature: 'invalid',
      };

      const isValid = await verifyPermalinkSignature(params);
      expect(isValid).toBe(false);
    });

    it('rejects tampered product ID', async () => {
      const productId = '123';
      const params = await generatePermalinkSignature(productId, 600);

      // Tamper with the product ID
      const tamperedParams = {
        ...params,
        productId: '456',
      };

      const isValid = await verifyPermalinkSignature(tamperedParams);
      expect(isValid).toBe(false);
    });

    it('rejects tampered signature', async () => {
      const productId = '123';
      const params = await generatePermalinkSignature(productId, 600);

      // Tamper with the signature
      const tamperedParams = {
        ...params,
        signature: 'tampered_signature',
      };

      const isValid = await verifyPermalinkSignature(tamperedParams);
      expect(isValid).toBe(false);
    });

    it('rejects invalid expires format', async () => {
      const params = {
        productId: '123',
        expires: 'not-a-number',
        signature: 'signature',
      };

      const isValid = await verifyPermalinkSignature(params);
      expect(isValid).toBe(false);
    });
  });
});
