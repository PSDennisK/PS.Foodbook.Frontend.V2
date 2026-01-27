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

export async function apiFetch<T>(url: string, options: FetchOptions = {}): Promise<ApiResult<T>> {
  // Skip API calls during build if URL contains placeholder (from env.ts)
  if (url.includes('__') || url.startsWith('__')) {
    return {
      success: false,
      error: {
        message: 'API URL not configured (build-time placeholder)',
        status: 0,
      },
    };
  }

  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    token,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await enforceRateLimit();

      const controller = new AbortController();
      const timeoutMs = timeout * 2 ** (attempt - 1);
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
          const delayMs = retryAfter ? Number.parseInt(retryAfter) * 1000 : 2 ** attempt * 1000;

          logger.warn(`API error ${response.status}, retrying (${attempt}/${retries})`, 'apiFetch');

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
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000));
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
