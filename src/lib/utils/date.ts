import { Culture } from '@/types/enums';
import { format } from 'date-fns';
import { de, enUS, fr, nl } from 'date-fns/locale';

const localeMap = {
  [Culture.NL]: nl,
  [Culture.EN]: enUS,
  [Culture.DE]: de,
  [Culture.FR]: fr,
};

export function formatDate(date: Date, locale: Culture): string {
  return format(date, 'dd-MM-yyyy', { locale: localeMap[locale] });
}

export function formatDateTime(date: Date, locale: Culture): string {
  return format(date, 'dd-MM-yyyy HH:mm', { locale: localeMap[locale] });
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

export function isOutdated(date: Date, yearsThreshold = 3): boolean {
  const now = new Date();
  const diffYears = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return diffYears > yearsThreshold;
}
