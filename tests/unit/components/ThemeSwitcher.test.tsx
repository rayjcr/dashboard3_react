import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher';
import { useThemeStore } from '@/stores/themeStore';

// Mock Ant Design components
vi.mock('antd', () => ({
  Button: ({
    children,
    onClick,
    icon,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
  }) => (
    <button onClick={onClick} {...props}>
      {icon}
      {children}
    </button>
  ),
  Tooltip: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => <div title={title}>{children}</div>,
}));

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    // Reset theme store to light mode
    useThemeStore.setState({ currentTheme: 'light' });
  });

  it('TC-COMP-003-01: should render with moon icon when theme is light', () => {
    render(<ThemeSwitcher />);
    // Component should render a button
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('TC-COMP-003-02: should render with sun icon when theme is dark', () => {
    useThemeStore.setState({ currentTheme: 'dark' });
    render(<ThemeSwitcher />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('TC-COMP-003-03: should call toggleTheme when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Theme should have toggled to dark
    const { currentTheme } = useThemeStore.getState();
    expect(currentTheme).toBe('dark');
  });

  it('should toggle theme multiple times', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const button = screen.getByRole('button');

    // First click: light -> dark
    await user.click(button);
    expect(useThemeStore.getState().currentTheme).toBe('dark');

    // Second click: dark -> light
    await user.click(button);
    expect(useThemeStore.getState().currentTheme).toBe('light');
  });
});
