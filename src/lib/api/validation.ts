import { z } from 'zod';

import { Culture } from '@/types/enums';

/**
 * Validation schemas for API routes
 * These schemas ensure type safety and input validation at the API boundary
 */

// Culture enum validation
const cultureSchema = z.nativeEnum(Culture);

// Search API request validation (body only, token comes from header)
export const searchParamsSchema = z.object({
  keyword: z.string().trim().max(200).optional(),
  filters: z
    .record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.array(z.string()),
        z.array(z.number()),
        z.object({
          min: z.number(),
          max: z.number(),
        }),
      ])
    )
    .optional(),
  page: z.number().int().min(0).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type SearchParamsInput = z.infer<typeof searchParamsSchema>;

// Autocomplete API query params validation
export const autocompleteParamsSchema = z.object({
  q: z.string().trim().min(1).max(200),
  locale: cultureSchema,
  securityToken: z.string().max(500).optional(),
});

export type AutocompleteParamsInput = z.infer<typeof autocompleteParamsSchema>;

// Log API request validation
export const logEntrySchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']),
  message: z.string().trim().min(1).max(1000),
  timestamp: z.string().datetime().optional(),
  context: z.record(z.unknown()).optional(),
  stack: z.string().max(5000).optional(),
});

export type LogEntryInput = z.infer<typeof logEntrySchema>;

// Auth API validation
export const validateTokenSchema = z.object({
  token: z.string().min(1).max(2000),
});

export type ValidateTokenInput = z.infer<typeof validateTokenSchema>;

/**
 * Helper function to validate request body with Zod schema
 * Returns parsed data or throws validation error with details
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Request validation failed', formattedErrors);
    }
    throw error;
  }
}

/**
 * Helper function to validate query parameters with Zod schema
 */
export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new ValidationError('Query parameter validation failed', formattedErrors);
    }
    throw error;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
