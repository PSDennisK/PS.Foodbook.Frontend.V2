import type { LocalizedString } from '@/types/common';
import type { Culture } from '@/types/enums';

export function getTranslation(
  input: LocalizedString | string | undefined,
  locale: Culture
): string {
  if (!input) return '';
  if (typeof input === 'string') return input;

  const translation = input.translation?.find((t) => t.culture === locale);
  return translation?.value || input.value || '';
}

export function useTranslatedValue(
  input: LocalizedString | string | undefined,
  locale: Culture
): string {
  return getTranslation(input, locale);
}
