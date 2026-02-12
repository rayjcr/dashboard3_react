import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('TC-HOOK-001-01: should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('TC-HOOK-001-02: should debounce value updates', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } },
    );

    // Initial value
    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Advance timers
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('TC-HOOK-001-03: should only return last value when multiple rapid updates', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } },
    );

    // Multiple rapid updates
    rerender({ value: 'second' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'third' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'fourth' });

    // Should still have initial value
    expect(result.current).toBe('first');

    // Advance past debounce time
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Should have the last value
    expect(result.current).toBe('fourth');
  });

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } },
    );

    rerender({ value: 'updated' });

    // After 300ms, should still be initial
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // After 500ms total, should be updated
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  it('should use default delay of 300ms', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });

    await act(async () => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial');

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should work with object values', async () => {
    const initialObj = { name: 'John' };
    const updatedObj = { name: 'Jane' };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initialObj } },
    );

    expect(result.current).toEqual(initialObj);

    rerender({ value: updatedObj });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedObj);
  });

  it('should work with null and undefined', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: null as string | null } },
    );

    expect(result.current).toBeNull();

    rerender({ value: 'not null' });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('not null');
  });
});
