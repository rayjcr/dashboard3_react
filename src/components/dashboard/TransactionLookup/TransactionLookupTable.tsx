import React, { useMemo, useState } from 'react';
import { Table, Button, Space, Empty, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type {
  TransactionLookupResponse,
  TransactionLookupRecord,
} from '@/types/dashboard';
import {
  formatPaymentMethod,
  formatTransactionType,
  formatParentTransactionId,
  getScoreColor,
  getDisputeTag,
  getActionColumnTitle,
  getActionButtonsVisibility,
} from '@/utils/transactionLookup';
import { formatCurrency } from '@/utils/currency';
import { RefundModal } from './RefundModal';
import { CaptureModal } from './CaptureModal';
import { CancelConfirmModal } from './CancelConfirmModal';
import '../dashboard.css';

interface TransactionLookupTableProps {
  data: TransactionLookupResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hasUPI: boolean;
  hasPreAuth: boolean;
  canRefund: boolean;
  visibleColumns: string[];
  onRefresh: () => void;
}

export const TransactionLookupTable: React.FC<TransactionLookupTableProps> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hasUPI,
  hasPreAuth,
  canRefund,
  visibleColumns,
  onRefresh,
}) => {
  const { message } = App.useApp();

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedRefundRecord, setSelectedRefundRecord] =
    useState<TransactionLookupRecord | null>(null);

  // Capture modal state
  const [captureModalOpen, setCaptureModalOpen] = useState(false);
  const [selectedCaptureRecord, setSelectedCaptureRecord] =
    useState<TransactionLookupRecord | null>(null);

  // Handle Refund button click
  const handleRefundClick = (record: TransactionLookupRecord) => {
    setSelectedRefundRecord(record);
    setRefundModalOpen(true);
  };

  // Handle Refund success
  const handleRefundSuccess = () => {
    message.success('Refund successful');
    onRefresh();
  };

  // Handle Refund modal close
  const handleRefundModalClose = () => {
    setRefundModalOpen(false);
    setSelectedRefundRecord(null);
  };

  // Handle Capture button click
  const handleCaptureClick = (record: TransactionLookupRecord) => {
    setSelectedCaptureRecord(record);
    setCaptureModalOpen(true);
  };

  // Handle Capture success
  const handleCaptureSuccess = () => {
    message.success('Capture successful');
    onRefresh();
  };

  // Handle Capture modal close
  const handleCaptureModalClose = () => {
    setCaptureModalOpen(false);
    setSelectedCaptureRecord(null);
  };

  // Cancel confirm modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelRecord, setSelectedCancelRecord] =
    useState<TransactionLookupRecord | null>(null);

  // Handle Cancel button click
  const handleCancelClick = (record: TransactionLookupRecord) => {
    setSelectedCancelRecord(record);
    setCancelModalOpen(true);
  };

  // Handle Cancel success
  const handleCancelSuccess = () => {
    message.success('Cancel successful');
    onRefresh();
  };

  // Handle Cancel modal close
  const handleCancelModalClose = () => {
    setCancelModalOpen(false);
    setSelectedCancelRecord(null);
  };

  // Define table columns
  const columns: ColumnsType<TransactionLookupRecord> = useMemo(() => {
    // List of configurable column keys
    const configurableColumnKeys = [
      'reference',
      'reference2',
      'extral_reference',
      'tranx_status',
      'payment_gateway',
      'auth_currency',
      'auth_amount',
      'amount_captured',
      'risk_score',
      'error_code',
      'dispute_tag',
      'transaction_tag',
      'terminal_id',
      'original_merchant_name_english',
    ];

    // All column definitions
    const allColumns: ColumnsType<TransactionLookupRecord> = [
      {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        align: 'left',
        width: 140,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {value}
          </span>
        ),
      },
      {
        title: 'Store Name',
        dataIndex: 'store_name',
        key: 'store_name',
        align: 'left',
        width: 150,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {value}
          </span>
        ),
      },
      {
        title: 'Transaction ID',
        dataIndex: 'transaction_id',
        key: 'transaction_id',
        align: 'left',
        width: 170,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {value}
          </span>
        ),
      },
      {
        title: 'Parent Transaction ID',
        dataIndex: 'parent_transaction_id',
        key: 'parent_transaction_id',
        align: 'left',
        width: 170,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatParentTransactionId(value)}
          </span>
        ),
      },
      {
        title: 'Reference ID',
        dataIndex: 'reference',
        key: 'reference',
        align: 'left',
        width: 150,
      },
      {
        title: 'Reference2',
        dataIndex: 'reference2',
        key: 'reference2',
        align: 'left',
        width: 150,
      },
      {
        title: 'Extral Reference',
        dataIndex: 'extral_reference',
        key: 'extral_reference',
        align: 'left',
        width: 150,
        render: (value) => value || '',
      },
      {
        title: 'Date/Time',
        dataIndex: 'time_created',
        key: 'time_created',
        align: 'left',
        width: 110,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {value || ''}
          </span>
        ),
      },
      {
        title: 'Transaction Type',
        dataIndex: 'transaction_type',
        key: 'transaction_type',
        align: 'left',
        width: 135,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatTransactionType(value)}
          </span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'tranx_status',
        key: 'tranx_status',
        align: 'left',
        width: 80,
      },
      {
        title: 'Payment Method',
        dataIndex: 'payment_method',
        key: 'payment_method',
        align: 'left',
        width: 135,
        render: (value) => (
          <span style={{ wordBreak: 'break-all', lineHeight: '1.3' }}>
            {formatPaymentMethod(value)}
          </span>
        ),
      },
      {
        title: 'Gateway',
        dataIndex: 'payment_gateway',
        key: 'payment_gateway',
        align: 'left',
        width: 100,
      },
      {
        title: 'Card Number',
        dataIndex: 'buyer_id',
        key: 'buyer_id',
        align: 'left',
        width: 150,
      },
      {
        title: 'Vendor Reference',
        dataIndex: 'method_trans_id',
        key: 'method_trans_id',
        align: 'left',
        width: 150,
      },
      {
        title: 'Auth Currency',
        dataIndex: 'auth_currency',
        key: 'auth_currency',
        align: 'left',
        width: 120,
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        align: 'left',
        width: 120,
        render: (value, record) => {
          if (value === 0 || value === null || value === undefined) return 'NA';
          return formatCurrency(value, record.auth_currency || 'USD');
        },
      },
      {
        title: 'Auth Amount',
        dataIndex: 'auth_amount',
        key: 'auth_amount',
        align: 'left',
        width: 130,
        render: (value, record) => {
          if (value === null || value === undefined || value === '') return '-';
          return formatCurrency(value, record.auth_currency || 'USD');
        },
      },
      {
        title: getActionColumnTitle(hasUPI, hasPreAuth),
        key: 'action',
        align: 'center',
        width: 180,
        render: (_, record) => {
          const buttons = getActionButtonsVisibility(
            record,
            canRefund,
            hasPreAuth,
          );

          // Unified red button style
          const actionButtonStyle: React.CSSProperties = {
            backgroundColor: '#ff4d4f',
            borderColor: '#ff4d4f',
            color: '#fff',
          };

          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Space size="small" wrap>
                {buttons.showCapture && (
                  <Button
                    size="small"
                    style={actionButtonStyle}
                    onClick={() => handleCaptureClick(record)}
                  >
                    Capture
                  </Button>
                )}
                {buttons.showRefund && (
                  <Button
                    size="small"
                    style={actionButtonStyle}
                    onClick={() => handleRefundClick(record)}
                  >
                    Refund
                  </Button>
                )}
                {buttons.showCancel && (
                  <Button
                    size="small"
                    style={actionButtonStyle}
                    onClick={() => handleCancelClick(record)}
                  >
                    Cancel
                  </Button>
                )}
                {buttons.showStatus && <span>{buttons.statusText}</span>}
              </Space>
            </div>
          );
        },
      },
      {
        title: 'Captured Amount',
        dataIndex: 'amount_captured',
        key: 'amount_captured',
        align: 'left',
        width: 140,
        render: (value, record) => {
          if (value === null || value === undefined || value === '') return '-';
          return formatCurrency(value, record.auth_currency || 'USD');
        },
      },
      {
        title: 'Sales',
        dataIndex: 'sales',
        key: 'sales',
        align: 'left',
        width: 120,
        render: (value, record) => {
          if (value === null || value === undefined || value === '') return '-';
          return formatCurrency(value, record.auth_currency || 'USD');
        },
      },
      {
        title: 'Tip',
        dataIndex: 'tip',
        key: 'tip',
        align: 'left',
        width: 100,
        render: (value, record) => {
          if (value === null || value === undefined || value === '') return '-';
          return formatCurrency(value, record.auth_currency || 'USD');
        },
      },
      {
        title: 'Score',
        dataIndex: 'risk_score',
        key: 'risk_score',
        align: 'left',
        width: 80,
        render: (value) => {
          const color = getScoreColor(value);
          return value !== undefined && value !== null ? (
            <span style={{ color }}>{value}</span>
          ) : (
            ''
          );
        },
      },
      {
        title: 'Reason Code',
        dataIndex: 'error_code',
        key: 'error_code',
        align: 'left',
        width: 100,
      },
      {
        title: 'Login Code',
        dataIndex: 'login_code',
        key: 'login_code',
        align: 'left',
        width: 100,
      },
      {
        title: 'Dispute Tag',
        key: 'dispute_tag',
        align: 'left',
        width: 100,
        render: (_, record) => getDisputeTag(record),
      },
      {
        title: 'Transaction Tag',
        dataIndex: 'transaction_tag',
        key: 'transaction_tag',
        align: 'left',
        width: 120,
      },
      {
        title: 'Terminal ID',
        dataIndex: 'terminal_id',
        key: 'terminal_id',
        align: 'left',
        width: 100,
      },
      {
        title: 'Store of Original Payment',
        dataIndex: 'original_merchant_name_english',
        key: 'original_merchant_name_english',
        align: 'left',
        width: 180,
      },
    ];

    // Filter columns: if it's a configurable column, check if it's in visibleColumns
    const filteredColumns = allColumns.filter((col) => {
      const key = col.key as string;
      // If it's not a configurable column, always show
      if (!configurableColumnKeys.includes(key)) {
        return true;
      }
      // If it's a configurable column, show based on visibleColumns
      return visibleColumns.includes(key);
    });

    return filteredColumns;
  }, [hasUPI, hasPreAuth, canRefund, visibleColumns]);

  // Dynamically calculate total table width
  const tableScrollX = useMemo(() => {
    const totalWidth = columns.reduce((sum, col) => {
      return sum + (typeof col.width === 'number' ? col.width : 100);
    }, 0);
    return totalWidth;
  }, [columns]);

  // Add key to records
  const tableData = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.map((record, index) => ({
      ...record,
      key: record.transaction_id || `${index}`,
    }));
  }, [data]);

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<TransactionLookupRecord>
        columns={columns}
        dataSource={tableData}
        loading={loading}
        tableLayout="fixed"
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: data?.totalRecords ? parseInt(data.totalRecords, 10) : 0,
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

      {/* Refund Modal */}
      <RefundModal
        open={refundModalOpen}
        record={selectedRefundRecord}
        merchantId={data?.merchant_id || ''}
        onClose={handleRefundModalClose}
        onSuccess={handleRefundSuccess}
      />

      {/* Capture Modal */}
      <CaptureModal
        open={captureModalOpen}
        record={selectedCaptureRecord}
        merchantId={data?.merchant_id || ''}
        onClose={handleCaptureModalClose}
        onSuccess={handleCaptureSuccess}
      />

      {/* Cancel Confirm Modal */}
      <CancelConfirmModal
        open={cancelModalOpen}
        record={selectedCancelRecord}
        merchantId={data?.merchant_id || ''}
        onClose={handleCancelModalClose}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
};
