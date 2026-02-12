import type { TransactionLookupRecord } from '@/types/dashboard';

/**
 * Action button visibility result
 */
export interface ActionButtonsVisibility {
  showCapture: boolean;
  showRefund: boolean;
  showCancel: boolean;
  showStatus: boolean;
  statusText: string;
}

/**
 * Check if value is a valid number greater than 0
 */
const isPositiveNumber = (value: string | number | undefined): boolean => {
  if (value === undefined || value === null || value === '') return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Check if value is a valid number less than or equal to 0
 */
const isZeroOrNegative = (value: string | number | undefined): boolean => {
  if (value === undefined || value === null || value === '') return true;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) || num <= 0;
};

/**
 * Check if payment_method is in the list (case insensitive)
 */
const paymentMethodIn = (paymentMethod: string, values: string[]): boolean => {
  const lowerMethod = (paymentMethod || '').toLowerCase();
  return values.some((v) => v.toLowerCase() === lowerMethod);
};

/**
 * Check if payment_method contains a substring (case insensitive)
 */
const paymentMethodContains = (
  paymentMethod: string,
  substring: string,
): boolean => {
  const lowerMethod = (paymentMethod || '').toLowerCase();
  return lowerMethod.includes(substring.toLowerCase());
};

/**
 * Get Action button visibility for UPI records (transaction_db === 'upi')
 */
