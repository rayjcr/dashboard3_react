import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Space,
  Spin,
  Table,
  Alert,
  Button,
  Tag,
  Row,
  Col,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuthStore, useThemeStore, useDashboardStore } from '@/stores';
import { summaryApi } from '@/services/api/summaryApi';
import { formatCurrency } from '@/utils/currency';
import {
  downloadCSV,
  generateDetailReportCSV,
  getDateTimeString,
} from '@/utils/download';
import { DownloadButtons } from '@/components/dashboard';
import type {
  DailyDetailReportResponse,
  DailyDetailTransaction,
  DailyDetailDispute,
  DailyDetailMonthlyFee,
  DailyDetailSettlementFee,
  DailyDetailReserve,
  DailyDetailItemizedFee,
  DailyDetailApexFee,
  TransactionInfo,
} from '@/types/dashboard';
import { shouldShowVAT, getTipsMessages } from '@/types/dashboard';
import '@/components/dashboard/dashboard.css';

const { Title, Text } = Typography;

// Get amount color based on value
const getAmountColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '#666666';
  if (value < 0) return '#ff4d4f'; // Red for negative
  return '#52c41a'; // Green for positive or zero
};

/**
 * Detail Report Type: 'daily', 'monthly', or 'settle'
 */
type DetailReportType = 'daily' | 'monthly' | 'settle';

/**
 * Detail Report Page - supports Daily, Monthly, and Settle detail reports
 * URL params:
 * - type: 'daily' | 'monthly' | 'settle' (default: 'daily')
 * - merchantId: merchant ID
 * - date: date string (YYYY-MM-DD for daily/settle)
 * - month: month string (e.g., "Jul 2024" for monthly)
 * - isIsv: is ISV flag
 */
