import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Alert, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  SummaryResponse,
  MonthlySummaryTableRow,
  UserConfig,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import { isMonthlyDetailClickable, parseUserConfig } from '@/utils/dashboard';
import { useAuthStore, useThemeStore } from '@/stores';
import './dashboard.css';

const { Link, Text } = Typography;

// Get amount color based on value
const getAmountColor = (value: number): string => {
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#52c41a'; // Green for positive or zero
};

interface MonthlySummaryTableProps {
  data: SummaryResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  merchantId?: string;
}

export const MonthlySummaryTable: React.FC<MonthlySummaryTableProps> = ({
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
  const { config } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  // Parse user config
  const userConfig: UserConfig = useMemo(
    () => parseUserConfig(config),
    [config],
  );

  // Check if month column is clickable
  const isClickable = useMemo(() => {
    if (!data) return false;
    return isMonthlyDetailClickable(
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

  // Navigate to monthly detail page
  const navigateToDetail = useCallback(
    (record: MonthlySummaryTableRow) => {
      // Get merchantId from props or from hierarchy_user_data
      const targetMerchantId =
        merchantId || data?.hierarchy_user_data?.merchant_id || '';
      // Get isIsv from original transaction record (need to find it)
      const originalRecord = data?.transactions?.find(
        (t) => t.date_month === record.month,
      );
      const isIsv = originalRecord?.is_isv === 1;

      // Navigate to detail page with monthly type
      // month format is "Jul 2024" as displayed in the table
      const params = new URLSearchParams({
        type: 'monthly',
        merchantId: targetMerchantId,
        month: record.month, // Use the display format "Jul 2024"
        isIsv: String(isIsv),
      });
      navigate(`/detail?${params.toString()}`);
    },
    [navigate, merchantId, data],
  );

  // Convert transactions to table rows
  const tableData: (MonthlySummaryTableRow & {
    grossRaw: number;
    netRaw: number;
  })[] = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.map((record, index) => ({
      key: `${record.db_year_month}-${index}`,
      month: record.date_month,
      dbYearMonth: record.db_year_month,
      totalTranx: record.num_tran,
      gross: formatCurrency(record.gross, record.currency),
      net: formatCurrency(record.net, record.currency),
      grossRaw: record.gross,
      netRaw: record.net,
      paymentMethods: record.vendor,
      currency: record.currency,
    }));
  }, [data]);

  // Define table columns
  const columns: ColumnsType<MonthlySummaryTableRow> = useMemo(
    () => [
      {
        title: 'Month',
        dataIndex: 'month',
        key: 'month',
        align: 'left',
        render: (text: string, record: MonthlySummaryTableRow) => {
          if (isClickable) {
            return (
              <Link
                style={{ color: primaryColor }}
                onClick={() => navigateToDetail(record)}
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
        title: 'Net*',
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
    ],
    [isClickable, primaryColor, navigateToDetail],
  );

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
      <Table<MonthlySummaryTableRow>
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
