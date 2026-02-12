import { describe, it, expect } from 'vitest';
import {
  CURRENCY_SYMBOLS,
  getCurrencyDecimalPlaces,
  validateCurrencyAmount,
  formatCurrency,
} from '@/utils/currency';

describe('currency.ts', () => {
  describe('CURRENCY_SYMBOLS', () => {
    it('TC-CURR-001-01: should return $ for USD', () => {
      expect(CURRENCY_SYMBOLS['USD']).toBe('$');
    });

    it('TC-CURR-001-02: should return ¥ for CNY', () => {
      expect(CURRENCY_SYMBOLS['CNY']).toBe('¥');
    });

    it('TC-CURR-001-03: should return € for EUR', () => {
      expect(CURRENCY_SYMBOLS['EUR']).toBe('€');
    });

    it('TC-CURR-001-04: should have £ for GBP', () => {
      expect(CURRENCY_SYMBOLS['GBP']).toBe('£');
    });
  });

  describe('getCurrencyDecimalPlaces', () => {
    it('TC-CURR-002-01: should return 2 for USD', () => {
      expect(getCurrencyDecimalPlaces('USD')).toBe(2);
    });

    it('TC-CURR-002-02: should return 0 for JPY', () => {
      expect(getCurrencyDecimalPlaces('JPY')).toBe(0);
    });

    it('TC-CURR-002-03: should return 0 for KRW', () => {
      expect(getCurrencyDecimalPlaces('KRW')).toBe(0);
    });

    it('TC-CURR-002-04: should return 3 for KWD', () => {
      expect(getCurrencyDecimalPlaces('KWD')).toBe(3);
    });

    it('should return 0 for IDR', () => {
      expect(getCurrencyDecimalPlaces('IDR')).toBe(0);
    });

    it('should handle lowercase currency codes', () => {
      expect(getCurrencyDecimalPlaces('usd')).toBe(2);
      expect(getCurrencyDecimalPlaces('jpy')).toBe(0);
    });

    it('should return 2 for unknown currencies', () => {
      expect(getCurrencyDecimalPlaces('UNKNOWN')).toBe(2);
    });
  });

  describe('validateCurrencyAmount', () => {
    it('TC-CURR-003-01: should validate correct USD amount', () => {
      const result = validateCurrencyAmount('100.50', 'USD');
      expect(result.valid).toBe(true);
    });

    it('TC-CURR-003-02: should reject non-numeric input', () => {
      const result = validateCurrencyAmount('abc', 'USD');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Please enter a valid number');
    });

    it('TC-CURR-003-03: should reject negative amount', () => {
      const result = validateCurrencyAmount('-10', 'USD');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Amount must be greater than 0');
    });

    it('TC-CURR-003-04: should reject amount with too many decimals for USD', () => {
      const result = validateCurrencyAmount('100.555', 'USD');
      expect(result.valid).toBe(false);
    });

    it('TC-CURR-003-05: should validate integer amount for JPY', () => {
      const result = validateCurrencyAmount('100', 'JPY');
      expect(result.valid).toBe(true);
    });

    it('TC-CURR-003-06: should reject decimal amount for JPY', () => {
      const result = validateCurrencyAmount('100.5', 'JPY');
      expect(result.valid).toBe(false);
    });

    it('should reject zero amount', () => {
      const result = validateCurrencyAmount('0', 'USD');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Amount must be greater than 0');
    });

    it('should validate 3 decimal places for KWD', () => {
      const result = validateCurrencyAmount('100.123', 'KWD');
      expect(result.valid).toBe(true);
    });

    it('should reject 4 decimal places for KWD', () => {
      const result = validateCurrencyAmount('100.1234', 'KWD');
      expect(result.valid).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    // Note: formatCurrency expects database amounts (in cents for USD)
    // So 123456 cents = $1,234.56

    it('TC-CURR-004-01: should format USD with dollar sign', () => {
      const result = formatCurrency(123456, 'USD'); // 123456 cents = $1,234.56
      expect(result).toContain('$');
      expect(result).toContain('1,234.56');
    });

    it('TC-CURR-004-02: should format JPY without decimals', () => {
      const result = formatCurrency(1234, 'JPY'); // JPY has no cents, so 1234 = ¥1,234
      expect(result).toContain('¥');
      expect(result).toContain('1,234');
    });

    it('TC-CURR-004-03: should format zero value', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('0.00');
    });

    it('should format large numbers with comma separators', () => {
      const result = formatCurrency(123456789, 'USD'); // 123456789 cents = $1,234,567.89
      expect(result).toContain('1,234,567.89');
    });

    it('should handle null/undefined amount by using 0', () => {
      const result = formatCurrency(null, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('0.00');
    });

    it('should handle empty string currency', () => {
      const result = formatCurrency(10000, ''); // Uses USD as default
      expect(result).toContain('100');
    });
  });
});
