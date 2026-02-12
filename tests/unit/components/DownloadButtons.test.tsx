import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DownloadButtons } from '@/components/dashboard/DownloadButtons';
import { useThemeStore } from '@/stores/themeStore';

// Mock Ant Design components
vi.mock('antd', () => ({
  Button: ({
    children,
    onClick,
    loading,
    icon,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <button onClick={onClick} disabled={loading} data-loading={loading}>
      {icon}
      {loading ? 'Loading...' : children}
    </button>
  ),
  Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Divider: () => <hr data-testid="divider" />,
}));

// Mock icons
vi.mock('@ant-design/icons', () => ({
  DownloadOutlined: () => <span data-testid="download-icon">⬇</span>,
  FilePdfOutlined: () => <span data-testid="pdf-icon">📄</span>,
}));

describe('DownloadButtons', () => {
  beforeEach(() => {
    useThemeStore.setState({ currentTheme: 'light' });
  });

  it('TC-COMP-002-01: should render CSV button when onDownloadCSV is provided', () => {
    const onDownloadCSV = vi.fn();

    render(<DownloadButtons hasData={true} onDownloadCSV={onDownloadCSV} />);

    expect(screen.getByText('Download CSV')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('TC-COMP-002-02: should not render when hasData is false', () => {
    const onDownloadCSV = vi.fn();

    const { container } = render(
      <DownloadButtons hasData={false} onDownloadCSV={onDownloadCSV} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('TC-COMP-002-03: should show loading state when downloadingCSV is true', () => {
    const onDownloadCSV = vi.fn();

    render(
      <DownloadButtons
        hasData={true}
        onDownloadCSV={onDownloadCSV}
        downloadingCSV={true}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-loading', 'true');
    expect(button).toHaveTextContent('Loading...');
  });

  it('should render PDF button when onDownloadPDF is provided', () => {
    const onDownloadPDF = vi.fn();

    render(<DownloadButtons hasData={true} onDownloadPDF={onDownloadPDF} />);

    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-icon')).toBeInTheDocument();
  });

  it('should render both buttons when both callbacks are provided', () => {
    const onDownloadCSV = vi.fn();
    const onDownloadPDF = vi.fn();

    render(
      <DownloadButtons
        hasData={true}
        onDownloadCSV={onDownloadCSV}
        onDownloadPDF={onDownloadPDF}
      />,
    );

    expect(screen.getByText('Download CSV')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('should call onDownloadCSV when CSV button is clicked', async () => {
    const user = userEvent.setup();
    const onDownloadCSV = vi.fn();

    render(<DownloadButtons hasData={true} onDownloadCSV={onDownloadCSV} />);

    await user.click(screen.getByText('Download CSV'));

    expect(onDownloadCSV).toHaveBeenCalledTimes(1);
  });

  it('should call onDownloadPDF when PDF button is clicked', async () => {
    const user = userEvent.setup();
    const onDownloadPDF = vi.fn();

    render(<DownloadButtons hasData={true} onDownloadPDF={onDownloadPDF} />);

    await user.click(screen.getByText('Download PDF'));

    expect(onDownloadPDF).toHaveBeenCalledTimes(1);
  });

  it('should not render when no callbacks are provided', () => {
    const { container } = render(<DownloadButtons hasData={true} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render divider', () => {
    const onDownloadCSV = vi.fn();

    render(<DownloadButtons hasData={true} onDownloadCSV={onDownloadCSV} />);

    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  it('should show loading state for PDF button', () => {
    const onDownloadPDF = vi.fn();

    render(
      <DownloadButtons
        hasData={true}
        onDownloadPDF={onDownloadPDF}
        downloadingPDF={true}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-loading', 'true');
  });

  describe('Theme support', () => {
    it('should render in dark theme', () => {
      useThemeStore.setState({ currentTheme: 'dark' });

      render(<DownloadButtons hasData={true} onDownloadCSV={vi.fn()} />);

      expect(screen.getByText('Download CSV')).toBeInTheDocument();
    });
  });
});
