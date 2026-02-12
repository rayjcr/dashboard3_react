import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from 'react';
import {
  Table,
  DatePicker,
  Input,
  Button,
  Space,
  Typography,
  Empty,
} from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useAuthStore, useThemeStore } from '@/stores';
import {
  useAllTransactionsStore,
  cancelAllTransactionsRequests,
} from '@/stores/allTransactionsStore';
import type { TransactionRecord } from '@/services/api/allTransactionsApi';
import { formatCurrency } from '@/utils/currency';
import '../dashboard.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// Table row type
interface TransactionTableRow {
  key: string;
  location: string;
  storeName: string;
  transactionId: string;
  parentTransactionId: string;
  reference: string;
  reference2: string;
  extralReference: string;
  dateTime: string;
  dateTimezone: string;
  transactionType: string;
  paymentMethod: string;
  cardNumber: string;
  vendorReference: string;
  authCurrency: string;
  total: string;
  authAmount: string;
  capturedAmount: string;
  sales: string;
  tip: string;
  loginCode: string;
  transactionTag: string;
  terminalId: string;
  storeOfOriginalPayment: string;
}

// Default date range: 6 months ago to today (for testing: 2022-01-01 to 2023-03-01)
const getDefaultDateRange = (): [Dayjs, Dayjs] => {
  // For testing, use fixed dates
  return [dayjs('2022-01-01'), dayjs('2022-03-01')];
  // For production, use:
  // const endDate = dayjs();
  // const startDate = endDate.subtract(6, 'month');
  // return [startDate, endDate];
};

