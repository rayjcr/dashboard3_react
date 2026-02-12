import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { useThemeStore } from '@/stores/themeStore';
import dayjs from 'dayjs';

// Mock Ant Design components
vi.mock('antd', () => ({
  DatePicker: ({
    value,
    onChange,
    placeholder,
    picker,
  }: {
    value: unknown;
    onChange: (date: unknown) => void;
    placeholder: string;
    picker?: string;
  }) => (
    <input
      type="text"
      data-testid={picker === 'month' ? 'month-picker' : 'date-picker'}
      placeholder={placeholder}
      value={value ? String(value) : ''}
      onChange={(e) => onChange(e.target.value ? dayjs(e.target.value) : null)}
    />
  ),
  Button: ({
    children,
    onClick,
    loading,
    type,
    icon,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    loading?: boolean;
    type?: string;
    icon?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      disabled={loading}
      data-loading={loading}
      data-type={type}
    >
      {icon}
      {loading ? 'Loading...' : children}
    </button>
  ),
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: {
    Text: ({
      children,
      strong,
      style,
    }: {
      children: React.ReactNode;
      strong?: boolean;
      style?: React.CSSProperties;
    }) => (
      <span style={style} data-strong={strong}>
        {children}
      </span>
    ),
  },
}));

// Mock icons
vi.mock('@ant-design/icons', () => ({
  SearchOutlined: () => <span data-testid="search-icon">🔍</span>,
  CalendarOutlined: () => <span data-testid="calendar-icon">📅</span>,
}));

// Mock CSS
vi.mock('./dashboard.css', () => ({}));

describe('DateFilter', () => {
  beforeEach(() => {
    useThemeStore.setState({ currentTheme: 'light' });
  });

  describe('Daily type', () => {
    it('TC-COMP-001-01: should render date picker and search button for daily type', () => {
      const onChange = vi.fn();
      const onSearch = vi.fn();

      render(
        <DateFilter
          type="daily"
          value={null}
          onChange={onChange}
          onSearch={onSearch}
        />,
      );

      expect(screen.getByTestId('date-picker')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Search');
      expect(screen.getByText('Date:')).toBeInTheDocument();
    });

    it('TC-COMP-001-02: should call onChange when date is selected', async () => {
      const onChange = vi.fn();
      const onSearch = vi.fn();

      render(
        <DateFilter
          type="daily"
          value={null}
          onChange={onChange}
          onSearch={onSearch}
        />,
      );

      const datePicker = screen.getByTestId('date-picker');
      fireEvent.change(datePicker, { target: { value: '2024-01-15' } });

      expect(onChange).toHaveBeenCalled();
    });

    it('TC-COMP-001-03: should call onSearch when search button is clicked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSearch = vi.fn();

      render(
        <DateFilter
          type="daily"
          value={null}
          onChange={onChange}
          onSearch={onSearch}
        />,
      );

      const searchButton = screen.getByRole('button');
      await user.click(searchButton);

      expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it('TC-COMP-001-04: should show loading state when loading is true', () => {
      const onChange = vi.fn();
      const onSearch = vi.fn();

      render(
        <DateFilter
          type="daily"
          value={null}
          onChange={onChange}
          onSearch={onSearch}
          loading={true}
        />,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toHaveTextContent('Loading...');
    });
  });

  describe('Monthly type', () => {
    it('should render month picker for monthly type', () => {
      const onChange = vi.fn();
      const onSearch = vi.fn();

      render(
        <DateFilter
          type="monthly"
          value={null}
          onChange={onChange}
          onSearch={onSearch}
        />,
      );

      expect(screen.getByTestId('month-picker')).toBeInTheDocument();
      expect(screen.getByText('Month:')).toBeInTheDocument();
    });
  });

  describe('Theme support', () => {
    it('should apply light theme colors', () => {
      render(
        <DateFilter
          type="daily"
          value={null}
          onChange={vi.fn()}
          onSearch={vi.fn()}
        />,
      );

      // Component should render without errors in light mode
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should apply dark theme colors', () => {
      useThemeStore.setState({ currentTheme: 'dark' });

      render(
        <DateFilter
          type="daily"
          value={null}
          onChange={vi.fn()}
          onSearch={vi.fn()}
        />,
      );

      // Component should render without errors in dark mode
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });
  });
});
