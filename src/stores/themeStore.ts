import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ThemeState, ThemeMode } from '@/types/theme';

const THEME_STORAGE_KEY = 'theme-storage';

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        currentTheme: 'light' as ThemeMode,

        setTheme: (theme: ThemeMode) => {
          set({ currentTheme: theme });
        },

        toggleTheme: () => {
          set((state) => ({
            currentTheme: state.currentTheme === 'light' ? 'dark' : 'light',
          }));
        },
      }),
      {
        name: THEME_STORAGE_KEY,
      },
    ),
    { name: 'ThemeStore' },
  ),
);