export const DetailReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionId } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const { nodeSharedInfo } = useDashboardStore();
  const isDark = currentTheme === 'dark';
  const primaryColor = isDark ? '#7c3aed' : '#1890ff';

  // Get URL parameters
  const reportType: DetailReportType =
    (searchParams.get('type') as DetailReportType) || 'daily';
  const merchantId = searchParams.get('merchantId') || '';
  const date = searchParams.get('date') || '';
  const month = searchParams.get('month') || '';
  const isIsv = searchParams.get('isIsv') === 'true';

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DailyDetailReportResponse | null>(null);

  // Pagination state for transactions table
  const [transPage, setTransPage] = useState(1);
  const [transPageSize, setTransPageSize] = useState(10);

  // Summary info collapsed state (persisted to localStorage)
  const SUMMARY_COLLAPSED_KEY = 'detail-summary-collapsed';
  const [summaryCollapsed, setSummaryCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(SUMMARY_COLLAPSED_KEY);
    return saved === 'true';
  });

  // Toggle summary collapsed state
  const toggleSummaryCollapsed = useCallback(() => {
    setSummaryCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem(SUMMARY_COLLAPSED_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Ref to track if data has been fetched
  const hasFetchedRef = useRef(false);

  // Get gateway and flags from nodeSharedInfo (persisted)
  const { gateway, hasReserve, hasItemizedFee } = nodeSharedInfo;
  const showVAT = shouldShowVAT(gateway);

  // Fetch data - only once
  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchData = async () => {
      // Validate required parameters based on report type
      const hasRequiredParams =
        reportType === 'monthly'
          ? merchantId && month && sessionId
          : merchantId && date && sessionId;

      if (!hasRequiredParams) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      hasFetchedRef.current = true;
      setLoading(true);
      setError(null);

      try {
        let response: DailyDetailReportResponse;

        if (reportType === 'monthly') {
          // Fetch monthly detail report
          response = await summaryApi.fetchMonthlyDetailReport({
            merchantId,
            month,
            sessionId,
            isIsv,
          });
        } else {
          // Fetch daily detail report (for both 'daily' and 'settle' types)
          response = await summaryApi.fetchDailyDetailReport({
            merchantId,
            date,
            sessionId,
            isIsv,
            type: reportType === 'settle' ? 'settle' : 'daily',
          });
        }
        setData(response);
      } catch (err) {
        console.error(`Failed to fetch ${reportType} detail report:`, err);
        setError(`Failed to load ${reportType} detail report`);
        hasFetchedRef.current = false; // Allow retry on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [merchantId, date, month, sessionId, isIsv, reportType]);

  // Back button handler - navigate back to dashboard with correct tab
  const handleBack = useCallback(() => {
    // Navigate to dashboard with the appropriate tab based on report type
    let tab = 'daily';
    if (reportType === 'monthly') {
      tab = 'monthly';
    } else if (reportType === 'settle') {
      tab = 'settle';
    }
    navigate(`/dashboard?tab=${tab}`);
  }, [navigate, reportType]);

  // Currency for formatting
  const currency = data?.currency || 'USD';

  // Merchant timezone for time conversion
  const mttimezone = data?.mttimezone || '';

  // Format date/time with timezone on new line
  // If the string contains (Timezone), display timezone on a new line with smaller, gray font
  const formatDateTimeWithNewLine = (
    dateStr: string | null,
  ): React.ReactNode => {
    if (!dateStr) return '-';
    // Match pattern like "2026-01-29 10:30:00 (PST)" or "2026-01-29 10:30:00 (America/Los_Angeles)"
    const timezoneMatch = dateStr.match(/^(.+?)\s*(\([^)]+\))$/);
    if (timezoneMatch) {
      const [, dateTimePart, timezonePart] = timezoneMatch;
      return (
        <>
          {dateTimePart}
          <br />
          <span style={{ fontSize: '11px', color: '#999999' }}>
            {timezonePart}
          </span>
        </>
      );
    }
    return dateStr;
  };

  // Tips messages
  const tipsMessages = useMemo(() => {
    return getTipsMessages(gateway, currency);
  }, [gateway, currency]);

  // Download CSV handler
  const handleDownloadCSV = useCallback(() => {
    if (!data) return;

    // Calculate hasAdditionalFeeData for CSV show/hide logic
    const hasMonthlyFee = data.monthlyFee && data.monthlyFee.length > 0;
    const hasSettlementFee =
      data.settlementFee && data.settlementFee.length > 0;
    const hasApexFee = data.apexFee && data.apexFee.length > 0;
    const csvHasAdditionalFeeData =
      hasMonthlyFee ||
      hasSettlementFee ||
      hasApexFee ||
      hasReserve ||
      hasItemizedFee;

    const dateOrMonth = reportType === 'monthly' ? month : date;
    const csvContent = generateDetailReportCSV(data, {
      reportType,
      dateOrMonth,
      isIsv,
      showVAT,
      hasReserve,
      hasItemizedFee,
      mttimezone,
      hasAdditionalFeeData: csvHasAdditionalFeeData,
    });

    // Generate filename based on report type
    let filePrefix = 'Daily';
    if (reportType === 'monthly') {
      filePrefix = 'Monthly';
    } else if (reportType === 'settle') {
      filePrefix = 'Settle';
    }
    const filename = `${filePrefix}_Detail_${
      data.store_name || 'Report'
    }_${getDateTimeString()}.csv`;
    downloadCSV(csvContent, filename);
    message.success('CSV downloaded successfully');
  }, [
    data,
    reportType,
    month,
    date,
    isIsv,
    showVAT,
    hasReserve,
    hasItemizedFee,
    mttimezone,
  ]);

  // Check if has misc fee (apexFee)
  const hasMiscFee = data?.apexFee && data.apexFee.length > 0;

  // Check if any transaction has refund type (for showing Refund Fee column)
  const hasRefundTransaction = useMemo(() => {
    if (!data?.transactions) return false;
    return data.transactions.some(
      (t) =>
        t.transaction_type &&
        t.transaction_type.toLowerCase().includes('refund'),
    );
  }, [data?.transactions]);

  // Format transaction type
  const formatTransactionType = (type: string): string => {
    if (type === 'pos_payment') return 'charge';
    if (type === 'pos_refund') return 'refund';
    return type;
  };

  // Format payment method
  const formatPaymentMethod = (method: string): string => {
    if (method?.toLowerCase() === 'wechatpay') return 'WXP';
    if (method?.toLowerCase() === 'alipay') return 'ALP';
    return method || '-';
  };

  // Transactions table columns
  const transactionColumns: ColumnsType<DailyDetailTransaction> =
    useMemo(() => {
      const columns: ColumnsType<DailyDetailTransaction> = [
        {
          title: 'Transaction ID',
          dataIndex: 'transaction_id',
          key: 'transaction_id',
          render: (val) => val || '-',
        },
        {
          title: 'Reference ID',
          dataIndex: 'reference',
          key: 'reference',
          render: (val) => val || '-',
        },
        {
          title: 'Date/Time',
          dataIndex: 'time_created_local',
          key: 'time_created_local',
          render: (val) => formatDateTimeWithNewLine(val),
        },
        {
          title: 'Transaction Type',
          dataIndex: 'transaction_type',
          key: 'transaction_type',
          render: (val) => formatTransactionType(val) || '-',
        },
        {
          title: 'Payment Method',
          dataIndex: 'payment_method',
          key: 'payment_method',
          render: (val) => formatPaymentMethod(val),
        },
        {
          title: 'Card Number',
          dataIndex: 'buyer_id',
          key: 'buyer_id',
          render: (val) => val || '-',
        },
        {
          title: 'Vendor Reference',
          dataIndex: 'method_trans_id',
          key: 'method_trans_id',
          render: (val) => val || '-',
        },
        {
          title: 'Gross',
          dataIndex: 'total',
          key: 'total',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        },
        {
          title: 'Discount',
          dataIndex: 'merchant_discount',
          key: 'merchant_discount',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        },
        {
          title: 'Authorization',
          dataIndex: 'merchant_fixed',
          key: 'merchant_fixed',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        },
      ];

      // Conditionally add VAT column
      if (showVAT) {
        columns.push({
          title: 'VAT',
          dataIndex: 'vat_fee',
          key: 'vat_fee',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        });
      }

      // Conditionally add Refund Fee column
      if (hasRefundTransaction) {
        columns.push({
          title: 'Refund Fee',
          dataIndex: 'refund_fee',
          key: 'refund_fee',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        });
      }

      // Add Customized Fee column
      columns.push({
        title: 'Customized Fee',
        dataIndex: 'customized_fee',
        key: 'customized_fee',
        render: (val, record) => (
          <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
            {formatCurrency(val, record.currency)}
          </span>
        ),
      });

      // Add remaining columns
      columns.push(
        {
          title: 'Net',
          dataIndex: 'net',
          key: 'net',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        },
        {
          title: 'Tip',
          dataIndex: 'tip',
          key: 'tip',
          render: (val, record) => (
            <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
              {formatCurrency(val, record.currency)}
            </span>
          ),
        },
        {
          title: 'Login Code',
          dataIndex: 'login_code',
          key: 'login_code',
          render: (val) => val || '-',
        },
        {
          title: 'Settle time',
          dataIndex: 'time_settled',
          key: 'time_settled',
          render: (val, record) => {
            // If transaction_type is 'cc_chargeback', show empty string
            if (record.transaction_type === 'cc_chargeback') {
              return '';
            }
            return formatDateTimeWithNewLine(val);
          },
        },
        {
          title: 'Store of Original Payment',
          dataIndex: 'original_merchant_name_english',
          key: 'original_merchant_name_english',
          render: (val) => val || '-',
        },
      );

      return columns;
    }, [showVAT, hasRefundTransaction]);

  // Dispute table columns
  const disputeColumns: ColumnsType<DailyDetailDispute> = [
    {
      title: 'Dispute ID',
      dataIndex: 'item_transaction_id',
      key: 'item_transaction_id',
      render: (val) => val || '-',
    },
    {
      title: 'Payment Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (val) => val || '-',
    },
    {
      title: 'Date/Time',
      dataIndex: 'time_created_local',
      key: 'time_created_local',
      render: (val) => formatDateTimeWithNewLine(val),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
    {
      title: 'Gross',
      dataIndex: 'total',
      key: 'total',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'merchant_discount',
      key: 'merchant_discount',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Authorization',
      dataIndex: 'merchant_fixed',
      key: 'merchant_fixed',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Net',
      dataIndex: 'net',
      key: 'net',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Dispute Tag',
      dataIndex: 'status',
      key: 'status',
      render: (val) => val || '-',
    },
    {
      title: 'Settle time',
      dataIndex: 'time_settled',
      key: 'time_settled',
      render: (val) => formatDateTimeWithNewLine(val),
    },
  ];

  // Monthly Fee columns - specific rules for Monthly Fee table
  const monthlyFeeColumns: ColumnsType<DailyDetailMonthlyFee> = [
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
    },
    {
      title: 'Reference ID',
      dataIndex: 'reference',
      key: 'reference',
      render: (val) => val || '-',
    },
    // reference2 - Not displayed by default, add condition later
    // extral_reference - Not displayed by default, add condition later
    {
      title: 'Date/Time',
      dataIndex: 'time_created_local',
      key: 'time_created_local',
      render: (val) => formatDateTimeWithNewLine(val),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: () => 'Monthly System Fee', // Fixed display
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: () => '', // Display empty
    },
    {
      title: 'Card Number',
      dataIndex: 'buyer_id',
      key: 'buyer_id',
      render: (val) => val || '-',
    },
    {
      title: 'Vendor Reference',
      dataIndex: 'method_trans_id',
      key: 'method_trans_id',
      render: (val) => val || '-',
    },
    {
      title: 'Gross',
      dataIndex: 'total',
      key: 'total',
      render: () => '', // Display empty
    },
    {
      title: 'Discount',
      dataIndex: 'merchant_discount',
      key: 'merchant_discount',
      render: () => '', // Display empty
    },
    {
      title: 'Authorization',
      dataIndex: 'auth_amount',
      key: 'auth_amount',
      render: () => '', // Display empty
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Net',
      dataIndex: 'net',
      key: 'net',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'tip',
      key: 'tip',
      render: () => '', // Display empty
    },
    {
      title: 'Login Code',
      dataIndex: 'login_code',
      key: 'login_code',
      render: (val) => val || '-',
    },
    {
      title: 'Settle time',
      dataIndex: 'time_settled',
      key: 'time_settled',
      render: (val, record) => {
        // If transaction_type === 'cc_chargeback', display empty
        if (record.transaction_type === 'cc_chargeback') {
          return '';
        }
        return formatDateTimeWithNewLine(val);
      },
    },
    {
      title: 'Store of Original Payment',
      dataIndex: 'original_merchant_name_english',
      key: 'original_merchant_name_english',
      render: (val) => val || '-',
    },
  ];

  // Settlement Fee columns - keeps original structure
  const settlementFeeColumns: ColumnsType<DailyDetailSettlementFee> = [
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
    },
    {
      title: 'Reference ID',
      dataIndex: 'reference',
      key: 'reference',
      render: (val) => val || '-',
    },
    // reference2 - Not displayed by default, add condition later
    // {
    //   title: 'Reference2',
    //   dataIndex: 'reference2',
    //   key: 'reference2',
    //   render: (val) => val || '-',
    // },
    // Extral Reference - Not displayed by default, add condition later
    // {
    //   title: 'Extral Reference',
    //   dataIndex: 'extral_reference',
    //   key: 'extral_reference',
    //   render: (val) => val || '-',
    // },
    {
      title: 'Date/Time',
      dataIndex: 'time_created_local',
      key: 'time_created_local',
      render: (val) => formatDateTimeWithNewLine(val),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: () => 'Settlement Fee',
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: () => '',
    },
    {
      title: 'Card Number',
      dataIndex: 'buyer_id',
      key: 'buyer_id',
      render: (val) => val || '-',
    },
    {
      title: 'Vendor Reference',
      dataIndex: 'method_trans_id',
      key: 'method_trans_id',
      render: (val) => val || '-',
    },
    {
      title: 'Gross',
      dataIndex: 'total',
      key: 'total',
      render: () => '',
    },
    {
      title: 'Discount',
      dataIndex: 'merchant_discount',
      key: 'merchant_discount',
      render: () => '',
    },
    {
      title: 'Authorization',
      dataIndex: 'auth_amount',
      key: 'auth_amount',
      render: () => '',
    },
    {
      title: 'Fee',
      dataIndex: 'fee',
      key: 'fee',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Net',
      dataIndex: 'net',
      key: 'net',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'tip',
      key: 'tip',
      render: () => '',
    },
    {
      title: 'Login Code',
      dataIndex: 'login_code',
      key: 'login_code',
      render: (val) => val || '-',
    },
    {
      title: 'Settle time',
      dataIndex: 'time_settled',
      key: 'time_settled',
      render: (val, record) => {
        if (record.transaction_type === 'cc_chargeback') {
          return '';
        }
        return formatDateTimeWithNewLine(val);
      },
    },
    {
      title: 'Store of Original Payment',
      dataIndex: 'original_merchant_name_english',
      key: 'original_merchant_name_english',
      render: (val) => val || '-',
    },
  ];

  // Reserve columns
  const reserveColumns: ColumnsType<DailyDetailReserve> = [
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
    },
    {
      title: 'Reference',
      dataIndex: 'item_transaction_id',
      key: 'item_transaction_id',
      render: (val) => val || '-',
    },
    {
      title: 'Date/Time',
      dataIndex: 'time_created_local',
      key: 'time_created_local',
      render: (val) => formatDateTimeWithNewLine(val),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
    },
    {
      title: 'Status',
      dataIndex: 'settle_status',
      key: 'settle_status',
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Settle time',
      dataIndex: 'time_settled',
      key: 'time_settled',
      render: (val) => formatDateTimeWithNewLine(val),
    },
  ];

  // Itemized Fee columns
  const itemizedFeeColumns: ColumnsType<DailyDetailItemizedFee> = [
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
    },
    {
      title: 'Reference',
      dataIndex: 'item_transaction_id',
      key: 'item_transaction_id',
      render: (val) => val || '-',
    },
    {
      title: 'Fee Name',
      dataIndex: 'fee_name',
      key: 'fee_name',
    },
    {
      title: 'Date/Time',
      dataIndex: 'time_created_local',
      key: 'time_created_local',
      render: (val) => formatDateTimeWithNewLine(val),
    },
    {
      title: 'Status',
      dataIndex: 'settle_status',
      key: 'settle_status',
    },
    {
      title: 'Gross',
      dataIndex: 'total',
      key: 'total',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Settle time',
      dataIndex: 'time_settled',
      key: 'time_settled',
      render: (val) => formatDateTimeWithNewLine(val),
    },
  ];

  // Format Fee Name based on transaction_type
  const formatFeeName = (transactionType: string): string => {
    switch (transactionType) {
      case 'vault_tokenization_fee':
        return 'Token vault usage Fee';
      case 'authorization_fee':
        return 'Authorization Fee';
      case '3ds_fee':
        return '3DS Auth Fee';
      default:
        return transactionType || '-';
    }
  };

  // Misc Fee (Apex Fee) columns
  const miscFeeColumns: ColumnsType<DailyDetailApexFee> = [
    {
      title: 'Transaction ID',
      dataIndex: 'item_transaction_id',
      key: 'item_transaction_id',
      render: (val) => val || '-',
    },
    {
      title: 'Fee Name',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      render: (val) => formatFeeName(val),
    },
    {
      title: 'Date/Time',
      dataIndex: 'time_created_local',
      key: 'time_created_local',
      render: (val) => formatDateTimeWithNewLine(val),
    },
    {
      title: 'Gross',
      dataIndex: 'total',
      key: 'total',
      render: (val, record) => (
        <span style={{ color: getAmountColor(val), fontWeight: 500 }}>
          {formatCurrency(val, record.currency)}
        </span>
      ),
    },
    {
      title: 'Settle time',
      dataIndex: 'time_settled',
      key: 'time_settled',
      render: (val) => formatDateTimeWithNewLine(val),
    },
  ];

  // Check if has additional fee data (monthlyFee, settlementFee, apexFee, hasReserve, hasItemizedFee)
  const hasAdditionalFeeData = useMemo(() => {
    const hasMonthlyFee = data?.monthlyFee && data.monthlyFee.length > 0;
    const hasSettlementFee =
      data?.settlementFee && data.settlementFee.length > 0;
    const hasApexFee = data?.apexFee && data.apexFee.length > 0;
    return (
      hasMonthlyFee ||
      hasSettlementFee ||
      hasApexFee ||
      hasReserve ||
      hasItemizedFee
    );
  }, [
    data?.monthlyFee,
    data?.settlementFee,
    data?.apexFee,
    hasReserve,
    hasItemizedFee,
  ]);

  // Check if should show Payment Pending
  // Rule 1: pending_transactions_info.total_transactions > 0
  // Rule 2: pending_transactions_info.item_transactions > 0 AND hasAdditionalFeeData
  // Note: For 'settle' type, Payment Pending should NOT be shown
  const shouldShowPaymentPending = useMemo(() => {
    // For settle type, never show Payment Pending
    if (reportType === 'settle') return false;

    const info = data?.pending_transactions_info;
    if (!info) return false;
    if (info.total_transactions > 0) return true;
    if (info.item_transactions > 0 && hasAdditionalFeeData) return true;
    return false;
  }, [data?.pending_transactions_info, hasAdditionalFeeData, reportType]);

  // Check if should show Payment Settled
  // Rule 1: settled_transactions_info.total_transactions > 0
  // Rule 2: settled_transactions_info.item_transactions > 0 AND hasAdditionalFeeData
  const shouldShowPaymentSettled = useMemo(() => {
    const info = data?.settled_transactions_info;
    if (!info) return false;
    if (info.total_transactions > 0) return true;
    if (info.item_transactions > 0 && hasAdditionalFeeData) return true;
    return false;
  }, [data?.settled_transactions_info, hasAdditionalFeeData]);

  // For monthly report, check if should show Payment Summary (using transactions_info)
  const shouldShowPaymentSummary = useMemo(() => {
    if (reportType !== 'monthly') return false;
    const info = data?.transactions_info;
    if (!info) return false;
    if (info.total_transactions > 0) return true;
    if (info.item_transactions > 0 && hasAdditionalFeeData) return true;
    return false;
  }, [reportType, data?.transactions_info, hasAdditionalFeeData]);

  // Render summary table (Payment Pending / Payment Settled / Payment Summary) - Highlighted style
  // showRefundDetails: true for Payment Summary (Monthly), false for Payment Pending/Settled (Daily)
  const renderSummaryTable = (
    title: string,
    info: TransactionInfo | undefined,
    showRefundDetails: boolean = false,
  ) => {
    // Don't render if no info at all
    if (!info) return null;

    const subs = info.subs || [];

    // Helper to render amount with color
    const renderAmount = (value: string, rawValue?: number) => {
      // If it's a number row (not "Number of Transaction"), apply color
      if (rawValue !== undefined) {
        return (
          <span style={{ color: getAmountColor(rawValue), fontWeight: 500 }}>
            {value}
          </span>
        );
      }
      return value;
    };

    const columns: ColumnsType<{
      label: string;
      total: string;
      totalRaw?: number;
      isAmountRow?: boolean;
      [key: string]: string | number | boolean | undefined;
    }> = [
      {
        title: '',
        dataIndex: 'label',
        key: 'label',
        fixed: 'left',
        width: 180,
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: 'Total',
        dataIndex: 'total',
        key: 'total',
        width: 150,
        render: (text: string, record) =>
          record.isAmountRow
            ? renderAmount(text, record.totalRaw as number)
            : text,
      },
      ...subs.map((_, idx) => ({
        title: subs[idx].vendor,
        dataIndex: `sub_${idx}`,
        key: `sub_${idx}`,
        width: 150,
        render: (
          text: string,
          record: {
            isAmountRow?: boolean;
            [key: string]: string | number | boolean | undefined;
          },
        ) =>
          record.isAmountRow
            ? renderAmount(text, record[`sub_${idx}_raw`] as number)
            : text,
      })),
    ];

    const rows: Array<{
      key: string;
      label: string;
      total: string;
      totalRaw?: number;
      isAmountRow?: boolean;
      [key: string]: string | number | boolean | undefined;
    }> = [
      {
        key: 'num_trans',
        label: 'Number of Transaction',
        total: String(info.total_transactions),
        isAmountRow: false,
        ...subs.reduce(
          (acc, sub, idx) => ({
            ...acc,
            [`sub_${idx}`]: String(sub.total_transactions),
          }),
          {},
        ),
      },
      {
        key: 'sub_total',
        label: 'Sub Total',
        total: formatCurrency(info.gross, currency),
        totalRaw: info.gross,
        isAmountRow: true,
        ...subs.reduce(
          (acc, sub, idx) => ({
            ...acc,
            [`sub_${idx}`]: formatCurrency(sub.gross, currency),
            [`sub_${idx}_raw`]: sub.gross,
          }),
          {},
        ),
      },
    ];

    // Captured, Same Day Refund, Cross Day Refund - only for Payment Summary (Monthly)
    if (showRefundDetails) {
      rows.push(
        {
          key: 'captured',
          label: 'Captured',
          total: formatCurrency(info.captured || 0, currency),
          totalRaw: info.captured || 0,
          isAmountRow: true,
          ...subs.reduce(
            (acc, sub, idx) => ({
              ...acc,
              [`sub_${idx}`]: formatCurrency(sub.captured || 0, currency),
              [`sub_${idx}_raw`]: sub.captured || 0,
            }),
            {},
          ),
        },
        {
          key: 'same_day_refund',
          label: 'Same Day Refund',
          total: formatCurrency(info.same_day_refund_pv || 0, currency),
          totalRaw: info.same_day_refund_pv || 0,
          isAmountRow: true,
          ...subs.reduce(
            (acc, sub, idx) => ({
              ...acc,
              [`sub_${idx}`]: formatCurrency(
                sub.same_day_refund_pv || 0,
                currency,
              ),
              [`sub_${idx}_raw`]: sub.same_day_refund_pv || 0,
            }),
            {},
          ),
        },
        {
          key: 'cross_day_refund',
          label: 'Cross Day Refund',
          total: formatCurrency(info.x_day_refund_pv || 0, currency),
          totalRaw: info.x_day_refund_pv || 0,
          isAmountRow: true,
          ...subs.reduce(
            (acc, sub, idx) => ({
              ...acc,
              [`sub_${idx}`]: formatCurrency(
                sub.x_day_refund_pv || 0,
                currency,
              ),
              [`sub_${idx}_raw`]: sub.x_day_refund_pv || 0,
            }),
            {},
          ),
        },
      );
    }

    // Tip row
    rows.push({
      key: 'tip',
      label: 'Tip',
      total: formatCurrency(info.tip_total, currency),
      totalRaw: info.tip_total,
      isAmountRow: true,
      ...subs.reduce(
        (acc, sub, idx) => ({
          ...acc,
          [`sub_${idx}`]: formatCurrency(sub.tip_total, currency),
          [`sub_${idx}_raw`]: sub.tip_total,
        }),
        {},
      ),
    });

    // Fee row
    rows.push({
      key: 'fee',
      label: 'Fee',
      total: formatCurrency(info.fees, currency),
      totalRaw: info.fees,
      isAmountRow: true,
      ...subs.reduce(
        (acc, sub, idx) => ({
          ...acc,
          [`sub_${idx}`]: formatCurrency(sub.fees, currency),
          [`sub_${idx}_raw`]: sub.fees,
        }),
        {},
      ),
    });

    // VAT row (conditional)
    if (showVAT) {
      rows.push({
        key: 'vat',
        label: 'VAT',
        total: formatCurrency(info.vat_fee, currency),
        totalRaw: info.vat_fee,
        isAmountRow: true,
        ...subs.reduce(
          (acc, sub, idx) => ({
            ...acc,
            [`sub_${idx}`]: formatCurrency(sub.vat_fee, currency),
            [`sub_${idx}_raw`]: sub.vat_fee,
          }),
          {},
        ),
      });
    }
    // Reserve row (conditional)
    if (hasReserve) {
      rows.push({
        key: 'reserve',
        label: 'Reserve',
        total: formatCurrency(info.reserve || 0, currency),
        totalRaw: info.reserve || 0,
        isAmountRow: true,
        ...subs.reduce(
          (acc, _, idx) => ({
            ...acc,
            [`sub_${idx}`]: '--',
          }),
          {},
        ),
      });
    }

    // Itemized Fee row (conditional)
    if (hasItemizedFee) {
      rows.push({
        key: 'itemized_fee',
        label: 'Itemized Fee',
        total: formatCurrency(info.itemized_fee || 0, currency),
        totalRaw: info.itemized_fee || 0,
        isAmountRow: true,
        ...subs.reduce(
          (acc, _, idx) => ({
            ...acc,
            [`sub_${idx}`]: '--',
          }),
          {},
        ),
      });
    }

    // Misc Fee row (conditional)
    if (hasMiscFee) {
      rows.push({
        key: 'misc_fee',
        label: 'Misc Fee',
        total: formatCurrency(info.apex_fee || 0, currency),
        totalRaw: info.apex_fee || 0,
        isAmountRow: true,
        ...subs.reduce(
          (acc, _, idx) => ({
            ...acc,
            [`sub_${idx}`]: '--',
          }),
          {},
        ),
      });
    }

    // Net row
    rows.push({
      key: 'net',
      label: 'Net',
      total: formatCurrency(info.net, currency),
      totalRaw: info.net,
      isAmountRow: true,
      ...subs.reduce(
        (acc, sub, idx) => ({
          ...acc,
          [`sub_${idx}`]: formatCurrency(sub.net, currency),
          [`sub_${idx}_raw`]: sub.net,
        }),
        {},
      ),
    });

    return (
      <div
        style={{
          marginBottom: 16,
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          borderTop: `3px solid ${primaryColor}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 12px',
            background: '#e8e8e8',
            borderBottom: '1px solid #d9d9d9',
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 100,
              color: 'rgba(0, 0, 0, 0.85)',
            }}
          >
            {title}
          </Text>
        </div>
        <Table
          className="dashboard-table"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Alert title={error} type="error" showIcon />
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div style={{ padding: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Empty description="No data available" />
      </div>
    );
  }

  // Format date for display based on report type
  const formatDateDisplay = (): string => {
    if (reportType === 'monthly') {
      // For monthly, display "Month: Jul 2024"
      return `Month: ${month || ''}`;
    } else {
      // For daily, display "Date: January 28, 2026"
      if (!date) return '';
      try {
        const d = new Date(date);
        const formattedDate = d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        return `Date: ${formattedDate}`;
      } catch {
        return date;
      }
    }
  };

  // Net label based on report type
  const netLabel =
    reportType === 'monthly' ? 'Net of the month' : 'Net of the day';

  return (
    <div className="detail-report-page" style={{ padding: '16px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
        </div>

        {/* Date/Month Header - Simplified */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
            boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.9)',
          }}
        >
          <CalendarOutlined style={{ fontSize: 20, color: primaryColor }} />
          <div style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>
              {formatDateDisplay()}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {data.merchant_name || ''}
              {/* {data.store_name ? `· ${data.store_name}` : ''} */}
            </Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Tag
              color={
                data.status === 'PENDING'
                  ? 'orange'
                  : data.status === 'paid'
                    ? 'green'
                    : 'blue'
              }
            >
              {data.status || 'N/A'}
            </Tag>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {data.currency || 'USD'}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Info - With subtle inset dividers */}
      {/* Summary Info - Collapsible */}
      <Card
        size="small"
        style={{ marginBottom: 16 }}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={toggleSummaryCollapsed}
          >
            <Text style={{ fontSize: 14, fontWeight: 500 }}>
              {summaryCollapsed
                ? `From: ${(data.from || [])[0] || '-'} → To: ${
                    data.store_name || '-'
                  } | Status: ${data.status || '-'}`
                : 'Summary Info'}
            </Text>
            <Button
              type="text"
              size="small"
              icon={summaryCollapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                toggleSummaryCollapsed();
              }}
            />
          </div>
        }
        styles={{
          body: {
            display: summaryCollapsed ? 'none' : 'block',
            padding: summaryCollapsed ? 0 : '12px',
          },
        }}
      >
        <Row gutter={0}>
          <Col span={8}>
            <div
              style={{
                paddingRight: 16,
                position: 'relative',
                height: '100%',
              }}
            >
              {/* Subtle inset divider - full height with soft gradient */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: isDark
                    ? 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(0,0,0,0.15))'
                    : 'linear-gradient(to right, rgba(0,0,0,0.06), rgba(255,255,255,0.8))',
                }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                From
              </Text>
              <div style={{ marginTop: 4 }}>
                {(data.from || []).map((line, idx) => (
                  <div
                    key={`from-line-${idx}-${line}`}
                    style={{ fontSize: 13, fontWeight: idx === 0 ? 600 : 400 }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div
              style={{
                paddingLeft: 16,
                paddingRight: 16,
                position: 'relative',
                height: '100%',
              }}
            >
              {/* Subtle inset divider - full height with soft gradient */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: isDark
                    ? 'linear-gradient(to right, rgba(255,255,255,0.06), rgba(0,0,0,0.15))'
                    : 'linear-gradient(to right, rgba(0,0,0,0.06), rgba(255,255,255,0.8))',
                }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                To
              </Text>
              <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>
                {data.store_name || '-'}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ paddingLeft: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Status
              </Text>
              <div style={{ marginTop: 4, fontSize: 13 }}>
                {data.status || '-'}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Transaction Period Start
                </Text>
                <div style={{ fontSize: 13 }}>
                  {data.settlement_begin || '-'}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Transaction Period End
                </Text>
                <div style={{ fontSize: 13 }}>{data.settlement_end || '-'}</div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Transactions Section */}
      <div
        className="detail-section"
        style={{
          marginBottom: 16,
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            background: '#e8e8e8',
            borderBottom: '1px solid #d9d9d9',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 100,
              color: 'rgba(0, 0, 0, 0.85)',
            }}
          >
            Transactions
          </Text>
        </div>
        <Table
          className="dashboard-table"
          columns={transactionColumns}
          dataSource={
            data.transactions && data.transactions.length > 0
              ? data.transactions.map((t, idx) => ({
                  ...t,
                  key: `trans-${idx}`,
                }))
              : []
          }
          pagination={
            data.transactions && data.transactions.length > 0
              ? {
                  current: transPage,
                  pageSize: transPageSize,
                  total: data.transactions.length,
                  onChange: (page) => setTransPage(page),
                  onShowSizeChange: (_, size) => {
                    setTransPageSize(size);
                    setTransPage(1);
                  },
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '30', '50'],
                  showTotal: (total) => `Total ${total} records`,
                }
              : false
          }
          size="small"
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <div style={{ padding: '16px 0', color: 'rgba(0,0,0,0.45)' }}>
                No transaction data
              </div>
            ),
          }}
        />
      </div>

      {/* Disputes Section */}
      {data.disputes && data.disputes.length > 0 && (
        <div
          className="detail-section"
          style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: '#e8e8e8',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 100,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              Disputes
            </Text>
          </div>
          <Table
            className="dashboard-table"
            columns={disputeColumns}
            dataSource={data.disputes.map((d, idx) => ({
              ...d,
              key: `dispute-${idx}`,
            }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Monthly Fee Section */}
      {data.monthlyFee && data.monthlyFee.length > 0 && (
        <div
          className="detail-section"
          style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: '#e8e8e8',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 100,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              Monthly Fee
            </Text>
          </div>
          <Table
            className="dashboard-table"
            columns={monthlyFeeColumns}
            dataSource={data.monthlyFee.map((f, idx) => ({
              ...f,
              key: `monthlyFee-${idx}`,
            }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Settlement Fee Section */}
      {data.settlementFee && data.settlementFee.length > 0 && (
        <div
          className="detail-section"
          style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: '#e8e8e8',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 100,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              Settlement Fee
            </Text>
          </div>
          <Table
            className="dashboard-table"
            columns={settlementFeeColumns}
            dataSource={data.settlementFee.map((f, idx) => ({
              ...f,
              key: `settlementFee-${idx}`,
            }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Reserve Section */}
      {data.reserve && data.reserve.length > 0 && (
        <div
          className="detail-section"
          style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: '#e8e8e8',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 100,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              Reserve
            </Text>
          </div>
          <Table
            className="dashboard-table"
            columns={reserveColumns}
            dataSource={data.reserve.map((r, idx) => ({
              ...r,
              key: `reserve-${idx}`,
            }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Itemized Fee Section */}
      {data.itemizedFee && data.itemizedFee.length > 0 && (
        <div
          className="detail-section"
          style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: '#e8e8e8',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 100,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              Itemized Fee
            </Text>
          </div>
          <Table
            className="dashboard-table"
            columns={itemizedFeeColumns}
            dataSource={data.itemizedFee.map((f, idx) => ({
              ...f,
              key: `itemizedFee-${idx}`,
            }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Misc Fee Section */}
      {data.apexFee && data.apexFee.length > 0 && (
        <div
          className="detail-section"
          style={{
            marginBottom: 16,
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              background: '#e8e8e8',
              borderBottom: '1px solid #d9d9d9',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 100,
                color: 'rgba(0, 0, 0, 0.85)',
              }}
            >
              Misc Fee
            </Text>
          </div>
          <Table
            className="dashboard-table"
            columns={miscFeeColumns}
            dataSource={data.apexFee.map((f, idx) => ({
              ...f,
              key: `apexFee-${idx}`,
            }))}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </div>
      )}

      {/* Net of the day/month */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space align="center">
          <Text strong style={{ fontSize: 14 }}>
            {netLabel}:
          </Text>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'linear-gradient(135deg, #f6f8fc 0%, #eef2f7 100%)',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              boxShadow:
                'inset 0 1px 2px rgba(255,255,255,0.8), 0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: 'rgba(0, 0, 0, 0.85)',
                fontWeight: 600,
              }}
            >
              {formatCurrency(data.total_net, currency)}
            </Text>
          </div>
        </Space>
      </Card>

      {/* Tips and Payment Summary - Side by side */}
      <Row gutter={16} align="top">
        {/* Left: Tips - Auto height based on content */}
        <Col span={8}>
          <div
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '8px 12px',
                background: '#e8e8e8',
                borderBottom: '1px solid #d9d9d9',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 100,
                  color: 'rgba(0, 0, 0, 0.85)',
                }}
              >
                Tips
              </Text>
            </div>
            <div style={{ padding: '12px', background: '#fff' }}>
              {tipsMessages.map((tip, idx) => (
                <div
                  key={`tip-${idx}-${tip.slice(0, 20)}`}
                  style={{
                    padding: '8px 10px',
                    marginBottom: idx === tipsMessages.length - 1 ? 0 : 8,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: 'rgba(0, 0, 0, 0.65)',
                    borderRadius: 4,
                    borderLeft: '3px solid #bfbfbf',
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: tip }} />
                </div>
              ))}
            </div>
          </div>

          {/* Download CSV Button */}
          <DownloadButtons hasData={!!data} onDownloadCSV={handleDownloadCSV} />
        </Col>

        {/* Right: Payment Summaries */}
        <Col span={16}>
          {reportType === 'monthly' ? (
            /* Monthly: Show Payment Summary with Captured/Same Day Refund/Cross Day Refund */
            shouldShowPaymentSummary &&
            renderSummaryTable('Payment Summary', data.transactions_info, true)
          ) : (
            /* Daily: Show Payment Pending and Payment Settled without refund details */
            <>
              {/* Payment Pending Summary */}
              {shouldShowPaymentPending &&
                renderSummaryTable(
                  'Payment Pending',
                  data.pending_transactions_info,
                  false,
                )}

              {/* Payment Settled Summary */}
              {shouldShowPaymentSettled &&
                renderSummaryTable(
                  'Payment Settled',
                  data.settled_transactions_info,
                  false,
                )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

// Keep the old export name for backward compatibility
export const DailyDetailReportPage = DetailReportPage;
