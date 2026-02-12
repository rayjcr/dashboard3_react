/**
 * Theme configuration types
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;

  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgContent: string;
  bgCard: string;

  // Sidebar colors
  sidebarBg: string;
  sidebarText: string;
  sidebarTextHover: string;
  sidebarItemHoverBg: string;
  sidebarItemActiveBg: string;
  sidebarItemActiveText: string;

  // Header colors
  headerBg: string;
  headerText: string;
  headerBorder: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Border colors
  border: string;
  borderLight: string;

  // Table colors
  tableHeaderBg: string;
  tableRowOdd: string;
  tableRowEven: string;
  tableRowHover: string;
  tableBorder: string;

  // Button colors
  btnDanger: string;
  btnDangerHover: string;

  // Shadow
  shadow: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  name: string;
  colors: ThemeColors;
}

export interface ThemeState {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

// Light theme (current default)
export const lightTheme: ThemeConfig = {
  mode: 'light',
  name: 'Light',
  colors: {
    primary: '#1890ff',
    primaryHover: '#40a9ff',
    primaryActive: '#096dd9',

    bgPrimary: '#ffffff',
    bgSecondary: '#f0f2f5',
    bgContent: '#f0f2f5',
    bgCard: '#ffffff',

    sidebarBg: '#ffffff',
    sidebarText: 'rgba(0, 0, 0, 0.65)',
    sidebarTextHover: '#1890ff',
    sidebarItemHoverBg: '#e6f7ff',
    sidebarItemActiveBg: '#e6f7ff',
    sidebarItemActiveText: '#1890ff',

    headerBg: '#ffffff',
    headerText: '#1890ff',
    headerBorder: '#f0f0f0',

    textPrimary: 'rgba(0, 0, 0, 0.85)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textMuted: 'rgba(0, 0, 0, 0.45)',

    border: '#d9d9d9',
    borderLight: '#f0f0f0',

    tableHeaderBg: '#e6e6e6',
    tableRowOdd: '#ffffff',
    tableRowEven: '#fafafa',
    tableRowHover: '#e6f4ff',
    tableBorder: '#f0f0f0',

    btnDanger: '#ff4d4f',
    btnDangerHover: '#ff7875',

    shadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
  },
};

// Dark theme (new style based on screenshot - purple accent)
export const darkTheme: ThemeConfig = {
  mode: 'dark',
  name: 'Dark',
  colors: {
    primary: '#7c3aed',
    primaryHover: '#8b5cf6',
    primaryActive: '#6d28d9',

    bgPrimary: '#1a1a2e',
    bgSecondary: '#16162a',
    bgContent: '#f8fafc',
    bgCard: '#ffffff',

    sidebarBg: '#1a1a2e',
    sidebarText: 'rgba(255, 255, 255, 0.65)',
    sidebarTextHover: '#ffffff',
    sidebarItemHoverBg: 'rgba(124, 58, 237, 0.2)',
    sidebarItemActiveBg: '#7c3aed',
    sidebarItemActiveText: '#ffffff',

    headerBg: '#ffffff',
    headerText: '#1a1a2e',
    headerBorder: '#e5e7eb',

    textPrimary: 'rgba(0, 0, 0, 0.85)',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textMuted: 'rgba(0, 0, 0, 0.45)',

    border: '#e5e7eb',
    borderLight: '#f3f4f6',

    tableHeaderBg: '#f3f4f6',
    tableRowOdd: '#ffffff',
    tableRowEven: '#f9fafb',
    tableRowHover: '#f3e8ff',
    tableBorder: '#e5e7eb',

    btnDanger: '#ef4444',
    btnDangerHover: '#f87171',

    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
};

export const themes: Record<ThemeMode, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme,
};

export const getTheme = (mode: ThemeMode): ThemeConfig => themes[mode];
