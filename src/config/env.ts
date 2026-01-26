
function getEnvVar(key: string, defaultValue?: string): string {
  // Check if we're in browser/client context
  // In test environments (Vitest with jsdom), window exists but we're still in Node.js
  // If we're in Node.js runtime (have process.versions.node), we're not in a client context
  const isNodeRuntime = typeof process !== 'undefined' && process.versions?.node !== undefined;
  const isClient = typeof window !== 'undefined' && !isNodeRuntime;
  
  // Server-only env vars are not available in client
  const isServerOnly = !key.startsWith('NEXT_PUBLIC_');
  
  if (isClient && isServerOnly) {
    // In client context, server-only env vars should not be accessed
    // Return placeholder or throw if no default
    if (defaultValue === undefined) {
      throw new Error(
        `Cannot access server-only environment variable '${key}' in client context. ` +
        `This variable should only be accessed server-side.`
      );
    }
    return defaultValue;
  }

  const value = process.env[key];
  if (!value) {
    if (defaultValue === undefined) {
      // Check if we're in build phase
      const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

      if (isBuildPhase) {
        // During build, use placeholder to prevent errors
        // These will be validated at runtime
        return `__${key}__`;
      }
      throw new Error(`Missing environment variable: ${key}`);
    }
    return defaultValue;
  }
  return value;
}

export const env = {
  app: {
    get env() {
      return getEnvVar('NEXT_PUBLIC_APP_ENV', 'development');
    },
    get url() {
      return getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
    },
  },
  api: {
    get foodbook() {
      return getEnvVar('FOODBOOK_API_URL');
    },
    get timeout() {
      return Number.parseInt(getEnvVar('FOODBOOK_API_TIMEOUT', '15000'));
    },
  },
  auth: {
    get jwtSecret() {
      return getEnvVar('JWT_SECRET');
    },
    get cookieDomain() {
      return getEnvVar('COOKIE_DOMAIN', 'localhost');
    },
    get sessionDuration() {
      return Number.parseInt(getEnvVar('SESSION_DURATION', '86400'));
    },
  },
  permalink: {
    get secret() {
      return getEnvVar('PERMALINK_SECRET');
    },
    get maxAge() {
      return Number.parseInt(getEnvVar('PERMALINK_MAX_AGE', '600'));
    },
  },
  cache: {
    get revalidate() {
      return Number.parseInt(getEnvVar('CACHE_REVALIDATE', '300'));
    },
    get staleWhileRevalidate() {
      return Number.parseInt(getEnvVar('CACHE_STALE_WHILE_REVALIDATE', '600'));
    },
  },
  analytics: {
    get gtmId() {
      return process.env.NEXT_PUBLIC_GTM_ID;
    },
  },
  features: {
    get impactScore() {
      return getEnvVar('FEATURE_IMPACT_SCORE', 'true') === 'true';
    },
    get pdfGeneration() {
      return getEnvVar('FEATURE_PDF_GENERATION', 'true') === 'true';
    },
  },
} as const;