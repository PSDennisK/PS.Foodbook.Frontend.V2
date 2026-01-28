/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  /**
   * Unique identifier for this rate limiter (e.g., 'api-log', 'api-search')
   */
  id: string;
  /**
   * Maximum number of requests allowed within the window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request is allowed based on rate limiting rules
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param config - Rate limiting configuration
 * @returns Rate limit result with success flag and headers info
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const key = `${config.id}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired entry - allow and create new
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: resetTime,
    };
  }

  // Entry exists and not expired
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Extract client identifier from request
 * Tries multiple headers for proxy/CDN compatibility
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxy/CDN setups)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (Node.js specific)
  // In production with reverse proxy, this might not be reliable
  return 'unknown';
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Very strict - for sensitive operations
  STRICT: {
    limit: 10,
    windowMs: 60 * 1000, // 10 requests per minute
  },
  // Normal - for general API usage
  NORMAL: {
    limit: 60,
    windowMs: 60 * 1000, // 60 requests per minute
  },
  // Relaxed - for search/read operations
  RELAXED: {
    limit: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
  // Logging - stricter for abuse prevention
  LOGGING: {
    limit: 30,
    windowMs: 60 * 1000, // 30 log entries per minute
  },
} as const;
