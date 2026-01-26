'use client';

import { getCookieName } from '@/lib/utils/helpers';

export function getClientAuthToken(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const cookieName = getCookieName();
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName && value) {
      return decodeURIComponent(value);
    }
  }

  return undefined;
}
