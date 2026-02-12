/**
 * Download utility functions
 */

import { formatCurrency } from './currency';
import type {
  SummaryResponse,
  TransactionRecord,
  TransactionLookupResponse,
  TransactionLookupRecord,
  DisputeListResponse,
  DisputeRecord,
  DailySettleRecord,
} from '@/types/dashboard';

/**
 * Download CSV file
 */
export const downloadCSV = (content: string, filename: string) => {
  // Add BOM to support Excel correctly recognizing UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download PDF file (from Blob data)
 */
export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escape CSV field value
 */
const escapeCSVValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, double quote, or newline, wrap in double quotes and escape internal double quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generate Daily Summary CSV content
 * Table display: Date, Total Tranx, Gross, Net, Status, Payment Methods
 */
export const generateDailySummaryCSV = (data: SummaryResponse): string => {
  const transactions = data.transactions || [];

  // Build headers - consistent with table display, without Payout
  const headers = [
    'Date',
    'Total Tranx',
    'Gross',
    'Net',
    'Status',
    'Payment Methods',
  ];

  // Build data rows
  const rows = transactions.map((t: TransactionRecord) => {
    const row = [
      escapeCSVValue(t.date_month),
      escapeCSVValue(t.num_tran),
      escapeCSVValue(formatCurrency(t.gross, t.currency)),
      escapeCSVValue(formatCurrency(t.net, t.currency)),
      escapeCSVValue(t.status),
      escapeCSVValue(t.vendor),
    ];
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate Monthly Summary CSV content
 */
export const generateMonthlySummaryCSV = (data: SummaryResponse): string => {
  const transactions = data.transactions || [];

  // Build headers
  const headers = ['Month', 'Total Tranx', 'Gross', 'Net', 'Payment Methods'];

  // Build data rows
  const rows = transactions.map((t: TransactionRecord) => {
    const row = [
      escapeCSVValue(t.date_month),
      escapeCSVValue(t.num_tran),
      escapeCSVValue(formatCurrency(t.gross, t.currency)),
      escapeCSVValue(formatCurrency(t.net, t.currency)),
      escapeCSVValue(t.vendor),
    ];
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate Transaction Lookup CSV content
 * Consistent with table fields, Action column removed
 * Table column order: Location, Store Name, Transaction ID, Parent Transaction ID, Reference ID,
 *            Reference2, Extral Reference, Date/Time, Transaction Type, Status, Payment Method,
 *            Gateway, Card Number, Vendor Reference, Auth Currency, Total, Auth Amount,
 *            Captured Amount, Sales, Tip, Score, Reason Code, Login Code, Dispute Tag,
 *            Transaction Tag, Terminal ID, Store of Original Payment
 */
export const generateTransactionLookupCSV = (
  data: TransactionLookupResponse,
): string => {
  const transactions = data.transactions || [];

  // Build headers - consistent with table display, without Action
  const headers = [
    'Location',
    'Store Name',
    'Transaction ID',
    'Parent Transaction ID',
    'Reference ID',
    'Reference2',
    'Extral Reference',
    'Date/Time',
    'Transaction Type',
    'Status',
    'Payment Method',
    'Gateway',
    'Card Number',
    'Vendor Reference',
    'Auth Currency',
    'Total',
    'Auth Amount',
    'Captured Amount',
    'Sales',
    'Tip',
    'Score',
    'Reason Code',
    'Login Code',
    'Dispute Tag',
    'Transaction Tag',
    'Terminal ID',
    'Store of Original Payment',
  ];

  // Build data rows
  const rows = transactions.map((t: TransactionLookupRecord) => {
    const row = [
      escapeCSVValue(t.location),
      escapeCSVValue(t.store_name),
      escapeCSVValue(t.transaction_id),
      escapeCSVValue(t.parent_transaction_id),
      escapeCSVValue(t.reference),
      escapeCSVValue(t.reference2),
      escapeCSVValue(t.extral_reference),
      escapeCSVValue(t.time_created),
      escapeCSVValue(t.transaction_type),
      escapeCSVValue(t.tranx_status),
      escapeCSVValue(t.payment_method),
      escapeCSVValue(t.payment_gateway),
      escapeCSVValue(t.buyer_id),
      escapeCSVValue(t.method_trans_id),
      escapeCSVValue(t.auth_currency),
      escapeCSVValue(t.total),
      escapeCSVValue(t.auth_amount),
      escapeCSVValue(t.amount_captured),
      escapeCSVValue(t.sales),
      escapeCSVValue(t.tip),
      escapeCSVValue(t.risk_score),
      escapeCSVValue(t.error_code),
      escapeCSVValue(t.login_code),
      escapeCSVValue(t.dispute_tag),
      escapeCSVValue(t.transaction_tag),
      escapeCSVValue(t.terminal_id),
      escapeCSVValue(t.original_merchant_name_english),
    ];
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate Dispute Summary CSV content
 * Consistent with table fields, excluding Operation field
 * Table column order: Dispute case ID, Status, Dispute Amount, Time Created, Last updated Time,
 *                     Payment Transaction ID, Payment Method, Reason, Type, Case Expiration Time
 */
export const generateDisputeSummaryCSV = (
  data: DisputeListResponse,
): string => {
  const transactions = data.transactions || [];

  // Build headers - consistent with table display, without Operation
  const headers = [
    'Dispute case ID',
    'Status',
    'Dispute Amount',
    'Time Created',
    'Last updated Time',
    'Payment Transaction ID',
    'Payment Method',
    'Reason',
    'Type',
    'Case Expiration Time',
  ];

  // Build data rows
  const rows = transactions.map((t: DisputeRecord) => {
    const row = [
      escapeCSVValue(t.case_id),
      escapeCSVValue(t.status),
      escapeCSVValue(formatCurrency(t.amount, t.currency)),
      escapeCSVValue(t.time_created),
      escapeCSVValue(t.time_updated),
      escapeCSVValue(t.payment_transaction_id),
      escapeCSVValue(t.vendor),
      escapeCSVValue(t.reason_code),
      escapeCSVValue(t.itme_transaction_type),
      escapeCSVValue(t.case_expiration_date),
    ];
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate Daily Settle Summary CSV content
 * Consistent with table fields
 * Table column order: Date (Settlement time), Total Tranx, Gross, Method (optional), Payout
 */
export const generateDailySettleSummaryCSV = (
  data: SummaryResponse,
  showMethodColumn: boolean = true,
): string => {
  const transactions = data.transactions || [];

  // Build headers - consistent with table display
  const headers = showMethodColumn
    ? ['Date (Settlement time)', 'Total Tranx', 'Gross', 'Method', 'Payout']
    : ['Date (Settlement time)', 'Total Tranx', 'Gross', 'Payout'];

  // Build data rows
  const rows = transactions.map((record) => {
    const t = record as unknown as DailySettleRecord;
    const dateSettlement = `${t.date_month} (${t.timezone_name || ''})`;

    const row = showMethodColumn
      ? [
          escapeCSVValue(dateSettlement),
          escapeCSVValue(t.num_tran ?? 0),
          escapeCSVValue(formatCurrency(t.gross, t.currency)),
          escapeCSVValue(t.vendor),
          escapeCSVValue(formatCurrency(t.net, t.currency)),
        ]
      : [
          escapeCSVValue(dateSettlement),
          escapeCSVValue(t.num_tran ?? 0),
          escapeCSVValue(formatCurrency(t.gross, t.currency)),
          escapeCSVValue(formatCurrency(t.net, t.currency)),
        ];
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Generate current date time string for filename
 */
export const getDateTimeString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}_${hour}${minute}`;
};

/**
 * Detail Report CSV generation options
 */
export interface DetailReportCSVOptions {
  /** Report type: daily, monthly, or settle */
  reportType: 'daily' | 'monthly' | 'settle';
  /** Date (date for daily/settle, month for monthly) */
  dateOrMonth: string;
  /** Whether this is an ISV merchant */
  isIsv: boolean;
  /** Whether to show VAT */
  showVAT: boolean;
  /** Whether there is Reserve */
  hasReserve: boolean;
  /** Whether there is Itemized Fee */
  hasItemizedFee: boolean;
  /** Merchant timezone */
  mttimezone?: string;
  /** Whether there is additional fee data (used to determine whether to show Payment Pending/Settled) */
  hasAdditionalFeeData?: boolean;
}

/**
 * Format date time for CSV, directly use the original value
 */
const formatDateTimeForCSV = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  return dateStr;
};

/**
 * Generate Detail Report CSV content
 */
export const generateDetailReportCSV = (
  data: import('@/types/dashboard').DailyDetailReportResponse,
  options: DetailReportCSVOptions,
): string => {
  const {
    reportType,
    dateOrMonth,
    isIsv,
    showVAT,
    hasReserve,
    hasItemizedFee,
    hasAdditionalFeeData,
  } = options;
  const sections: string[] = [];
  const currency = data.currency || 'USD';

  // ========== Helper: Check if should show payment section ==========
  const shouldShowPaymentSection = (
    info: import('@/types/dashboard').TransactionInfo | undefined,
  ): boolean => {
    if (!info) return false;
    if (info.total_transactions > 0) return true;
    if (info.item_transactions > 0 && hasAdditionalFeeData) return true;
    return false;
  };

  // ========== 1. Basic Information ==========
  sections.push('Date,' + escapeCSVValue(dateOrMonth));
  sections.push('Store Name,' + escapeCSVValue(data.store_name || ''));

  // ISV merchant does not have Discount Rate and Authorization Fee
  if (!isIsv) {
    sections.push('Discount Rate,' + escapeCSVValue(data.merchant_rate || ''));
    sections.push(
      'Authorization Fee,' + escapeCSVValue(data.merchant_fixed_fee || ''),
    );
  }

  // ISV merchant Status is fixed as CLEARED
  sections.push(
    'Status,' + escapeCSVValue(isIsv ? 'CLEARED' : data.status || ''),
  );

  // Monthly report Transaction Period uses the date directly
  if (reportType === 'monthly') {
    sections.push('Transaction Period Start,' + escapeCSVValue(dateOrMonth));
    sections.push('Transaction Period End,' + escapeCSVValue(dateOrMonth));
  } else {
    sections.push(
      'Transaction Period Start,' + escapeCSVValue(data.settlement_begin || ''),
    );
    sections.push(
      'Transaction Period End,' + escapeCSVValue(data.settlement_end || ''),
    );
  }
  sections.push('');

  // ========== 2. Payment Summary ==========
  // showRefundDetails: true for Payment Summary (Monthly), false for Payment Pending/Settled (Daily)
  const renderTransactionInfo = (
    title: string,
    info: import('@/types/dashboard').TransactionInfo | undefined,
    showRefundDetails: boolean = false,
  ) => {
    if (!info) return;
    if (!shouldShowPaymentSection(info)) return;

    // Collect all payment methods
    const vendors = info.subs?.map((s) => s.vendor) || [];
    const allColumns = ['Total', ...vendors];

    // Headers
    sections.push(title);
    const headers = ['Item', ...allColumns];
    sections.push(headers.map(escapeCSVValue).join(','));

    // Helper function to get sub-item data
    const getSubValue = (
      vendor: string,
      key: keyof import('@/types/dashboard').TransactionInfoSub,
    ): number | string => {
      const sub = info.subs?.find((s) => s.vendor === vendor);
      return sub ? sub[key] ?? 0 : 0;
    };

    // Data rows
    const rows: string[][] = [];

    // Number of Transaction
    rows.push([
      'Number of Transaction',
      String(info.total_transactions ?? 0),
      ...vendors.map((v) => String(getSubValue(v, 'total_transactions') || 0)),
    ]);

    // Sub Total (gross)
    rows.push([
      'Sub Total',
      formatCurrency(info.gross, currency),
      ...vendors.map((v) =>
        formatCurrency(Number(getSubValue(v, 'gross')), currency),
      ),
    ]);

    // Captured, Same Day Refund, Cross Day Refund - only for Payment Summary (Monthly)
    if (showRefundDetails) {
      // Captured
      rows.push([
        'Captured',
        formatCurrency(info.captured, currency),
        ...vendors.map((v) =>
          formatCurrency(Number(getSubValue(v, 'captured') || 0), currency),
        ),
      ]);

      // Same Day Refund
      rows.push([
        'Same Day Refund',
        formatCurrency(info.same_day_refund_pv, currency),
        ...vendors.map((v) =>
          formatCurrency(
            Number(getSubValue(v, 'same_day_refund_pv') || 0),
            currency,
          ),
        ),
      ]);

      // Cross Day Refund
      rows.push([
        'Cross Day Refund',
        formatCurrency(info.x_day_refund_pv, currency),
        ...vendors.map((v) =>
          formatCurrency(
            Number(getSubValue(v, 'x_day_refund_pv') || 0),
            currency,
          ),
        ),
      ]);
    }

    // Tip
    rows.push([
      'Tip',
      formatCurrency(info.tip_total, currency),
      ...vendors.map((v) =>
        formatCurrency(Number(getSubValue(v, 'tip_total')), currency),
      ),
    ]);

    // Fee
    rows.push([
      'Fee',
      formatCurrency(info.fees, currency),
      ...vendors.map((v) =>
        formatCurrency(Number(getSubValue(v, 'fees')), currency),
      ),
    ]);

    // VAT (only show when showVAT is true)
    if (showVAT) {
      rows.push([
        'VAT',
        formatCurrency(info.vat_fee, currency),
        ...vendors.map((v) =>
          formatCurrency(Number(getSubValue(v, 'vat_fee')), currency),
        ),
      ]);
    }

    // Net
    rows.push([
      'Net',
      formatCurrency(info.net, currency),
      ...vendors.map((v) =>
        formatCurrency(Number(getSubValue(v, 'net')), currency),
      ),
    ]);

    rows.forEach((row) => sections.push(row.map(escapeCSVValue).join(',')));
    sections.push('');
  };

  if (reportType === 'monthly') {
    if (data.transactions_info) {
      // Monthly: show Captured, Same Day Refund, Cross Day Refund
      renderTransactionInfo('Payment Summary', data.transactions_info, true);
    }
  } else {
    // Daily and Settle types
    // For 'settle' type, do NOT show Payment Pending
    if (reportType !== 'settle' && data.pending_transactions_info) {
      // Daily: no Captured, Same Day Refund, Cross Day Refund
      renderTransactionInfo(
        'Payment Pending',
        data.pending_transactions_info,
        false,
      );
    }
    if (data.settled_transactions_info) {
      // Daily/Settle: no Captured, Same Day Refund, Cross Day Refund
      renderTransactionInfo(
        'Payment Settled',
        data.settled_transactions_info,
        false,
      );
    }
  }

  // ========== 3. Transactions ==========
  if (data.transactions && data.transactions.length > 0) {
    sections.push('Transactions');
    const transHeaders = [
      'Transaction ID',
      'Reference ID',
      'Date/Time',
      'Transaction Type',
      'Payment Method',
      'Card Number',
      'Vendor Reference',
      'Gross',
      'Discount',
      'Authorization',
      'Fee',
      'Net',
      'Tip',
      'Login Code',
      'Settle time',
      'Store of Original Payment',
    ];
    if (showVAT) {
      transHeaders.splice(12, 0, 'VAT');
    }
    sections.push(transHeaders.map(escapeCSVValue).join(','));

    data.transactions.forEach((t) => {
      const row = [
        t.transaction_id || '',
        t.reference || '',
        formatDateTimeForCSV(t.time_created_local),
        t.transaction_type || '',
        t.payment_method || '',
        t.buyer_id || '',
        t.method_trans_id || '',
        formatCurrency(t.total, currency),
        formatCurrency(t.merchant_discount, currency),
        formatCurrency(t.auth_amount, currency),
        formatCurrency(t.fee, currency),
        formatCurrency(t.net, currency),
        formatCurrency(t.tip, currency),
        t.login_code || '',
        t.transaction_type === 'cc_chargeback'
          ? ''
          : formatDateTimeForCSV(t.time_settled),
        t.original_merchant_name_english || '',
      ];
      if (showVAT) {
        row.splice(12, 0, formatCurrency(t.vat, currency));
      }
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  // ========== 4. Disputes ==========
  if (data.disputes && data.disputes.length > 0) {
    sections.push('Disputes');
    const disputeHeaders = [
      'Transaction ID',
      'Reference',
      'Date/Time',
      'Transaction Type',
      'Status',
      'Gross',
      'Settle time',
    ];
    sections.push(disputeHeaders.map(escapeCSVValue).join(','));

    data.disputes.forEach((d) => {
      const row = [
        d.transaction_id || '',
        d.item_transaction_id || '',
        formatDateTimeForCSV(d.time_created_local),
        d.transaction_type || '',
        d.settle_status || '',
        formatCurrency(d.total, currency),
        formatDateTimeForCSV(d.time_settled),
      ];
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  // ========== 5. Monthly Fee ==========
  if (data.monthlyFee && data.monthlyFee.length > 0) {
    sections.push('Monthly Fee');
    const monthlyFeeHeaders = [
      'Transaction ID',
      'Reference ID',
      'Date/Time',
      'Transaction Type',
      'Payment Method',
      'Card Number',
      'Vendor Reference',
      'Gross',
      'Discount',
      'Authorization',
      'Fee',
      'Net',
      'Tip',
      'Login Code',
      'Settle time',
      'Store of Original Payment',
    ];
    sections.push(monthlyFeeHeaders.map(escapeCSVValue).join(','));

    data.monthlyFee.forEach((f) => {
      const row = [
        f.transaction_id || '',
        f.reference || '',
        formatDateTimeForCSV(f.time_created_local),
        'Monthly System Fee',
        '',
        f.buyer_id || '',
        f.method_trans_id || '',
        '',
        '',
        '',
        formatCurrency(f.fee, currency),
        formatCurrency(f.net, currency),
        '',
        f.login_code || '',
        f.transaction_type === 'cc_chargeback'
          ? ''
          : formatDateTimeForCSV(f.time_settled),
        f.original_merchant_name_english || '',
      ];
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  // ========== 6. Settlement Fee ==========
  if (data.settlementFee && data.settlementFee.length > 0) {
    sections.push('Settlement Fee');
    const settlementFeeHeaders = [
      'Transaction ID',
      'Reference ID',
      'Date/Time',
      'Transaction Type',
      'Payment Method',
      'Card Number',
      'Vendor Reference',
      'Gross',
      'Discount',
      'Authorization',
      'Fee',
      'Net',
      'Tip',
      'Login Code',
      'Settle time',
      'Store of Original Payment',
    ];
    sections.push(settlementFeeHeaders.map(escapeCSVValue).join(','));

    data.settlementFee.forEach((f) => {
      const row = [
        f.transaction_id || '',
        f.reference || '',
        formatDateTimeForCSV(f.time_created_local),
        'Settlement Fee',
        '',
        f.buyer_id || '',
        f.method_trans_id || '',
        '',
        '',
        '',
        formatCurrency(f.fee, currency),
        formatCurrency(f.net, currency),
        '',
        f.login_code || '',
        f.transaction_type === 'cc_chargeback'
          ? ''
          : formatDateTimeForCSV(f.time_settled),
        f.original_merchant_name_english || '',
      ];
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  // ========== 7. Reserve ==========
  if (hasReserve && data.reserve && data.reserve.length > 0) {
    sections.push('Reserve');
    const reserveHeaders = [
      'Transaction ID',
      'Reference',
      'Date/Time',
      'Transaction Type',
      'Status',
      'Amount',
      'Settle time',
    ];
    sections.push(reserveHeaders.map(escapeCSVValue).join(','));

    data.reserve.forEach((r) => {
      const row = [
        r.transaction_id || '',
        r.item_transaction_id || '',
        formatDateTimeForCSV(r.time_created_local),
        r.transaction_type || '',
        r.settle_status || '',
        formatCurrency(r.total, currency),
        formatDateTimeForCSV(r.time_settled),
      ];
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  // ========== 8. Itemized Fee ==========
  if (hasItemizedFee && data.itemizedFee && data.itemizedFee.length > 0) {
    sections.push('Itemized Fee');
    const itemizedFeeHeaders = [
      'Transaction ID',
      'Reference',
      'Fee Name',
      'Date/Time',
      'Status',
      'Gross',
      'Settle time',
    ];
    sections.push(itemizedFeeHeaders.map(escapeCSVValue).join(','));

    data.itemizedFee.forEach((f) => {
      const row = [
        f.transaction_id || '',
        f.item_transaction_id || '',
        f.fee_name || '',
        formatDateTimeForCSV(f.time_created_local),
        f.settle_status || '',
        formatCurrency(f.total, currency),
        formatDateTimeForCSV(f.time_settled),
      ];
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  // ========== 9. Misc Fee (Apex Fee) ==========
  if (data.apexFee && data.apexFee.length > 0) {
    sections.push('Misc Fee');
    const miscFeeHeaders = [
      'Transaction ID',
      'Fee Name',
      'Date/Time',
      'Gross',
      'Settle time',
    ];
    sections.push(miscFeeHeaders.map(escapeCSVValue).join(','));

    // Format fee name
    const formatFeeName = (transactionType: string): string => {
      switch (transactionType) {
        case 'vault_tokenization_fee':
          return 'Token vault usage Fee';
        case 'authorization_fee':
          return 'Authorization Fee';
        case '3ds_fee':
          return '3DS Auth Fee';
        default:
          return transactionType || '';
      }
    };

    data.apexFee.forEach((f) => {
      const row = [
        f.item_transaction_id || '',
        formatFeeName(f.transaction_type || ''),
        formatDateTimeForCSV(f.time_created_local),
        formatCurrency(f.total, currency),
        formatDateTimeForCSV(f.time_settled),
      ];
      sections.push(row.map(escapeCSVValue).join(','));
    });
    sections.push('');
  }

  return sections.join('\n');
};
