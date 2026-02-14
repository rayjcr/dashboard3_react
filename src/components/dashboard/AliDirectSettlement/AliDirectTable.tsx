import React, { useMemo } from 'react';
import { Table, Typography, Empty, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  AliDirectResponse,
  AliDirectTableRow,
  AliDirectRecord,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import '../dashboard.css';

const { Text } = Typography;

// Get amount color based on value
const getAmountColor = (value: number): string => {
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#52c41a'; // Green for positive or zero
};

interface AliDirectTableProps {
  data: AliDirectResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Format date by extracting the date part from ISO string
 * @param dateStr ISO date string, e.g. "2022-03-03T16:00:00.000Z"
 * @returns Date string, e.g. "2022-03-03"
 */
function formatDateFromISO(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Get date display string
 * If start date equals end date, show only one date
 * Otherwise show date range
 */
function getDateDisplay(startDate: string, endDate: string): string {
  const start = formatDateFromISO(startDate);
  const end = formatDateFromISO(endDate);

  if (start === end) {
    return start;
  }
  return `${start} - ${end}`;
}

/**
 * Get time range display string
 */
function getTimeRangeDisplay(startTime: string, endTime: string): string {
  return `${startTime || ''} - ${endTime || ''}`;
}

/**
 * Process data, calculate row merging and Daily Settlement Amount
 */
function processTableData(
  records: AliDirectRecord[],
  currency: string,
): AliDirectTableRow[] {
  if (!records || records.length === 0) return [];

  // First create base row data
  const rows: AliDirectTableRow[] = records.map((record, index) => {
    const merchantDate = getDateDisplay(
      record.merchant_start_date,
      record.merchant_end_date,
    );
    const chinaDate = getDateDisplay(
      record.china_start_date,
      record.china_end_date,
    );

    return {
      key: `${index}`,
      merchantDate,
      merchantTimeRange: getTimeRangeDisplay(
        record.merchant_start_time,
        record.merchant_end_time,
      ),
      merchantSubTotalTranx: record.number_of_transaction,
      merchantGross: formatCurrency(record.gross, record.currency || currency),
      merchantNet: formatCurrency(record.net, record.currency || currency),
      merchantDailySettlement: '', // Calculate later
      chinaDate,
      chinaTimeRange: getTimeRangeDisplay(
        record.china_start_time,
        record.china_end_time,
      ),
      chinaSubTotalTranx: record.number_of_transaction,
      chinaGross: formatCurrency(record.gross, record.currency || currency),
      chinaNet: formatCurrency(record.net, record.currency || currency),
      chinaDailySettlement: '', // Calculate later
      currency: record.currency || currency,
      rawMerchantDate: merchantDate,
      rawChinaDate: chinaDate,
      rawNet: record.net,
      rawGross: record.gross,
    };
  });

  // Calculate merchant timezone Daily Settlement Amount and row merging
  const merchantDateGroups = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const group = merchantDateGroups.get(row.rawMerchantDate) || [];
    group.push(index);
    merchantDateGroups.set(row.rawMerchantDate, group);
  });

  merchantDateGroups.forEach((indices) => {
    // Calculate the net sum for this group
    const totalNet = indices.reduce((sum, idx) => sum + rows[idx].rawNet, 0);
    const settlementStr = formatCurrency(totalNet, rows[indices[0]].currency);

    // Set rowSpan for the first row, set to 0 for other rows
    rows[indices[0]].merchantRowSpan = indices.length;
    rows[indices[0]].merchantDailySettlement = settlementStr;

    for (let i = 1; i < indices.length; i++) {
      rows[indices[i]].merchantRowSpan = 0;
      rows[indices[i]].merchantDailySettlement = settlementStr;
    }
  });

  // Calculate China timezone Daily Settlement Amount and row merging
  const chinaDateGroups = new Map<string, number[]>();
  rows.forEach((row, index) => {
    const group = chinaDateGroups.get(row.rawChinaDate) || [];
    group.push(index);
    chinaDateGroups.set(row.rawChinaDate, group);
  });

  chinaDateGroups.forEach((indices) => {
    // Calculate the net sum for this group
    const totalNet = indices.reduce((sum, idx) => sum + rows[idx].rawNet, 0);
    const settlementStr = formatCurrency(totalNet, rows[indices[0]].currency);

    // Set rowSpan for the first row, set to 0 for other rows
    rows[indices[0]].chinaRowSpan = indices.length;
    rows[indices[0]].chinaDailySettlement = settlementStr;

    for (let i = 1; i < indices.length; i++) {
      rows[indices[i]].chinaRowSpan = 0;
      rows[indices[i]].chinaDailySettlement = settlementStr;
    }
  });

  return rows;
}

export const AliDirectTable: React.FC<AliDirectTableProps> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  // Get merchant timezone name
  const merchantTimezone = data?.merchantTimezone || 'Timezone';

  // Convert records to table rows with row merge calculation
  const tableData: AliDirectTableRow[] = useMemo(() => {
    if (!data?.aliDirect) return [];
    return processTableData(data.aliDirect, 'CNY');
  }, [data]);

  // Define table columns
  const columns: ColumnsType<AliDirectTableRow> = useMemo(() => {
    return [
      // Merchant timezone group
      {
        title: merchantTimezone,
        children: [
          {
            title: 'Date',
            dataIndex: 'merchantDate',
            key: 'merchantDate',
            align: 'center',
            width: 140,
          },
          {
            title: 'Time',
            dataIndex: 'merchantTimeRange',
            key: 'merchantTimeRange',
            align: 'center',
            width: 160,
          },
        ],
      },
      {
        title: 'Sub Total Transactions',
        dataIndex: 'merchantSubTotalTranx',
        key: 'merchantSubTotalTranx',
        align: 'right',
        width: 160,
      },
      {
        title: 'Gross',
        dataIndex: 'merchantGross',
        key: 'merchantGross',
        align: 'right',
        width: 120,
        render: (text: string, record: AliDirectTableRow) => (
          <span
            style={{ color: getAmountColor(record.rawGross), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Net',
        dataIndex: 'merchantNet',
        key: 'merchantNet',
        align: 'right',
        width: 120,
        render: (text: string, record: AliDirectTableRow) => (
          <span
            style={{ color: getAmountColor(record.rawNet), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Daily Settlement Amount',
        dataIndex: 'merchantDailySettlement',
        key: 'merchantDailySettlement',
        align: 'right',
        width: 180,
        onCell: (record: AliDirectTableRow) => ({
          rowSpan: record.merchantRowSpan,
        }),
        render: (text: string, record: AliDirectTableRow) => (
          <Text strong style={{ color: getAmountColor(record.rawNet) }}>
            {text}
          </Text>
        ),
      },
      // China timezone group
      {
        title: 'China timezone',
        children: [
          {
            title: 'Date',
            dataIndex: 'chinaDate',
            key: 'chinaDate',
            align: 'center',
            width: 140,
          },
          {
            title: 'Time',
            dataIndex: 'chinaTimeRange',
            key: 'chinaTimeRange',
            align: 'center',
            width: 160,
          },
        ],
      },
      {
        title: 'Sub Total Transactions',
        dataIndex: 'chinaSubTotalTranx',
        key: 'chinaSubTotalTranx',
        align: 'right',
        width: 160,
      },
      {
        title: 'Gross',
        dataIndex: 'chinaGross',
        key: 'chinaGross',
        align: 'right',
        width: 120,
        render: (text: string, record: AliDirectTableRow) => (
          <span
            style={{ color: getAmountColor(record.rawGross), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Net',
        dataIndex: 'chinaNet',
        key: 'chinaNet',
        align: 'right',
        width: 120,
        render: (text: string, record: AliDirectTableRow) => (
          <span
            style={{ color: getAmountColor(record.rawNet), fontWeight: 500 }}
          >
            {text}
          </span>
        ),
      },
      {
        title: 'Daily Settlement Amount',
        dataIndex: 'chinaDailySettlement',
        key: 'chinaDailySettlement',
        align: 'right',
        width: 180,
        onCell: (record: AliDirectTableRow) => ({
          rowSpan: record.chinaRowSpan,
        }),
        render: (text: string, record: AliDirectTableRow) => (
          <Text strong style={{ color: getAmountColor(record.rawNet) }}>
            {text}
          </Text>
        ),
      },
    ];
  }, [merchantTimezone]);

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<AliDirectTableRow>
        columns={columns}
        dataSource={tableData}
        loading={loading}
        bordered
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: data?.total_records || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (newPage) => {
            onPageChange(newPage - 1);
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
        scroll={{ x: 1600 }}
      />
    </div>
  );
};
