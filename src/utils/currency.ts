/**
 * Currency formatting utility
 */

/**
 * Currency symbol mapping
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  HKD: 'HK$',
  SGD: 'S$',
  TWD: 'NT$',
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',
  VND: '₫',
  KWD: 'KD',
  CLP: 'CLP$',
  ISK: 'kr',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  NZD: 'NZ$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  ZAR: 'R',
  AED: 'AED',
  SAR: 'SAR',
};

/**
 * Currency types with no decimal places (no 'cent')
 * Amount stored in database remains as-is, no division needed
 * eg. KRW 199 in DB is 199 KRW
 */
const NO_DECIMAL_CURRENCIES = ['KRW', 'JPY', 'CLP', 'ISK'];

/**
 * Currency types with three decimal places
 * Amount stored in database needs to be divided by 1000
 */
const THREE_DECIMAL_CURRENCIES = ['KWD'];

/**
 * Get the number of decimal places for a currency
 * @param currency Currency code
 * @returns Number of decimal places
 */
export function getCurrencyDecimalPlaces(currency: string): number {
  const upperCurrency = currency?.toUpperCase() || 'USD';
  if (
    NO_DECIMAL_CURRENCIES.includes(upperCurrency) ||
    upperCurrency === 'IDR'
  ) {
    return 0;
  }
  if (THREE_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    return 3;
  }
  return 2;
}

/**
 * Validate if amount conforms to currency decimal place rules
 * @param amount Amount string
 * @param currency Currency code
 * @returns Validation result object
 */
export function validateCurrencyAmount(
  amount: string,
  currency: string,
): { valid: boolean; message?: string } {
  const upperCurrency = currency?.toUpperCase() || 'USD';
  const decimalPlaces = getCurrencyDecimalPlaces(upperCurrency);

  // Check if it's a valid number
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) {
    return { valid: false, message: 'Please enter a valid number' };
  }

  // Check if greater than 0
  if (numAmount <= 0) {
    return { valid: false, message: 'Amount must be greater than 0' };
  }

  // Check decimal places
  const parts = amount.split('.');
  if (parts.length === 2) {
    const actualDecimals = parts[1].length;
    if (decimalPlaces === 0 && actualDecimals > 0) {
      return {
        valid: false,
        message: `${upperCurrency} does not support decimal places`,
      };
    }
    if (actualDecimals > decimalPlaces) {
      return {
        valid: false,
        message: `${upperCurrency} supports up to ${decimalPlaces} decimal places`,
      };
    }
  }

  return { valid: true };
}

/**
 * Convert database stored amount to display amount
 * @param amount Database stored amount
 * @param currency Currency code
 * @returns Display amount
 */
export function convertDbAmountToDisplay(
  amount: number | string,
  currency: string,
): number {
  const upperCurrency = currency?.toUpperCase() || 'USD';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return 0;

  if (NO_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    return numAmount;
  }
  if (THREE_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    return numAmount / 1000;
  }
  return numAmount / 100;
}

/**
 * Convert display amount to database stored amount
 * @param amount Display amount
 * @param currency Currency code
 * @returns Database stored amount
 */
export function convertDisplayAmountToDb(
  amount: number | string,
  currency: string,
): number {
  const upperCurrency = currency?.toUpperCase() || 'USD';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return 0;

  if (NO_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    return numAmount;
  }
  if (THREE_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    return numAmount * 1000;
  }
  return numAmount * 100;
}

type FormatType = 'symbol' | 'number';

interface FormatCurrencyOptions {
  /** Output format: 'symbol' with currency symbol, 'number' numbers only */
  format?: FormatType;
  /** Text to display when amount is 0 */
  zeroToText?: string;
  /** Whether to show currency symbol, default true */
  showSymbol?: boolean;
}

