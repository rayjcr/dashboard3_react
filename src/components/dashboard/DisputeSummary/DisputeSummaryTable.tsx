/**
 * Dispute Summary Table Component (Refactored)
 * Main table component that uses Context and modular modal components
 */

import React, { useMemo, useCallback } from 'react';
import { Table, Typography, Button, Tag, Empty } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ColumnsType } from 'antd/es/table';
import type {
  DisputeListResponse,
  DisputeSummaryTableRow,
  DisputeRecord,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/stores';
import { disputeApi } from '@/services/api/disputeApi';
import {
  DisputeModalsProvider,
  useDisputeModals,
} from './DisputeModalsContext';
import { DisputeDetailModal } from './DisputeDetailModal';
import { DisputeActionModal } from './DisputeActionModal';
import { PPCPProvideInfoModal } from './PPCPProvideInfoModal';
import { AfterpayProvideInfoModal } from './AfterpayProvideInfoModal';
import { KlarnaProvideInfoModal } from './KlarnaProvideInfoModal';
import {
  shouldShowActionButton,
  getStatusTagColor,
  getStatusDisplayText,
} from './utils';
import '../dashboard.css';

const { Text } = Typography;

interface DisputeSummaryTableProps {
  data: DisputeListResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEvidenceSubmitted?: () => void;
  message: MessageInstance;
}

/**
 * Inner table component that uses the modal context
 */
const DisputeSummaryTableInner: React.FC<
  Omit<DisputeSummaryTableProps, 'message'>
> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEvidenceSubmitted,
}) => {
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  const {
    openDetailModal,
    openActionModal,
    setDetailModalLoading,
    setDisputeNotes,
    message,
  } = useDisputeModals();

  // Handle case ID click - open detail modal and fetch data
  const handleCaseIdClick = useCallback(
    async (record: DisputeSummaryTableRow) => {
      openDetailModal(record);

      try {
        const response = await disputeApi.getDisputeDetail(record.caseId);
        if (response.code === 200) {
          setDisputeNotes(response.notes || []);
        } else {
          message.error('Failed to load dispute details');
        }
      } catch (err) {
        console.error('Failed to fetch dispute detail:', err);
        message.error('Failed to load dispute details');
      } finally {
        setDetailModalLoading(false);
      }
    },
    [openDetailModal, setDetailModalLoading, setDisputeNotes, message],
  );

  // Handle Action button click
  const handleActionClick = useCallback(
    (record: DisputeSummaryTableRow) => {
      openActionModal(record);
    },
    [openActionModal],
  );

  // Convert transactions to table rows
  const tableData: DisputeSummaryTableRow[] = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.map((record: DisputeRecord, index: number) => ({
      key: `${record.case_id}-${index}`,
      id: record.id,
      caseId: record.case_id || '-',
      status: record.status || '-',
      disputeAmount: formatCurrency(record.amount, record.currency),
      timeCreated: record.time_created || '-',
      timeUpdated: record.time_updated || '-',
      paymentTransactionId: record.payment_transaction_id || '-',
      paymentMethod: record.vendor || '-',
      reason: record.reason_code || '-',
      type: record.itme_transaction_type || '-',
      caseExpirationTime: record.case_expiration_date || '-',
      currency: record.currency,
      vendor: record.vendor,
      description: record.description || '-',
      merchantId: record.merchant_id || '',
      requests: record.requests || undefined,
    }));
  }, [data]);

  // Define table columns
  const columns: ColumnsType<DisputeSummaryTableRow> = useMemo(() => {
    return [
      {
        title: 'Operation',
        key: 'operation',
        align: 'center',
        width: 100,
        fixed: 'left',
        render: (_: unknown, record: DisputeSummaryTableRow) => {
          if (shouldShowActionButton(record.status, record.vendor)) {
            return (
              <Button
                type="primary"
                size="small"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                onClick={() => handleActionClick(record)}
              >
                Action
              </Button>
            );
          }
          return <Text type="secondary">-</Text>;
        },
      },
      {
        title: 'Dispute case ID',
        dataIndex: 'caseId',
        key: 'caseId',
        align: 'left',
        width: 280,
        ellipsis: true,
        render: (text: string, record: DisputeSummaryTableRow) => (
          <Text
            copyable={{ text }}
            style={{
              fontSize: 12,
              color: primaryColor,
              cursor: 'pointer',
            }}
            onClick={() => handleCaseIdClick(record)}
          >
            {text}
          </Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 160,
        render: (status: string) => (
          <Tag color={getStatusTagColor(status)}>
            {getStatusDisplayText(status)}
          </Tag>
        ),
      },
      {
        title: 'Dispute Amount',
        dataIndex: 'disputeAmount',
        key: 'disputeAmount',
        align: 'right',
        width: 130,
      },
      {
        title: 'Time Created',
        dataIndex: 'timeCreated',
        key: 'timeCreated',
        align: 'center',
        width: 180,
      },
      {
        title: 'Last updated Time',
        dataIndex: 'timeUpdated',
        key: 'timeUpdated',
        align: 'center',
        width: 180,
      },
      {
        title: 'Payment Transaction ID',
        dataIndex: 'paymentTransactionId',
        key: 'paymentTransactionId',
        align: 'left',
        width: 280,
        ellipsis: true,
        render: (text: string) => (
          <Text copyable={{ text }} style={{ fontSize: 12 }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Payment Method',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        align: 'center',
        width: 130,
      },
      {
        title: 'Reason',
        dataIndex: 'reason',
        key: 'reason',
        align: 'left',
        width: 200,
        ellipsis: true,
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        align: 'center',
        width: 120,
      },
      {
        title: 'Case Expiration Time',
        dataIndex: 'caseExpirationTime',
        key: 'caseExpirationTime',
        align: 'center',
        width: 180,
      },
    ];
  }, [primaryColor, handleCaseIdClick, handleActionClick]);

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<DisputeSummaryTableRow>
        columns={columns}
        dataSource={tableData}
        loading={loading}
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
        scroll={{ x: 1800 }}
      />

      {/* Modal Components */}
      <DisputeDetailModal />
      <DisputeActionModal onEvidenceSubmitted={onEvidenceSubmitted} />
      <PPCPProvideInfoModal />
      <AfterpayProvideInfoModal />
      <KlarnaProvideInfoModal />
    </div>
  );
};

/**
 * Main exported component wrapped with Context Provider
 */
export const DisputeSummaryTable: React.FC<DisputeSummaryTableProps> = ({
  message,
  ...props
}) => {
  return (
    <DisputeModalsProvider message={message}>
      <DisputeSummaryTableInner {...props} />
    </DisputeModalsProvider>
  );
};

export default DisputeSummaryTable;
