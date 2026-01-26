import { env } from '@/config/env';
import type { JWTPayload, TokenValidation } from '@/types/auth';
import { apiFetch } from './base';

const BASE_URL = env.api.foodbook;

export const authService = {
  async validateToken(token: string): Promise<TokenValidation> {
    const url = `${BASE_URL}/v2/Auth/Validate`;
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
    const url = `${BASE_URL}/v2/Auth/Refresh`;
    const result = await apiFetch<{ token: string }>(url, {
      method: 'POST',
    });

    return result.success ? result.data.token : null;
  },
};
