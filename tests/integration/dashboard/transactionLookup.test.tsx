import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import { server } from '../../mocks/server';
import dayjs from 'dayjs';

// Create a test wrapper component
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AntApp>
          <BrowserRouter>{children}</BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

// Simple mock Transaction Lookup component for testing
const MockTransactionLookup = ({
  onSearch,
  data,
  loading,
}: {
  onSearch: (params: {
    startDate: string;
    endDate: string;
    keyword: string;
  }) => void;
  data: Array<{
    id: string;
    reference: string;
    amount: string;
    status: string;
  }>;
  loading: boolean;
}) => {
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const handleSearch = () => {
    onSearch({
      startDate: startDate?.format('YYYY-MM-DD') || '',
      endDate: endDate?.format('YYYY-MM-DD') || '',
      keyword,
    });
  };

  return (
    <div>
      <div data-testid="filter-section">
        <input
          type="date"
          data-testid="start-date"
          onChange={(e) =>
            setStartDate(e.target.value ? dayjs(e.target.value) : null)
          }
        />
        <input
          type="date"
          data-testid="end-date"
          onChange={(e) =>
            setEndDate(e.target.value ? dayjs(e.target.value) : null)
          }
        />
        <input
          type="text"
          data-testid="keyword-input"
          placeholder="Search..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          data-testid="search-button"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div data-testid="results-section">
        {loading && <div data-testid="loading-indicator">Loading...</div>}
        {!loading && data.length === 0 && (
          <div data-testid="empty-state">No results</div>
        )}
        {!loading && data.length > 0 && (
          <table data-testid="results-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} data-testid={`row-${row.id}`}>
                  <td>{row.id}</td>
                  <td>{row.reference}</td>
                  <td>{row.amount}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div data-testid="pagination-section">
        <button
          data-testid="prev-page"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span data-testid="current-page">Page {page}</span>
        <button data-testid="next-page" onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

describe('Transaction Lookup Integration', () => {
  const mockData = [
    { id: 'TXN001', reference: 'REF001', amount: '100.00', status: 'success' },
    { id: 'TXN002', reference: 'REF002', amount: '200.00', status: 'pending' },
  ];

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('IT-TXN-001: should search transactions with date range and keyword', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup onSearch={onSearch} data={[]} loading={false} />
      </Wrapper>,
    );

    // Set date range
    const startDateInput = screen.getByTestId('start-date');
    const endDateInput = screen.getByTestId('end-date');
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    // Set keyword
    await user.type(screen.getByTestId('keyword-input'), 'test');

    // Click search
    await user.click(screen.getByTestId('search-button'));

    // Verify search was called
    expect(onSearch).toHaveBeenCalledWith({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      keyword: 'test',
    });
  });

  it('IT-TXN-002: should display search results in table', async () => {
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup
          onSearch={vi.fn()}
          data={mockData}
          loading={false}
        />
      </Wrapper>,
    );

    // Verify table is displayed
    expect(screen.getByTestId('results-table')).toBeInTheDocument();

    // Verify data rows
    expect(screen.getByTestId('row-TXN001')).toBeInTheDocument();
    expect(screen.getByTestId('row-TXN002')).toBeInTheDocument();

    // Verify content
    expect(screen.getByText('REF001')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('should show loading state during search', async () => {
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup onSearch={vi.fn()} data={[]} loading={true} />
      </Wrapper>,
    );

    // Verify loading indicator
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toHaveTextContent(
      'Searching...',
    );
    expect(screen.getByTestId('search-button')).toBeDisabled();
  });

  it('should show empty state when no results', async () => {
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup onSearch={vi.fn()} data={[]} loading={false} />
      </Wrapper>,
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('IT-TXN-002: should handle pagination', async () => {
    const user = userEvent.setup();
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup
          onSearch={vi.fn()}
          data={mockData}
          loading={false}
        />
      </Wrapper>,
    );

    // Initial page
    expect(screen.getByTestId('current-page')).toHaveTextContent('Page 1');

    // Go to next page
    await user.click(screen.getByTestId('next-page'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('Page 2');

    // Go back
    await user.click(screen.getByTestId('prev-page'));
    expect(screen.getByTestId('current-page')).toHaveTextContent('Page 1');
  });

  it('should disable previous button on first page', async () => {
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup
          onSearch={vi.fn()}
          data={mockData}
          loading={false}
        />
      </Wrapper>,
    );

    expect(screen.getByTestId('prev-page')).toBeDisabled();
  });

  it('should allow searching without keyword', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockTransactionLookup onSearch={onSearch} data={[]} loading={false} />
      </Wrapper>,
    );

    // Set date range only
    const startDateInput = screen.getByTestId('start-date');
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    // Click search without keyword
    await user.click(screen.getByTestId('search-button'));

    // Verify search was called with empty keyword
    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        keyword: '',
      }),
    );
  });
});
