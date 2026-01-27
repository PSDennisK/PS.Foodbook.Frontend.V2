import { env } from '@/config/env';

export function getAppEnv(): string {
  return env.app.env || 'development';
}

export function getCookieName(): string {
  const envName = getAppEnv();

  switch (envName) {
    case 'test':
      return 'PsFoodbookTokenT';
    case 'staging':
      return 'PsFoodbookTokenST';
    default:
      return 'PsFoodbookToken';
  }
}

export function createSlug(id: string, name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${id}-${cleanName}`;
}

export function slugToText(slug: string): string {
  // Slug format is now "id-name" instead of "id/name"
  // Extract the name part (everything after the first dash)
  const parts = slug.split('-');
  if (parts.length > 1) {
    // Remove the ID part (first element) and join the rest
    const namePart = parts.slice(1).join('-');
    return namePart.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
  // Fallback: if no dash, treat entire slug as name
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractIdFromSlug(slug: string): string {
  // Slug format is "id-name" or "id/name" or just "id"
  // Extract ID by taking everything before the first dash or slash
  const match = slug.match(/^(\d+)/);
  return match?.[1] ? match[1] : slug.split(/[-/]/)[0] || slug;
}

export function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
