import React, { useMemo } from 'react';
import { Table, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MultiFundingsRecord } from '@/types/dashboard';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import '../dashboard.css';

dayjs.extend(utc);
dayjs.extend(timezone);

// Get amount color based on value (value is in cents)
const getAmountColor = (value: number): string => {
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#52c41a'; // Green for positive or zero
};

interface MultiFundingsTableProps {
  data: MultiFundingsRecord[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Format amount
 */
const formatAmount = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100); // Assuming amount is in cents
};

/**
 * Format date
 */
const formatDate = (dateStr: string, tz: string): string => {
  if (!dateStr) return '-';
  try {
    return dayjs(dateStr).tz(tz).format('YYYY-MM-DD');
  } catch {
    return dateStr;
  }
};

export const MultiFundingsTable: React.FC<MultiFundingsTableProps> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  // Define columns
  const columns: ColumnsType<MultiFundingsRecord> = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'happenedDate',
        key: 'date',
        width: 120,
        align: 'left' as const,
        render: (value: string, record: MultiFundingsRecord) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatDate(value, record.timezone)}
          </span>
        ),
      },
      {
        title: 'Total Tranx',
        dataIndex: 'count',
        key: 'count',
        width: 120,
        align: 'right' as const,
        render: (value: number) => value?.toLocaleString() ?? '-',
      },
      {
        title: 'Gross',
        dataIndex: 'sum',
        key: 'sum',
        width: 150,
        align: 'right' as const,
        render: (value: number, record: MultiFundingsRecord) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, record.currency)}
          </span>
        ),
      },
      {
        title: 'Method',
        dataIndex: 'funding',
        key: 'funding',
        width: 180,
        align: 'left' as const,
        render: (value: string) => {
          if (!value) return '-';
          const methods = value
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean);
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {methods.map((method, index) => (
                <Tag
                  key={index}
                  style={{
                    backgroundColor: '#f0f0f0',
                    color: '#666666',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {method}
                </Tag>
              ))}
            </div>
          );
        },
      },
      {
        title: 'Payout',
        dataIndex: 'settled',
        key: 'settled',
        width: 150,
        align: 'right' as const,
        render: (value: number, record: MultiFundingsRecord) => (
          <span style={{ color: getAmountColor(value), fontWeight: 500 }}>
            {formatAmount(value, record.currency)}
          </span>
        ),
      },
    ],
    [],
  );

  // Dynamically calculate total table width
  const tableScrollX = useMemo(() => {
    const totalWidth = columns.reduce((sum, col) => {
      return sum + (typeof col.width === 'number' ? col.width : 100);
    }, 0);
    return totalWidth;
  }, [columns]);

  // Show error if exists
  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<MultiFundingsRecord>
        columns={columns}
        dataSource={data}
        rowKey={(record, index) =>
          `${record.happenedDate}-${record.funding}-${index}`
        }
        loading={loading}
        tableLayout="fixed"
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: total,
          onChange: (newPage, newPageSize) => {
            if (newPageSize === pageSize) {
              onPageChange(newPage - 1);
            }
          },
          onShowSizeChange: (_, size) => onPageSizeChange(size),
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total) => `Total ${total} records`,
        }}
        size="small"
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
          ),
        }}
        scroll={{ x: tableScrollX }}
      />
    </div>
  );
};