export const AllTransactionsSearch: React.FC = () => {
  const { sessionId, timezone } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  const {
    data,
    loading,
    error,
    page,
    pageSize,
    fetchTransactions,
    setPage,
    setPageSize,
  } = useAllTransactionsStore();

  // Local state for filters
  const [dateRange, setDateRange] =
    useState<[Dayjs, Dayjs]>(getDefaultDateRange);
  const [searchKey, setSearchKey] = useState<string>('');

  // Use ref to track if initial load has been done (avoids re-render issues)
  const initialLoadDoneRef = useRef(false);

  // Initial data load - only run once when sessionId and timezone are available
  useEffect(() => {
    if (!initialLoadDoneRef.current && sessionId && timezone) {
      initialLoadDoneRef.current = true;
      const [startDate, endDate] = getDefaultDateRange();
      fetchTransactions(
        sessionId,
        timezone,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD'),
        '',
        0,
        pageSize,
      );
    }
  }, [sessionId, timezone, pageSize, fetchTransactions]);

  // Cleanup on unmount - reset ref so data will reload when coming back
  useEffect(() => {
    return () => {
      initialLoadDoneRef.current = false;
      cancelAllTransactionsRequests();
    };
  }, []);

  // Handle search button click
  const handleSearch = useCallback(() => {
    if (sessionId && timezone && dateRange[0] && dateRange[1]) {
      fetchTransactions(
        sessionId,
        timezone,
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD'),
        searchKey,
        0, // Reset to first page
        pageSize,
      );
    }
  }, [sessionId, timezone, dateRange, searchKey, pageSize, fetchTransactions]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (sessionId && timezone && dateRange[0] && dateRange[1]) {
        setPage(newPage);
        fetchTransactions(
          sessionId,
          timezone,
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD'),
          searchKey,
          newPage,
          pageSize,
        );
      }
    },
    [
      sessionId,
      timezone,
      dateRange,
      searchKey,
      pageSize,
      setPage,
      fetchTransactions,
    ],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (current: number, size: number) => {
      if (sessionId && timezone && dateRange[0] && dateRange[1]) {
        setPageSize(size);
        fetchTransactions(
          sessionId,
          timezone,
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD'),
          searchKey,
          0, // Reset to first page
          size,
        );
      }
    },
    [sessionId, timezone, dateRange, searchKey, setPageSize, fetchTransactions],
  );

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        setDateRange([dates[0], dates[1]]);
      }
    },
    [],
  );

  // Handle search key change
  const handleSearchKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKey(e.target.value);
    },
    [],
  );

  // Handle Enter key press in search input
  const handleSearchKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch],
  );

  // Helper function to format transaction type
  const formatTransactionType = (type: string): string => {
    if (type === 'pos_payment') return 'charge';
    if (type === 'pos_refund') return 'refund';
    return type;
  };

  // Helper function to format payment method
  const formatPaymentMethod = (method: string): string => {
    if (method === 'wechatpay') return 'WXP';
    if (method === 'alipay') return 'ALP';
    return method;
  };

  // Convert transactions to table rows
  const tableData: TransactionTableRow[] = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.map(
      (record: TransactionRecord, index: number) => ({
        key: `${record.transaction_id}-${index}`,
        location: record.location || '-',
        storeName: record.store_name || '-',
        transactionId: record.transaction_id || '-',
        parentTransactionId: record.parent_transaction_id || '-',
        reference: record.reference1 || '-',
        reference2: record.reference2 || '-',
        extralReference: record.extral_reference || '-',
        dateTime: record.time_created || '-',
        dateTimezone: record.mttimezone || 'UTC',
        transactionType: formatTransactionType(record.transaction_type || ''),
        paymentMethod: formatPaymentMethod(record.payment_method || ''),
        cardNumber: record.buyer_id || '-',
        vendorReference: record.method_trans_id || '-',
        authCurrency: record.auth_currency || '-',
        total: formatCurrency(record.total, record.currency),
        authAmount: formatCurrency(record.auth_amount, record.auth_currency),
        capturedAmount: formatCurrency(
          parseFloat(record.amount_captured || '0'),
          record.currency,
        ),
        sales: formatCurrency(record.sales, record.currency),
        tip: record.tip
          ? formatCurrency(parseFloat(record.tip), record.currency)
          : '-',
        loginCode: record.login_code || '-',
        transactionTag: record.transaction_tag || '-',
        terminalId: record.terminal_id || '-',
        storeOfOriginalPayment: record.original_merchant_name_english || '-',
      }),
    );
  }, [data]);

  // Define table columns
  const columns: ColumnsType<TransactionTableRow> = useMemo(
    () => [
      {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Store Name',
        dataIndex: 'storeName',
        key: 'storeName',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Transaction ID',
        dataIndex: 'transactionId',
        key: 'transactionId',
        width: 220,
        ellipsis: true,
        render: (text: string) => (
          <Text copyable={{ text }} style={{ fontSize: 12 }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Parent Transaction ID',
        dataIndex: 'parentTransactionId',
        key: 'parentTransactionId',
        width: 220,
        ellipsis: true,
        render: (text: string) =>
          text !== '-' ? (
            <Text copyable={{ text }} style={{ fontSize: 12 }}>
              {text}
            </Text>
          ) : (
            '-'
          ),
      },
      {
        title: 'Reference',
        dataIndex: 'reference',
        key: 'reference',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Reference2',
        dataIndex: 'reference2',
        key: 'reference2',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Extral Reference',
        dataIndex: 'extralReference',
        key: 'extralReference',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Date/Time',
        dataIndex: 'dateTime',
        key: 'dateTime',
        width: 180,
        align: 'center',
        render: (_: string, record: TransactionTableRow) => (
          <div style={{ textAlign: 'center' }}>
            <div>{record.dateTime}</div>
            <div style={{ fontSize: 11, color: '#888' }}>
              ({record.dateTimezone})
            </div>
          </div>
        ),
      },
      {
        title: 'Transaction Type',
        dataIndex: 'transactionType',
        key: 'transactionType',
        width: 130,
        align: 'center',
      },
      {
        title: 'Payment Method',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        width: 130,
        align: 'center',
      },
      {
        title: 'Card Number',
        dataIndex: 'cardNumber',
        key: 'cardNumber',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Vendor Reference',
        dataIndex: 'vendorReference',
        key: 'vendorReference',
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Auth Currency',
        dataIndex: 'authCurrency',
        key: 'authCurrency',
        width: 110,
        align: 'center',
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        width: 120,
        align: 'right',
      },
      {
        title: 'Auth Amount',
        dataIndex: 'authAmount',
        key: 'authAmount',
        width: 120,
        align: 'right',
      },
      {
        title: 'Captured Amount',
        dataIndex: 'capturedAmount',
        key: 'capturedAmount',
        width: 130,
        align: 'right',
      },
      {
        title: 'Sales',
        dataIndex: 'sales',
        key: 'sales',
        width: 120,
        align: 'right',
      },
      {
        title: 'Tip',
        dataIndex: 'tip',
        key: 'tip',
        width: 100,
        align: 'right',
      },
      {
        title: 'Login Code',
        dataIndex: 'loginCode',
        key: 'loginCode',
        width: 120,
        ellipsis: true,
      },
      {
        title: 'Transaction Tag',
        dataIndex: 'transactionTag',
        key: 'transactionTag',
        width: 130,
        ellipsis: true,
      },
      {
        title: 'Terminal ID',
        dataIndex: 'terminalId',
        key: 'terminalId',
        width: 120,
        ellipsis: true,
      },
      {
        title: 'Store of Original Payment',
        dataIndex: 'storeOfOriginalPayment',
        key: 'storeOfOriginalPayment',
        width: 180,
        ellipsis: true,
      },
    ],
    [],
  );

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="all-transactions-search" style={{ padding: '16px' }}>
      {/* Filter Section - using same style as DateFilter */}
      <div className="date-filter-container">
        <div className="date-filter-content">
          <Space size="middle" align="center" wrap>
            {/* Date Range Picker */}
            <Space size="small" align="center">
              <CalendarOutlined style={{ color: primaryColor }} />
              <Text strong style={{ fontSize: 13 }}>
                Date Range:
              </Text>
            </Space>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="YYYY-MM-DD"
              allowClear={false}
              style={{ width: 280 }}
            />

            {/* Search Input */}
            <Space size="small" align="center">
              <SearchOutlined style={{ color: primaryColor }} />
              <Text strong style={{ fontSize: 13 }}>
                Search:
              </Text>
            </Space>
            <Input
              placeholder="Enter keyword to search"
              value={searchKey}
              onChange={handleSearchKeyChange}
              onKeyPress={handleSearchKeyPress}
              style={{ width: 200 }}
              allowClear
            />

            {/* Search Button */}
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              Search
            </Button>
          </Space>
        </div>
      </div>

      {/* Table Section */}
      <div className="dashboard-table">
        <Table<TransactionTableRow>
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={{
            current: page + 1,
            pageSize: pageSize,
            total: data?.totalRecords || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (newPage) => {
              handlePageChange(newPage - 1);
            },
            onShowSizeChange: handlePageSizeChange,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No data"
              />
            ),
          }}
          scroll={{ x: 3200 }}
        />
      </div>
    </div>
  );
};

export default AllTransactionsSearch;
