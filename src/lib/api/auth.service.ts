import { env } from '@/config/env';
import type { JWTPayload, TokenValidation } from '@/types/auth';
import { apiFetch } from './base';

function getBaseUrl(): string {
  // Check if we're in client context - if so, we should use API routes instead
  const isClient = typeof window !== 'undefined';
  if (isClient) {
    // Client should use Next.js API routes, not direct API calls
    // This function shouldn't be called from client, but if it is, throw a clear error
    throw new Error(
      'Direct API calls from client are not allowed. Use Next.js API routes instead.'
    );
  }
  return env.api.foodbook;
}

export const authService = {
  async validateToken(token: string): Promise<TokenValidation> {
    // Check if we're in client context - use API route instead
    const isClient = typeof window !== 'undefined';

    if (isClient) {
      // Use Next.js API route for client-side validation
      const result = await apiFetch<{ isValid: boolean; payload?: JWTPayload; error?: string }>(
        '/api/auth/validate',
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        }
      );

      if (!result.success) {
        return { isValid: false, error: 'Validation failed' };
      }

      return {
        isValid: result.data.isValid,
        payload: result.data.payload,
        error: result.data.error,
      };
    }

    // Server-side: use direct API call
    const url = `${getBaseUrl()}/v2/Auth/Validate`;
    const result = await apiFetch<unknown>(url, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (!result.success) {
      return { isValid: false, error: 'Validation failed' };
    }

    return { isValid: true, payload: result.data as JWTPayload };
  },

  async refreshToken(): Promise<string | null> {
    // Check if we're in client context
    const isClient = typeof window !== 'undefined';

    if (isClient) {
      // Client should use API route (if one exists) or this shouldn't be called from client
      throw new Error('Token refresh should be handled server-side');
    }

    // Server-side: use direct API call
    const url = `${getBaseUrl()}/v2/Auth/Refresh`;
    const result = await apiFetch<{ token: string }>(url, {
      method: 'POST',
    });

    return result.success ? result.data.token : null;
  },
};
