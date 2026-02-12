import { useState, useEffect } from 'react';

/**
 * Debounce Hook
 * @param value The value to debounce
 * @param delay Delay time in milliseconds, default 300ms
 * @returns The debounced value
 *
 * @example
 * const [searchKey, setSearchKey] = useState('');
 * const debouncedSearchKey = useDebounce(searchKey, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchKey) {
 *     // Execute search
 *     search(debouncedSearchKey);
 *   }
 * }, [debouncedSearchKey]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
