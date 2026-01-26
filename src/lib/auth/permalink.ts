import { env } from '@/config/env';
import type { PermalinkParams } from '@/types/auth';

/**
 * Timing-safe comparison of two strings/arrays
 * Prevents timing attacks by comparing all bytes regardless of early differences
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    const aByte = a[i];
    const bByte = b[i];
    if (aByte !== undefined && bByte !== undefined) {
      result |= aByte ^ bByte;
    } else {
      return false;
    }
  }

  return result === 0;
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPermalinkSignature(params: PermalinkParams): Promise<boolean> {
  const { productId, expires, signature } = params;

  // Check expiry
  const expiryTime = Number.parseInt(expires);
  if (Number.isNaN(expiryTime) || Date.now() > expiryTime * 1000) {
    return false;
  }

  // Verify signature
  const message = `${productId}:${expires}`;
  const expectedSignature = await computeHMAC(message, env.permalink.secret);

  // Timing-safe comparison
  try {
    const signatureBytes = hexToBytes(signature);
    const expectedBytes = hexToBytes(expectedSignature);
    return timingSafeEqual(signatureBytes, expectedBytes);
  } catch {
    // If hex strings are invalid, return false
    return false;
  }
}

export async function generatePermalinkSignature(
  productId: string,
  expiresInSeconds: number = env.permalink.maxAge
): Promise<PermalinkParams> {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const message = `${productId}:${expires}`;
  const signature = await computeHMAC(message, env.permalink.secret);

  return {
    productId,
    expires: expires.toString(),
    signature,
  };
}

/**
 * Compute HMAC-SHA256 using Web Crypto API (Edge Runtime compatible)
 */
async function computeHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  // Import the secret as a key for HMAC
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the message
  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  // Convert to hex string
  return bytesToHex(new Uint8Array(signature));
}
