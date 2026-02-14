import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Alert, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  SummaryResponse,
  DailySummaryTableRow,
  UserConfig,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import {
  isDailyDetailClickable,
  getStatusDisplay,
  parseUserConfig,
  shouldShowPayoutColumn,
} from '@/utils/dashboard';
import { useAuthStore, useThemeStore } from '@/stores';
import './dashboard.css';

const { Link, Text } = Typography;

// Status color mapping
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Settled: { bg: '#d4edda', text: '#155724' },
  Pending: { bg: '#fff3cd', text: '#856404' },
  Processing: { bg: '#cce5ff', text: '#004085' },
  Failed: { bg: '#f8d7da', text: '#721c24' },
  Cancelled: { bg: '#e2e3e5', text: '#383d41' },
  default: { bg: '#f0f0f0', text: '#666666' },
};

// Get amount color based on value
const getAmountColor = (value: number): string => {
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#52c41a'; // Green for positive or zero
};

interface DailySummaryTableProps {
  data: SummaryResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  merchantId?: string;
}

export const DailySummaryTable: React.FC<DailySummaryTableProps> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  merchantId,
}) => {
  const navigate = useNavigate();
  const { config, sessionId } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  // Parse user config
  const userConfig: UserConfig = useMemo(
    () => parseUserConfig(config),
    [config],
  );

  // Check if is Elavon merchant
  const isElavon = data?.isElavonSite || data?.hasElavonChild || false;

  // Check if should show Payout column
  const showPayout = useMemo(() => {
    return shouldShowPayoutColumn(data?.hierarchy_user_data?.merchant_id);
  }, [data]);

  // Get merchantId for detail navigation
  const detailMerchantId =
    merchantId || data?.hierarchy_user_data?.merchant_id || '';

  // Handle date link click - navigate to detail page
  const handleDateClick = useCallback(
    (dbYearMonth: string, isIsv: number) => {
      if (!detailMerchantId || !sessionId) return;

      const params = new URLSearchParams({
        merchantId: detailMerchantId,
        date: dbYearMonth,
        isIsv: String(isIsv === 1),
      });

      navigate(`/detail?${params.toString()}`);
    },
    [detailMerchantId, sessionId, navigate],
  );

  // Check if date column is clickable
  const isClickable = useMemo(() => {
    if (!data) return false;
    return isDailyDetailClickable(
      userConfig,
      data.hierarchy_user_data?.merchant_id,
    );
  }, [userConfig, data]);

  // Check if should show content: isMultiCurrency === false OR merchantId has value
  const shouldShowContent = useMemo(() => {
    if (merchantId) return true;
    if (data && data.isMultiCurrency === false) return true;
    return false;
  }, [data, merchantId]);

  // Convert transactions to table rows
  const tableData: (DailySummaryTableRow & {
    grossRaw: number;
    netRaw: number;
    payoutRaw: number;
  })[] = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.map((record, index) => ({
      key: `${record.db_year_month}-${index}`,
      dateMonth: record.date_month,
      dbYearMonth: record.db_year_month,
      totalTranx: record.num_tran,
      gross: formatCurrency(record.gross, record.currency),
      net: formatCurrency(record.net, record.currency),
      payout: formatCurrency(record.payout, record.currency),
      grossRaw: record.gross,
      netRaw: record.net,
      payoutRaw: record.payout,
      status: getStatusDisplay(
        record.status,
        record.settle_date,
        data.umfEnabled,
        data.hasJkoPay,
        data.isElavonSite,
      ),
      settleDate: record.settle_date,
      paymentMethods: record.vendor,
      currency: record.currency,
      isIsv: record.is_isv,
    }));
  }, [data]);

  // Define table columns
  const columns: ColumnsType<DailySummaryTableRow> = useMemo(() => {
    const baseColumns: ColumnsType<DailySummaryTableRow> = [
      {
        title: 'Date (Creation Time)',
        dataIndex: 'dateMonth',
        key: 'dateMonth',
        align: 'left',
        render: (text: string, record: DailySummaryTableRow) => {
          if (isClickable) {
            return (
              <Link
                style={{ color: primaryColor }}
                onClick={() =>
                  handleDateClick(record.dbYearMonth, record.isIsv)
                }
              >
                {text}
              </Link>
            );
          }
          return <Text>{text}</Text>;
        },
      },
      {
        title: 'Total Tranx',
        dataIndex: 'totalTranx',
        key: 'totalTranx',
        align: 'left',
      },
      {
        title: 'Gross',
        dataIndex: 'gross',
        key: 'gross',
        align: 'left',
        render: (text: string, record) => (
          <span
            style={{ color: getAmountColor(record.grossRaw), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Net',
        dataIndex: 'net',
        key: 'net',
        align: 'left',
        render: (text: string, record) => (
          <span
            style={{ color: getAmountColor(record.netRaw), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      },
    ];

    // Conditionally add Payout column
    if (showPayout) {
      baseColumns.push({
        title: 'Payout',
        dataIndex: 'payout',
        key: 'payout',
        align: 'left',
        render: (text: string, record) => (
          <span
            style={{ color: getAmountColor(record.payoutRaw), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      });
    }

    // Add remaining columns
    baseColumns.push(
      {
        title: isElavon ? 'Status*' : 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'left',
        render: (text: string) => {
          const statusKey = text?.split(' ')[0] || 'default';
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
              {text}
            </Tag>
          );
        },
      },
      {
        title: 'Payment Methods',
        dataIndex: 'paymentMethods',
        key: 'paymentMethods',
        align: 'left',
        render: (text: string) => {
          if (!text) return '-';
          const methods = text
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
    );

    return baseColumns;
  }, [isClickable, isElavon, showPayout, primaryColor, handleDateClick]);

  // Show message if no content to display (after all hooks)
  if (!loading && data && !shouldShowContent) {
    return (
      <Alert
        title="* Please go to node page for transaction details"
        type="info"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<DailySummaryTableRow>
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: page + 1, // API uses 0-based, Ant Design uses 1-based
          pageSize: pageSize,
          total: data?.total_records || 0,
          onChange: (newPage, newPageSize) => {
            // Only trigger page change if pageSize hasn't changed
            // (onShowSizeChange handles pageSize changes)
            if (newPageSize === pageSize) {
              onPageChange(newPage - 1); // Convert back to 0-based
            }
          },
          onShowSizeChange: (_, size) => onPageSizeChange(size),
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total) => `Total ${total} records`,
        }}
        size="middle"
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
          ),
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};
