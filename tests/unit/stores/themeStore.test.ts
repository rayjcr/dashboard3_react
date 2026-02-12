import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useThemeStore.setState({ currentTheme: 'light' });
  });

  it('TC-STORE-002-01: should have light as initial theme', () => {
    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('light');
  });

  it('TC-STORE-002-02: should toggle theme from light to dark', () => {
    const { toggleTheme } = useThemeStore.getState();

    toggleTheme();

    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('dark');
  });

  it('TC-STORE-002-02: should toggle theme from dark to light', () => {
    useThemeStore.setState({ currentTheme: 'dark' });

    const { toggleTheme } = useThemeStore.getState();
    toggleTheme();

    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('light');
  });

  it('TC-STORE-002-03: should set theme directly', () => {
    const { setTheme } = useThemeStore.getState();

    setTheme('dark');

    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('dark');
  });

  it('should set theme to light directly', () => {
    useThemeStore.setState({ currentTheme: 'dark' });

    const { setTheme } = useThemeStore.getState();
    setTheme('light');

    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('light');
  });

  it('should maintain theme after multiple toggles', () => {
    const { toggleTheme } = useThemeStore.getState();

    // Toggle 4 times: light -> dark -> light -> dark -> light
    toggleTheme();
    toggleTheme();
    toggleTheme();
    toggleTheme();

    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('light');
  });
});
