import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseUserConfig,
  isDailyDetailClickable,
  isMonthlyDetailClickable,
  shouldShowPayoutColumn,
  getCurrentDateString,
  getCurrentMonthString,
  getStatusDisplay,
  MERCHANT_IDS_HAVE_PAYOUT,
} from '@/utils/dashboard';

describe('dashboard.ts', () => {
  describe('parseUserConfig', () => {
    it('TC-DASH-001-01: should parse empty object', () => {
      const result = parseUserConfig('{}');
      expect(result).toEqual({});
    });

    it('TC-DASH-001-02: should parse valid JSON', () => {
      const result = parseUserConfig('{"key":"value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('TC-DASH-001-03: should return empty object for invalid JSON', () => {
      const result = parseUserConfig('invalid');
      expect(result).toEqual({});
    });

    it('TC-DASH-001-04: should return empty object for empty string', () => {
      const result = parseUserConfig('');
      expect(result).toEqual({});
    });

    it('TC-DASH-001-05: should handle null-like input', () => {
      // @ts-expect-error Testing null input
      const result = parseUserConfig(null);
      expect(result).toEqual({});
    });

    it('should parse complex config object', () => {
      const config = {
        detail_daily_report_disable: '',
        transaction_lookup: true,
      };
      const result = parseUserConfig(JSON.stringify(config));
      expect(result).toEqual(config);
    });
  });

  describe('isDailyDetailClickable', () => {
    it('TC-DASH-002-01: should return true when has merchantId and no disable config', () => {
      const result = isDailyDetailClickable({}, '123');
      expect(result).toBe(true);
    });

    it('TC-DASH-002-02: should return false when merchantId is undefined', () => {
      const result = isDailyDetailClickable({}, undefined);
      expect(result).toBe(false);
    });

    it('TC-DASH-002-03: should return false when detail_daily_report_disable is empty string', () => {
      const result = isDailyDetailClickable(
        { detail_daily_report_disable: '' },
        '123',
      );
      expect(result).toBe(false);
    });

    it('should return true when disable config has non-empty value', () => {
      const result = isDailyDetailClickable(
        { detail_daily_report_disable: 'some_value' },
        '123',
      );
      expect(result).toBe(true);
    });
  });

  describe('isMonthlyDetailClickable', () => {
    it('TC-DASH-003-01: should return true when has merchantId and no disable config', () => {
      const result = isMonthlyDetailClickable({}, '123');
      expect(result).toBe(true);
    });

    it('TC-DASH-003-02: should return false when merchantId is undefined', () => {
      const result = isMonthlyDetailClickable({}, undefined);
      expect(result).toBe(false);
    });

    it('TC-DASH-003-03: should return false when detail_monthly_report_disable is empty string', () => {
      const result = isMonthlyDetailClickable(
        { detail_monthly_report_disable: '' },
        '123',
      );
      expect(result).toBe(false);
    });
  });

  describe('shouldShowPayoutColumn', () => {
    it('TC-DASH-004-01: should return true for whitelisted merchant', () => {
      const result = shouldShowPayoutColumn('634201701345000');
      expect(result).toBe(true);
    });

    it('TC-DASH-004-02: should return false for non-whitelisted merchant', () => {
      const result = shouldShowPayoutColumn('000000000000000');
      expect(result).toBe(false);
    });

    it('TC-DASH-004-03: should return false when merchantId is undefined', () => {
      const result = shouldShowPayoutColumn(undefined);
      expect(result).toBe(false);
    });

    it('should have correct merchants in whitelist', () => {
      expect(MERCHANT_IDS_HAVE_PAYOUT).toContain('634201701345000');
      expect(MERCHANT_IDS_HAVE_PAYOUT).toContain('634201705214000');
    });
  });

  describe('getCurrentDateString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('TC-DASH-005-01: should return date in YYYY-MM-DD format', () => {
      vi.setSystemTime(new Date('2024-03-15'));
      const result = getCurrentDateString();
      expect(result).toBe('2024-03-15');
    });

    it('should pad single digit month and day', () => {
      vi.setSystemTime(new Date('2024-01-05'));
      const result = getCurrentDateString();
      expect(result).toBe('2024-01-05');
    });
  });

  describe('getCurrentMonthString', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('TC-DASH-005-02: should return month in YYYYMM format', () => {
      vi.setSystemTime(new Date('2024-03-15'));
      const result = getCurrentMonthString();
      expect(result).toBe('202403');
    });

    it('should pad single digit month', () => {
      vi.setSystemTime(new Date('2024-01-15'));
      const result = getCurrentMonthString();
      expect(result).toBe('202401');
    });
  });

  describe('getStatusDisplay', () => {
    it('should return cleared status when umfEnabled', () => {
      const result = getStatusDisplay(
        'Pending',
        '2024-01-15',
        true,
        false,
        false,
      );
      expect(result).toBe('Cleared 2024-01-15');
    });

    it('should return cleared status when hasJkoPay', () => {
      const result = getStatusDisplay(
        'Pending',
        '2024-01-15',
        false,
        true,
        false,
      );
      expect(result).toBe('Cleared 2024-01-15');
    });

    it('should return cleared status when isElavonSite', () => {
      const result = getStatusDisplay(
        'Pending',
        '2024-01-15',
        false,
        false,
        true,
      );
      expect(result).toBe('Cleared 2024-01-15');
    });

    it('should return original status when no special flags', () => {
      const result = getStatusDisplay(
        'Settled',
        '2024-01-15',
        false,
        false,
        false,
      );
      expect(result).toBe('Settled');
    });
  });
});
