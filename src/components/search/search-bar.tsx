'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { useFilterStore } from '@/stores/filter.store';
import type { Culture } from '@/types/enums';
import { Search, X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

export function SearchBar() {
  const locale = useLocale() as Culture;
  const { keyword: storeKeyword, setKeyword: setStoreKeyword } = useFilterStore();
  const { keyword, setKeyword, suggestions, isLoading } = useAutocomplete({ locale });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize with store keyword
  useEffect(() => {
    if (storeKeyword && !keyword) {
      setKeyword(storeKeyword);
    }
  }, [storeKeyword, keyword, setKeyword]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setStoreKeyword(keyword);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setKeyword(suggestion);
    setStoreKeyword(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setKeyword('');
    setStoreKeyword('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Zoek op productnaam, EAN, merk..."
          className="pl-10 pr-24"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {keyword && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-7 w-7"
              aria-label="Wis zoekopdracht"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" onClick={handleSearch} size="sm" className="h-8">
            Zoeken
          </Button>
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">Laden...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
