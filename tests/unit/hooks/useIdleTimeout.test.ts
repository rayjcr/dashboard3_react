import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

describe('useIdleTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('TC-HOOK-002-01: should call onIdle after timeout with no activity', async () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimeout({
        timeout: 1000, // 1 second for testing
        onIdle,
        enabled: true,
      }),
    );

    // Should not be called immediately
    expect(onIdle).not.toHaveBeenCalled();

    // Advance timers past timeout
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should be called after timeout
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('TC-HOOK-002-02: should reset timer on mouse move', async () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimeout({
        timeout: 1000,
        onIdle,
        enabled: true,
      }),
    );

    // Advance timers partially
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Simulate mouse move
    await act(async () => {
      window.dispatchEvent(new Event('mousemove'));
    });

    // Advance timers past original timeout (but not new timeout)
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Should not be called yet (timer was reset)
    expect(onIdle).not.toHaveBeenCalled();

    // Advance past the reset timeout
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Now should be called
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('TC-HOOK-002-03: should not set timer when disabled', async () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimeout({
        timeout: 1000,
        onIdle,
        enabled: false,
      }),
    );

    // Advance timers past timeout
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Should not be called when disabled
    expect(onIdle).not.toHaveBeenCalled();
  });

  it('should reset timer on keydown', async () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimeout({
        timeout: 1000,
        onIdle,
        enabled: true,
      }),
    );

    // Advance timers partially
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Simulate keydown
    await act(async () => {
      window.dispatchEvent(new Event('keydown'));
    });

    // Advance timers past original timeout
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Should not be called yet
    expect(onIdle).not.toHaveBeenCalled();
  });

  it('should reset timer on click', async () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimeout({
        timeout: 1000,
        onIdle,
        enabled: true,
      }),
    );

    // Advance timers partially
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Simulate click
    await act(async () => {
      window.dispatchEvent(new Event('click'));
    });

    // Advance timers past original timeout
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Should not be called yet
    expect(onIdle).not.toHaveBeenCalled();
  });

  it('should reset timer on scroll', async () => {
    const onIdle = vi.fn();

    renderHook(() =>
      useIdleTimeout({
        timeout: 1000,
        onIdle,
        enabled: true,
      }),
    );

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', async () => {
    const onIdle = vi.fn();

    const { unmount } = renderHook(() =>
      useIdleTimeout({
        timeout: 1000,
        onIdle,
        enabled: true,
      }),
    );

    // Unmount before timeout
    unmount();

    // Advance timers past timeout
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Should not be called after unmount
    expect(onIdle).not.toHaveBeenCalled();
  });

  it('should handle enabled state change', async () => {
    const onIdle = vi.fn();

    const { rerender } = renderHook(
      ({ enabled }) =>
        useIdleTimeout({
          timeout: 1000,
          onIdle,
          enabled,
        }),
      { initialProps: { enabled: true } },
    );

    // Advance timers partially
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    // Disable
    rerender({ enabled: false });

    // Advance timers past timeout
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should not be called when disabled
    expect(onIdle).not.toHaveBeenCalled();
  });
});
