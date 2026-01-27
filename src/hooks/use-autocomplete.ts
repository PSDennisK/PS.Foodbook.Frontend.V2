'use client';
import { useCallback, useState } from 'react';

import type { Culture } from '@/types/enums';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from './use-debounced-value';

interface UseAutocompleteOptions {
  locale: Culture;
  minLength?: number;
  debounceMs?: number;
}

type AutocompleteResponse =
  | string[]
  | {
      products?: { id: number; name: string; brand?: string | null }[];
      brands?: { id: number; name: string }[];
    };

export function useAutocomplete({
  locale,
  minLength = 3,
  debounceMs = 300,
}: UseAutocompleteOptions) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, debounceMs);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['autocomplete', debouncedKeyword, locale],
    queryFn: async () => {
      const response = await fetch(
        `/api/autocomplete?q=${encodeURIComponent(debouncedKeyword)}&locale=${locale}`,
      );

            console.log('autocomplete response', response);

      if (!response.ok) {
        return [];
      }

      const json = (await response.json()) as { suggestions: AutocompleteResponse };
      const rawSuggestions = json.suggestions;

      // Backend may return a flat string array or a structured object
      if (Array.isArray(rawSuggestions)) {
        return rawSuggestions;
      }

      const productNames =
        rawSuggestions.products?.map((product) =>
          product.brand ? `${product.name} – ${product.brand}` : product.name,
        ) ?? [];

      const brandNames = rawSuggestions.brands?.map((brand) => brand.name) ?? [];

      return [...productNames, ...brandNames];
    },
    enabled: debouncedKeyword.length >= minLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const reset = useCallback(() => {
    setKeyword('');
  }, []);

  return {
    keyword,
    setKeyword,
    suggestions,
    isLoading,
    reset,
  };
}