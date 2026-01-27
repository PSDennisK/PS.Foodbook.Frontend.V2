import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('useDebouncedValue', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 100 },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'changed', delay: 100 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('changed');
      },
      { timeout: 200 }
    );
  });

  it('works with different data types', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 100), {
      initialProps: { value: 0 },
    });

    expect(result.current).toBe(0);

    rerender({ value: 42 });

    await waitFor(
      () => {
        expect(result.current).toBe(42);
      },
      { timeout: 200 }
    );
  });

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = renderHook(() => useDebouncedValue('test', 500));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
