import type { Culture } from './enums';

export interface Translation {
  value: string;
  culture: Culture;
}

export interface LocalizedString {
  value: string;
  translation?: Translation[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total?: number;
}
