import crypto from 'node:crypto';

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
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(':');
  if (!salt || !hash) return false;

  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}
