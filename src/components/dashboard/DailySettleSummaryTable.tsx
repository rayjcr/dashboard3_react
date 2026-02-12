import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Typography, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  SummaryResponse,
  DailySettleSummaryTableRow,
  DailySettleRecord,
  UserConfig,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import { isDailyDetailClickable, parseUserConfig } from '@/utils/dashboard';
import { useAuthStore, useThemeStore } from '@/stores';
import './dashboard.css';

const { Link, Text } = Typography;

interface DailySettleSummaryTableProps {
  data: SummaryResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Whether to show Method column, not shown when !selectedNode.hasMultiFundings */
  showMethodColumn: boolean;
  /** Merchant ID (optional, for detail page navigation) */
  merchantId?: string;
}

export const DailySettleSummaryTable: React.FC<
  DailySettleSummaryTableProps
> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showMethodColumn,
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

  // Get merchantId for detail navigation
  const detailMerchantId =
    merchantId || data?.hierarchy_user_data?.merchant_id || '';

  // Check if date column is clickable
  const isClickable = useMemo(() => {
    if (!data) return false;
    return isDailyDetailClickable(
      userConfig,
      data.hierarchy_user_data?.merchant_id,
    );
  }, [userConfig, data]);

  // Handle date link click - navigate to detail page with type=settle
  const handleDateClick = useCallback(
    (dbDateMonth: string) => {
      if (!detailMerchantId || !sessionId) return;

      const params = new URLSearchParams({
        type: 'settle',
        merchantId: detailMerchantId,
        date: dbDateMonth,
        isIsv: 'false', // Settle summary defaults to not ISV
      });

      navigate(`/detail?${params.toString()}`);
    },
    [detailMerchantId, sessionId, navigate],
  );

  // Convert transactions to table rows
  const tableData: DailySettleSummaryTableRow[] = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.map((record, index) => {
      // Cast to DailySettleRecord type for type safety
      const settleRecord = record as unknown as DailySettleRecord;

      return {
        key: `${settleRecord.date_month}-${settleRecord.vendor}-${index}`,
        // Date (Settlement time) -> date_month + (timezone_name)
        dateSettlement: `${settleRecord.date_month} (${
          settleRecord.timezone_name || ''
        })`,
        // Original date (for click navigation)
        dbDateMonth: settleRecord.date_month,
        // Total Tranx -> num_tran, default to 0 if null
        totalTranx: settleRecord.num_tran ?? 0,
        // Gross -> gross (amount type)
        gross: formatCurrency(settleRecord.gross, settleRecord.currency),
        // Method -> vendor
        method: settleRecord.vendor || '',
        // Payout -> net (amount type)
        payout: formatCurrency(settleRecord.net, settleRecord.currency),
        currency: settleRecord.currency,
      };
    });
  }, [data]);

  // Define table columns
  const columns: ColumnsType<DailySettleSummaryTableRow> = useMemo(() => {
    const baseColumns: ColumnsType<DailySettleSummaryTableRow> = [
      {
        title: 'Date (Settlement time)',
        dataIndex: 'dateSettlement',
        key: 'dateSettlement',
        align: 'left',
        render: (text: string, record: DailySettleSummaryTableRow) => {
          if (isClickable) {
            return (
              <Link
                style={{ color: primaryColor }}
                onClick={() => handleDateClick(record.dbDateMonth)}
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
      },
    ];

    // Conditionally add Method column based on showMethodColumn prop
    if (showMethodColumn) {
      baseColumns.push({
        title: 'Method',
        dataIndex: 'method',
        key: 'method',
        align: 'left',
      });
    }

    // Add Payout column
    baseColumns.push({
      title: 'Payout',
      dataIndex: 'payout',
      key: 'payout',
      align: 'left',
    });

    return baseColumns;
  }, [showMethodColumn, primaryColor, isClickable, handleDateClick]);

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<DailySettleSummaryTableRow>
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: page + 1, // API uses 0-based, Ant Design uses 1-based
          pageSize: pageSize,
          total: data?.total_records || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (newPage) => {
            onPageChange(newPage - 1); // Convert back to 0-based
          },
          onShowSizeChange: (_, newSize) => {
            onPageSizeChange(newSize);
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
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
