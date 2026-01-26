function getEnvVar(key: string, defaultValue?: string): string {
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
    env: getEnvVar('NEXT_PUBLIC_APP_ENV', 'development'),
    url: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  },
  api: {
    foodbook: getEnvVar('FOODBOOK_API_URL'),
    timeout: Number.parseInt(getEnvVar('FOODBOOK_API_TIMEOUT', '15000')),
  },
  auth: {
    jwtSecret: getEnvVar('JWT_SECRET'),
    cookieDomain: getEnvVar('COOKIE_DOMAIN', 'localhost'),
    sessionDuration: Number.parseInt(getEnvVar('SESSION_DURATION', '86400')),
  },
  permalink: {
    secret: getEnvVar('PERMALINK_SECRET'),
    maxAge: Number.parseInt(getEnvVar('PERMALINK_MAX_AGE', '600')),
  },
  cache: {
    revalidate: Number.parseInt(getEnvVar('CACHE_REVALIDATE', '300')),
    staleWhileRevalidate: Number.parseInt(getEnvVar('CACHE_STALE_WHILE_REVALIDATE', '600')),
  },
  analytics: {
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  },
  features: {
    impactScore: getEnvVar('FEATURE_IMPACT_SCORE', 'true') === 'true',
    pdfGeneration: getEnvVar('FEATURE_PDF_GENERATION', 'true') === 'true',
  },
} as const;
