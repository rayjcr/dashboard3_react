import React, { useMemo } from 'react';
import { Table, Typography, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  FixedReserveRecord,
  RollingReserveRecord,
  RollingDetailRecord,
} from '@/types/dashboard';
import dayjs from 'dayjs';
import '../dashboard.css';

const { Title } = Typography;

// Status color mapping for Paid Status
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Paid: { bg: '#d4edda', text: '#155724' },
  Pending: { bg: '#fff3cd', text: '#856404' },
  Unpaid: { bg: '#f8d7da', text: '#721c24' },
  default: { bg: '#f0f0f0', text: '#666666' },
};

// Get amount color based on value (value is in cents)
const getAmountColor = (value: number | null): string => {
  if (value === null || value === undefined) return '#666666';
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#52c41a'; // Green for positive or zero
};

interface ReserveSummaryTablesProps {
  fixedReserves: FixedReserveRecord[];
  rollingReserves: RollingReserveRecord[];
  rollingDetails: RollingDetailRecord[];
  rollingDetailTotal: number;
  loading: boolean;
  error: string | null;
  currency: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Format amount
 */
const formatAmount = (amount: number | null, currency: string): string => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100); // Amount is in cents
};

/**
 * Format date - keep only year, month, day
 */
const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  try {
    return dayjs(dateStr).format('YYYY-MM-DD');
  } catch {
    return dateStr;
  }
};

/**
 * Parse Rolling Reserve content JSON
 */
const parseRollingContent = (
  content: string,
): { percent?: number; rolling_period?: number } => {
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
};

export const ReserveSummaryTables: React.FC<ReserveSummaryTablesProps> = ({
  fixedReserves,
  rollingReserves,
  rollingDetails,
  rollingDetailTotal,
  loading,
  error,
  currency,
  page,
  pageSize,
  onPageChange,
}) => {
  // Fixed Reserve Summary column definitions
  const fixedReserveColumns: ColumnsType<FixedReserveRecord> = useMemo(
    () => [
      {
        title: 'Effective Date',
        dataIndex: 'start_date',
        key: 'start_date',
        width: 140,
        align: 'left' as const,
        render: (value: string) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatDate(value)}
          </span>
        ),
      },
      {
        title: 'Reserved Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        width: 150,
        align: 'right' as const,
        render: (value: number | null) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, currency)}
          </span>
        ),
      },
      {
        title: 'Paid Status',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        align: 'left' as const,
        render: (value: string) => {
          const statusKey = value || 'default';
          const colors = STATUS_COLORS[statusKey] || STATUS_COLORS.default;
          return (
            <Tag
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: 'none',
                borderRadius: '4px',
                padding: '2px 8px',
                fontWeight: 500,
              }}
            >
              {value || '—'}
            </Tag>
          );
        },
      },
      {
        title: 'Paid Amount',
        key: 'paid_amount',
        width: 150,
        align: 'right' as const,
        render: (_: unknown, record: FixedReserveRecord) =>
          record.status === 'Paid' ? (
            <span
              style={{
                color: getAmountColor(record.total_amount),
                fontWeight: 500,
              }}
            >
              {formatAmount(record.total_amount, currency)}
            </span>
          ) : (
            '—'
          ),
      },
      {
        title: 'Release Date',
        dataIndex: 'end_date',
        key: 'end_date',
        width: 140,
        align: 'left' as const,
        render: (value: string | null) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatDate(value)}
          </span>
        ),
      },
    ],
    [currency],
  );

  // Rolling Reserve Summary column definitions
  const rollingReserveColumns: ColumnsType<RollingReserveRecord> = useMemo(
    () => [
      {
        title: 'Effective Date',
        dataIndex: 'start_date',
        key: 'start_date',
        width: 140,
        align: 'left' as const,
        render: (value: string) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatDate(value)}
          </span>
        ),
      },
      {
        title: '# Of Rolling Days',
        key: 'rolling_period',
        width: 150,
        align: 'right' as const,
        render: (_: unknown, record: RollingReserveRecord) => {
          const content = parseRollingContent(record.content);
          return content.rolling_period ?? '—';
        },
      },
      {
        title: '% Of Daily Settlement',
        key: 'percent',
        width: 180,
        align: 'right' as const,
        render: (_: unknown, record: RollingReserveRecord) => {
          const content = parseRollingContent(record.content);
          return content.percent !== undefined ? `${content.percent}%` : '—';
        },
      },
      {
        title: 'Total Withheld Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        width: 180,
        align: 'right' as const,
        render: (value: number | null) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, currency)}
          </span>
        ),
      },
    ],
    [currency],
  );

  // Rolling Reserve Details column definitions
  const rollingDetailColumns: ColumnsType<RollingDetailRecord> = useMemo(
    () => [
      {
        title: 'Reserved Date',
        dataIndex: 'date',
        key: 'date',
        width: 140,
        align: 'left' as const,
        render: (value: string) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatDate(value)}
          </span>
        ),
      },
      {
        title: 'Withheld Amount',
        dataIndex: 'withheld',
        key: 'withheld',
        width: 150,
        align: 'right' as const,
        render: (value: number) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, currency)}
          </span>
        ),
      },
      {
        title: 'Released Amount',
        dataIndex: 'released',
        key: 'released',
        width: 150,
        align: 'right' as const,
        render: (value: number) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, currency)}
          </span>
        ),
      },
      {
        title: 'Net Amount',
        dataIndex: 'net',
        key: 'net',
        width: 150,
        align: 'right' as const,
        render: (value: number) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, currency)}
          </span>
        ),
      },
    ],
    [currency],
  );

  // Show error if exists
  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="reserve-summary-container">
      {/* Fixed Reserve Summary */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          Fixed Reserve Summary
        </Title>
        <div className="dashboard-table">
          <Table<FixedReserveRecord>
            columns={fixedReserveColumns}
            dataSource={fixedReserves}
            rowKey={(record) => record.id}
            loading={loading}
            tableLayout="fixed"
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No data"
                />
              ),
            }}
            scroll={{ x: 700 }}
          />
        </div>
      </div>

      {/* Rolling Reserve Summary */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 12 }}>
          Rolling Reserve Summary
        </Title>
        <div className="dashboard-table">
          <Table<RollingReserveRecord>
            columns={rollingReserveColumns}
            dataSource={rollingReserves}
            rowKey={(record) => record.id}
            loading={loading}
            tableLayout="fixed"
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No data"
                />
              ),
            }}
            scroll={{ x: 650 }}
          />
        </div>
      </div>

      {/* Rolling Reserve Details */}
      <div>
        <Title level={5} style={{ marginBottom: 12 }}>
          Rolling Reserve Details
        </Title>
        <div className="dashboard-table">
          <Table<RollingDetailRecord>
            columns={rollingDetailColumns}
            dataSource={rollingDetails}
            rowKey={(record, index) => `${record.date}-${index}`}
            loading={loading}
            tableLayout="fixed"
            pagination={{
              current: page + 1,
              pageSize: pageSize,
              total: rollingDetailTotal,
              onChange: (newPage) => onPageChange(newPage - 1),
              showSizeChanger: false,
            }}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No data"
                />
              ),
            }}
            scroll={{ x: 590 }}
          />
        </div>
      </div>
    </div>
  );
};
