'use client';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useFilterStore } from '@/stores/filter.store';
import { FilterType } from '@/types/enums';
import type { Filter, FilterValue } from '@/types/filter';

interface FilterSidebarProps {
  filters: Filter[];
}

export function FilterSidebar({ filters }: FilterSidebarProps) {
  const { filters: activeFilters, clearFilters } = useFilterStore();
  const activeFilterCount = Object.keys(activeFilters).length;

  const uniqueFilters = useMemo(() => {
    const seen = new Set<string>();
    return filters.filter((filter) => {
      if (seen.has(filter.key)) {
        return false;
      }
      seen.add(filter.key);
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Filters</h2>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Wis alles ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {uniqueFilters.map((filter) => (
          <FilterSection key={filter.key} filter={filter} />
        ))}
      </div>
    </div>
  );
}

interface FilterSectionProps {
  filter: Filter;
}

function FilterSection({ filter }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { filters: activeFilters } = useFilterStore();
  const activeValue = activeFilters[filter.key];

  return (
    <div className="border-b pb-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors"
      >
        <span className="font-medium text-sm">{filter.label}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {filter.type === FilterType.CHECKBOX && (
            <CheckboxFilter filter={filter} activeValue={activeValue} />
          )}
          {filter.type === FilterType.RANGE && (
            <RangeFilter filter={filter} activeValue={activeValue} />
          )}
          {filter.type === FilterType.SELECT && (
            <SelectFilter filter={filter} activeValue={activeValue} />
          )}
        </div>
      )}
    </div>
  );
}

interface FilterComponentProps {
  filter: Filter;
  activeValue: FilterValue | undefined;
}

function CheckboxFilter({ filter, activeValue }: FilterComponentProps) {
  const { addFilter, removeFilter } = useFilterStore();
  const selectedValues = Array.isArray(activeValue) ? activeValue.map(String) : [];

  const handleToggle = (optionId: string | number) => {
    const currentValues = [...selectedValues];
    const stringId = String(optionId);

    if (currentValues.includes(stringId)) {
      const newValues = currentValues.filter((v) => v !== stringId);
      if (newValues.length === 0) {
        removeFilter(filter.key);
      } else {
        addFilter(filter.key, newValues as FilterValue);
      }
    } else {
      addFilter(filter.key, [...currentValues, stringId] as FilterValue);
    }
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {filter.options?.map((option) => {
        const isChecked = selectedValues.includes(String(option.id));
        return (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={`${filter.key}-${option.id}`}
              checked={isChecked}
              onCheckedChange={() => handleToggle(option.id)}
            />
            <Label htmlFor={`${filter.key}-${option.id}`} className="text-sm cursor-pointer flex-1">
              {option.label}
              {option.count !== undefined && (
                <span className="text-muted-foreground ml-1">({option.count})</span>
              )}
            </Label>
          </div>
        );
      })}
    </div>
  );
}

function RangeFilter({ filter, activeValue }: FilterComponentProps) {
  const { addFilter, removeFilter } = useFilterStore();
  const min = filter.min ?? 0;
  const max = filter.max ?? 100;

  const currentRange =
    activeValue && typeof activeValue === 'object' && 'min' in activeValue && 'max' in activeValue
      ? { min: activeValue.min, max: activeValue.max }
      : { min, max };

  const handleChange = (values: number[]) => {
    const [newMin = min, newMax = max] = values;
    if (newMin === min && newMax === max) {
      removeFilter(filter.key);
    } else {
      addFilter(filter.key, { min: newMin, max: newMax } as FilterValue);
    }
  };

  const handleReset = () => {
    removeFilter(filter.key);
  };

  return (
    <div className="space-y-4 px-2">
      <Slider
        min={min}
        max={max}
        step={1}
        value={[currentRange.min, currentRange.max]}
        onValueChange={handleChange}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {currentRange.min} - {currentRange.max}
        </span>
        {(currentRange.min !== min || currentRange.max !== max) && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

function SelectFilter({ filter, activeValue }: FilterComponentProps) {
  const { addFilter, removeFilter } = useFilterStore();
  const selectedValue = typeof activeValue === 'string' ? activeValue : undefined;

  const handleSelect = (optionId: string | number) => {
    const stringId = String(optionId);
    if (selectedValue === stringId) {
      removeFilter(filter.key);
    } else {
      addFilter(filter.key, stringId);
    }
  };

  return (
    <div className="space-y-1">
      {filter.options?.map((option) => {
        const isSelected = selectedValue === String(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={isSelected ? 'opacity-80 ml-1' : 'text-muted-foreground ml-1'}>
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}