const getUPIActionButtons = (
  record: TransactionLookupRecord,
  canRefund: boolean,
): ActionButtonsVisibility => {
  const result: ActionButtonsVisibility = {
    showCapture: false,
    showRefund: false,
    showCancel: false,
    showStatus: false,
    statusText: '',
  };

  const {
    transaction_type,
    tranx_status,
    amount_authorized_remaining,
    remaining_balance,
    amount_captured,
    payment_gateway,
    payment_method,
    amount_refunded,
  } = record;

  // Base Capture condition: transaction_type === 'charge' && tranx_status === 'authorized' && amount_authorized_remaining > 0
  let baseShowCapture =
    transaction_type === 'charge' &&
    tranx_status === 'authorized' &&
    isPositiveNumber(amount_authorized_remaining);

  // Base Refund condition: transaction_type in ['charge','capture','capture_dashboard','capture_online']
  // && tranx_status === 'success' && canRefund && remaining_balance > 0
  const refundTypes = [
    'charge',
    'capture',
    'capture_dashboard',
    'capture_online',
  ];
  let baseShowRefund =
    refundTypes.includes(transaction_type) &&
    tranx_status === 'success' &&
    canRefund &&
    isPositiveNumber(remaining_balance);

  // Base Cancel condition: transaction_type === 'charge' && tranx_status in ['authorized', 'pending'] && amount_captured <= 0
  let baseShowCancel =
    transaction_type === 'charge' &&
    ['authorized', 'pending'].includes(tranx_status) &&
    isZeroOrNegative(amount_captured);

  // Status text condition: tranx_status in ['pending', 'cancelled']
  if (['pending', 'cancelled'].includes(tranx_status)) {
    result.showStatus = true;
    result.statusText = tranx_status;
  }

  // Special gateway handling (overrides previous logic)
  const gateway = (payment_gateway || '').toLowerCase();
  const method = (payment_method || '').toLowerCase();

  if (gateway === 'sbps') {
    const sbpsRestrictedMethods = [
      'linepay',
      'paypay',
      'rakutenpay',
      'alipay',
      'upop',
    ];
    const isRestrictedMethod = paymentMethodIn(method, sbpsRestrictedMethods);

    // Capture: Must satisfy previous logic AND payment_method does not contain restricted methods
    if (baseShowCapture && isRestrictedMethod) {
      baseShowCapture = false;
    }
    // Cancel: Must satisfy previous logic AND payment_method does not contain restricted methods
    if (baseShowCancel && isRestrictedMethod) {
      baseShowCancel = false;
    }
    // Refund: If restricted method, also need to check if amount_refunded has value
    if (baseShowRefund && isRestrictedMethod) {
      if (!isPositiveNumber(amount_refunded)) {
        baseShowRefund = false;
      }
    }
  } else if (['wechatpay', 'upop', 'alipay', 'fomo', 'aps'].includes(gateway)) {
    // Unless payment_gateway === 'upop' AND payment_method === 'card', do not show Capture and Cancel
    const isUpopWithCard = gateway === 'upop' && method === 'card';
    if (!isUpopWithCard) {
      baseShowCapture = false;
      baseShowCancel = false;
    }
  } else if (['flutterwave', 'ppro'].includes(gateway)) {
    // If tranx_status === 'pending', do not show Cancel
    if (tranx_status === 'pending') {
      baseShowCancel = false;
    }
  } else if (gateway === 'xendit') {
    // Capture: Must satisfy previous logic AND payment_method === 'card'
    if (baseShowCapture && method !== 'card') {
      baseShowCapture = false;
    }
    // Cancel: Must satisfy previous logic AND payment_method === 'card'
    if (baseShowCancel && method !== 'card') {
      baseShowCancel = false;
    }
    // Refund: Must satisfy previous logic AND payment_method in ['card','shopeepay','gcash','paymaya','grabpay']
    const xenditRefundMethods = [
      'card',
      'shopeepay',
      'gcash',
      'paymaya',
      'grabpay',
    ];
    if (baseShowRefund && !paymentMethodIn(method, xenditRefundMethods)) {
      baseShowRefund = false;
    }
  } else if (gateway === 'cil') {
    // Capture: Must satisfy previous logic AND payment_method === 'card'
    if (baseShowCapture && method !== 'card') {
      baseShowCapture = false;
    }
    // Cancel: Must satisfy previous logic AND payment_method === 'card'
    if (baseShowCancel && method !== 'card') {
      baseShowCancel = false;
    }
    // Refund: Must satisfy previous logic AND payment_method in specified list
    const cilRefundMethods = [
      'alipay_hk',
      'kor_onlinebanking',
      'payco',
      'kakaopay',
      'naverpay',
      'toss',
      'paypay',
      'linepay',
      'merpay',
      'rakutenpay',
      'au',
      'softbank',
      'ntt_docomo',
      'card',
      'wechatpay',
    ];
    if (baseShowRefund && !paymentMethodIn(method, cilRefundMethods)) {
      baseShowRefund = false;
    }
  } else if (gateway === 'gmo') {
    // Do not show Capture
    baseShowCapture = false;
    // Do not show Cancel
    baseShowCancel = false;
    // Refund: Must satisfy previous logic AND payment_method in specified list
    const gmoRefundMethods = [
      'paypay',
      'merpay',
      'rakutenpay',
      'au',
      'ntt_docomo',
      'amazon',
    ];
    if (baseShowRefund && !paymentMethodIn(method, gmoRefundMethods)) {
      baseShowRefund = false;
    }
  }

  result.showCapture = baseShowCapture;
  result.showRefund = baseShowRefund;
  result.showCancel = baseShowCancel;

  return result;
};

/**
 * Get Action button visibility for non-UPI records (transaction_db !== 'upi')
 */
