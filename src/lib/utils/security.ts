import crypto from 'node:crypto';

// PBKDF2 iterations - OWASP recommends 10,000+ for PBKDF2-HMAC-SHA256
// We use 100,000 for better security (2024 standards)
const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 64;
const HASH_ALGORITHM = 'sha512';

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token: string, expected: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    // If buffers are different lengths, timingSafeEqual throws
    return false;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_LENGTH, HASH_ALGORITHM)
    .toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(':');
  if (!salt || !hash) return false;

  const verifyHash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_LENGTH, HASH_ALGORITHM)
    .toString('hex');
  return hash === verifyHash;
}
