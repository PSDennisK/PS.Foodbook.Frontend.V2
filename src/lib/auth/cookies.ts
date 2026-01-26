import { env } from '@/config/env';
import { getCookieName } from '@/lib/utils/helpers';
import { cookies } from 'next/headers';

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookieName = getCookieName();

  return cookieStore.get(cookieName)?.value;
}

export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName();

  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: env.app.env === 'production',
    sameSite: 'lax',
    maxAge: env.auth.sessionDuration,
    path: '/',
    domain: env.auth.cookieDomain,
  });
}

export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName();

  cookieStore.delete(cookieName);
}