const getNonUPIActionButtons = (
  record: TransactionLookupRecord,
  canRefund: boolean,
  hasPreAuth: boolean,
): ActionButtonsVisibility => {
  const result: ActionButtonsVisibility = {
    showCapture: false,
    showRefund: false,
    showCancel: false,
    showStatus: false,
    statusText: '',
  };

  const {
    transaction_type,
    tranx_status,
    pre_auth,
    amount_captured,
    remaining_balance,
    payment_gateway,
    payment_method,
  } = record;

  const gateway = (payment_gateway || '').toLowerCase();
  const method = (payment_method || '').toLowerCase();

  // Handling when hasPreAuth is true
  if (hasPreAuth) {
    // Capture: transaction_type === 'pos_payment' && pre_auth === 1 && amount_captured <= 0
    result.showCapture =
      transaction_type === 'pos_payment' &&
      pre_auth === 1 &&
      isZeroOrNegative(amount_captured);

    // Refund: transaction_type === 'pos_capture' && remaining_balance > 0
    result.showRefund =
      transaction_type === 'pos_capture' && isPositiveNumber(remaining_balance);

    // Cancel: transaction_type === 'pos_payment' && pre_auth === 1 && amount_captured <= 0
    result.showCancel =
      transaction_type === 'pos_payment' &&
      pre_auth === 1 &&
      isZeroOrNegative(amount_captured);
  }

  // Non-hasPreAuth override logic (Note: this is override, not else)
  // Refund condition: transaction_type in ['charge','pos_payment','pos_capture']
  // && Capture not shown && tranx_status !== 'cancelled' && canRefund
  // && remaining_balance > 0 && (payment_method contains 'cup' OR in ['alipay_hk','dana','gcash','kakaopay'])
  const refundTypes = ['charge', 'pos_payment', 'pos_capture'];
  const specialRefundMethods = ['alipay_hk', 'dana', 'gcash', 'kakaopay'];
  const isCupMethod = paymentMethodContains(method, 'cup');
  const isSpecialMethod = paymentMethodIn(method, specialRefundMethods);

  if (
    refundTypes.includes(transaction_type) &&
    !result.showCapture &&
    tranx_status !== 'cancelled' &&
    canRefund &&
    isPositiveNumber(remaining_balance) &&
    (isCupMethod || isSpecialMethod)
  ) {
    result.showRefund = true;
  }

  // If payment_gateway === 'upside', do not show Cancel
  if (gateway === 'upside') {
    result.showCancel = false;
  }

  // Status text condition: tranx_status in ['pending', 'delayed', 'cancelled'], do not show Refund (showStatus)
  if (['pending', 'delayed', 'cancelled'].includes(tranx_status)) {
    result.showStatus = true;
    result.statusText = tranx_status;
    result.showRefund = false;
  }

  return result;
};

/**
 * Get Action column button visibility
 * @param record Transaction record
 * @param canRefund Whether user has refund permission
 * @param hasPreAuth Whether merchant has PreAuth
 */
export const getActionButtonsVisibility = (
  record: TransactionLookupRecord,
  canRefund: boolean,
  hasPreAuth: boolean,
): ActionButtonsVisibility => {
  const isUPI = record.transaction_db === 'upi';

  if (isUPI) {
    return getUPIActionButtons(record, canRefund);
  } else {
    return getNonUPIActionButtons(record, canRefund, hasPreAuth);
  }
};

/**
 * Format Payment Method display
 */
export const formatPaymentMethod = (method: string): string => {
  const lowerMethod = method?.toLowerCase() || '';
  if (lowerMethod === 'wechatpay') return 'WXP';
  if (lowerMethod === 'alipay') return 'ALP';
  return method || '';
};

/**
 * Format Transaction Type display
 */
export const formatTransactionType = (type: string): string => {
  if (type === 'pos_payment') return 'charge';
  if (type === 'pos_refund') return 'refund';
  return type || '';
};

/**
 * Format Parent Transaction ID display
 */
export const formatParentTransactionId = (
  id: string | null | number,
): string => {
  if (id === null || id === 0 || id === '0') return '';
  return String(id);
};

/**
 * Format Total display
 */
export const formatTotal = (total: number): string => {
  if (total === 0) return 'NA';
  return String(total);
};

/**
 * Get Score color
 */
export const getScoreColor = (score: number | undefined): string => {
  if (score === undefined || score === null) return '';
  if (score < 40) return 'green';
  if (score < 70) return 'orange';
  return 'red';
};

/**
 * Get Dispute Tag display value
 */
export const getDisputeTag = (record: TransactionLookupRecord): string => {
  if (record.transaction_db === 'upi') {
    return record.tranx_status || '';
  }
  return record.chargeback_status || '';
};

/**
 * Get Action column title
 */
export const getActionColumnTitle = (
  hasUPI: boolean,
  hasPreAuth: boolean,
): string => {
  if (hasUPI || hasPreAuth) {
    return 'Action';
  }
  return 'Refund';
};
