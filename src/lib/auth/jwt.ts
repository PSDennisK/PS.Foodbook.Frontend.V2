import { env } from '@/config/env';
import type { JWTPayload } from '@/types/auth';
import { SignJWT, jwtVerify } from 'jose';

function getSecret(): Uint8Array {
  // Use Buffer in Node.js environments (including tests), TextEncoder in browser
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(env.auth.jwtSecret, 'utf-8'));
  }
  return new TextEncoder().encode(env.auth.jwtSecret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function createToken(payload: JWTPayload): Promise<string> {
  // Extract standard claims and additional data
  const { sub, ...additionalClaims } = payload;

  // Filter out standard JWT claims (iat, exp, etc.) from additional claims
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { iat, exp, ...otherClaims } = additionalClaims;

  // Filter out undefined values
  const cleanClaims: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(otherClaims)) {
    if (value !== undefined) {
      cleanClaims[key] = value;
    }
  }

  // Create JWT - always use automatic timestamps
  // Pass empty object if no additional claims
  const payloadToSign = Object.keys(cleanClaims).length > 0 ? cleanClaims : {};

  const jwt = new SignJWT(payloadToSign)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(`${env.auth.sessionDuration}s`);

  const token = await jwt.sign(getSecret());
  return token;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: JWTPayload): boolean {
  if (!payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