/**
 * Format amount (unified handling for all amount displays)
 *
 * Database storage rules:
 * - Most currencies use cent storage, e.g., USD 199 means $1.99
 * - No decimal currencies (KRW, JPY, CLP, ISK) stored directly, e.g., KRW 199 means ₩199
 * - KWD uses thousandths storage, e.g., KWD 1990 means KD1.990
 *
 * Display rules:
 * - EUR: European format, 2 decimal places
 * - IDR: No decimal places
 * - PHP: 2 decimal places
 * - KRW, JPY: No decimal places
 * - SGD: S$ prefix, 2 decimal places, negative format -S$xxx
 * - KWD: 3 decimal places
 * - Others: 2 decimal places
 *
 * @param amount Amount value (value from database, usually in smallest unit)
 * @param currency Currency code
 * @param options Optional configuration
 * @returns Formatted amount string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string,
  options: FormatCurrencyOptions = {},
): string {
  const { format = 'symbol', zeroToText, showSymbol = true } = options;

  // Handle null values and NaN
  let numAmount: number;
  if (amount === '' || amount === null || amount === undefined) {
    numAmount = 0;
  } else {
    numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) {
      numAmount = 0;
    }
  }

  // Handle multi-currency case (e.g., "CAD,USD"), use the first currency code
  let upperCurrency = currency?.toUpperCase() || 'USD';
  if (upperCurrency.includes(',')) {
    upperCurrency = upperCurrency.split(',')[0].trim();
  }

  // Convert amount based on currency type
  let _amount: number;
  if (NO_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    _amount = numAmount;
  } else if (THREE_DECIMAL_CURRENCIES.includes(upperCurrency)) {
    _amount = numAmount / 1000;
  } else {
    _amount = numAmount / 100;
  }

  // Handle -0 case and very small negative numbers that round to 0
  // Based on currency's decimal places, if rounded to 0, display as positive 0
  const getDecimalPlaces = (curr: string): number => {
    if (NO_DECIMAL_CURRENCIES.includes(curr) || curr === 'IDR') return 0;
    if (THREE_DECIMAL_CURRENCIES.includes(curr)) return 3;
    return 2;
  };
  const decimalPlaces = getDecimalPlaces(upperCurrency);
  const roundedAmount = Number(_amount.toFixed(decimalPlaces));
  if (roundedAmount === 0) {
    _amount = 0;
  }

  // If format is 'number', only return the number
  if (format === 'number') {
    if (NO_DECIMAL_CURRENCIES.includes(upperCurrency)) {
      return String(_amount);
    }
    if (THREE_DECIMAL_CURRENCIES.includes(upperCurrency)) {
      return _amount.toFixed(3);
    }
    return _amount.toFixed(2);
  }

  // If amount is 0 and zeroToText is set, return the specified text
  if (zeroToText && !_amount) {
    return zeroToText;
  }

  let result: string;

  if (upperCurrency === 'EUR') {
    // EUR: European format, 2 decimal places
    result = _amount.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (upperCurrency === 'IDR' || upperCurrency === 'PHP') {
    // IDR: No decimal places; PHP: 2 decimal places
    const decimalPlaces = upperCurrency === 'IDR' ? 0 : 2;
    result = _amount.toLocaleString('en-US', {
      style: 'currency',
      currency: upperCurrency,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      currencyDisplay: 'narrowSymbol',
    });
  } else if (['KRW', 'JPY'].includes(upperCurrency)) {
    // KRW, JPY: No decimal places
    result = _amount.toLocaleString('en-US', {
      style: 'currency',
      currency: upperCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  } else if (upperCurrency === 'SGD') {
    // SGD: Special format, negative as -S$xxx
    const isNegative = _amount < 0;
    const absFormatted = Math.abs(_amount).toFixed(2);
    result = (isNegative ? '-' : '') + 'S$' + absFormatted;
  } else if (upperCurrency === 'KWD') {
    // KWD: 3 decimal places
    result = _amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'KWD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  } else {
    // Other currencies: 2 decimal places
    result = _amount.toLocaleString('en-US', {
      style: 'currency',
      currency: upperCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // If symbol should not be shown, extract only the number part
  if (showSymbol === false) {
    const matches = /[0-9.,]+/gm.exec(result);
    if (matches && matches.length >= 1) {
      result = matches[0];
    }
    // Handle negative number case
    result = _amount >= 0 ? result : '-' + result;
  }

  return result;
}

/**
 * Format amount (simplified version, for table display scenarios)
 * @param amount Amount value
 * @param currency Currency code
 * @returns Formatted amount string
 */
export function formatCurrencySimple(
  amount: number | string | null | undefined,
  currency: string,
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '-';
  }
  return formatCurrency(amount, currency);
}
