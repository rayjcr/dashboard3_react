import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  enabled?: boolean;
}

/**
 * Custom hook to detect user idle state
 * @param timeout - Time in milliseconds before triggering onIdle
 * @param onIdle - Callback function when user becomes idle
 * @param enabled - Whether the idle detection is enabled (default: true)
 */
export const useIdleTimeout = ({
  timeout,
  onIdle,
  enabled = true,
}: UseIdleTimeoutOptions): void => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      onIdle();
    }, timeout);
  }, [timeout, onIdle, enabled]);

  useEffect(() => {
    if (!enabled) {
      // Clear timer if disabled
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Events to listen for user activity
    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer, enabled]);
};
