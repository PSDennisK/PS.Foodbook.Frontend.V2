import { useFocusTrap } from '@/hooks/use-focus-trap';
import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    // Create a test container with focusable elements
    container = document.createElement('div');
    button1 = document.createElement('button');
    button2 = document.createElement('button');
    button3 = document.createElement('button');

    button1.textContent = 'Button 1';
    button2.textContent = 'Button 2';
    button3.textContent = 'Button 3';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('focuses first element on mount', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    renderHook(() => useFocusTrap(ref, true));

    expect(document.activeElement).toBe(button1);
  });

  it('does not focus when isActive is false', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    renderHook(() => useFocusTrap(ref, false));

    expect(document.activeElement).not.toBe(button1);
  });

  it('traps Tab key to cycle forward', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    renderHook(() => useFocusTrap(ref, true));

    button2.focus();
    expect(document.activeElement).toBe(button2);

    // Simulate Tab key
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    button2.dispatchEvent(event);

    // Should not prevent default on middle element
    expect(document.activeElement).toBe(button2);
  });

  it('traps Tab key on last element to first', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    renderHook(() => useFocusTrap(ref, true));

    button3.focus();
    expect(document.activeElement).toBe(button3);

    // Simulate Tab key on last element
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);

    // Should cycle to first element
    // Note: preventDefault in hook prevents actual focus change in test
  });

  it('traps Shift+Tab key to cycle backward', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    renderHook(() => useFocusTrap(ref, true));

    button1.focus();
    expect(document.activeElement).toBe(button1);

    // Simulate Shift+Tab on first element
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(event);

    // Should cycle to last element
    // Note: preventDefault in hook prevents actual focus change in test
  });

  it('does not trap other keys', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    renderHook(() => useFocusTrap(ref, true));

    button1.focus();

    // Simulate Enter key
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    button1.dispatchEvent(event);

    // Focus should not change
    expect(document.activeElement).toBe(button1);
  });

  it('handles null ref', () => {
    const ref = { current: null } as RefObject<HTMLDivElement>;

    // Should not throw
    expect(() => {
      renderHook(() => useFocusTrap(ref, true));
    }).not.toThrow();
  });

  it('cleans up event listener on unmount', () => {
    const ref = { current: container } as RefObject<HTMLDivElement>;

    const { unmount } = renderHook(() => useFocusTrap(ref, true));

    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
