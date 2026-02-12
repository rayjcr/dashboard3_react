import { describe, it, expect } from 'vitest';
import {
  getActionButtonsVisibility,
  formatPaymentMethod,
  formatTransactionType,
} from '@/utils/transactionLookup';
import type { TransactionLookupRecord } from '@/types/dashboard';

// Helper to create a mock UPI record
const createMockUPIRecord = (
  overrides: Partial<TransactionLookupRecord> = {},
): TransactionLookupRecord =>
  ({
    id: 'TXN001',
    reference: 'REF001',
    transaction_type: 'charge',
    tranx_status: 'success',
    payment_method: 'card',
    payment_gateway: 'stripe',
    amount: '100.00',
    currency: 'USD',
    created_at: '2024-01-15 10:30:00',
    remaining_balance: '100.00',
    amount_captured: '100.00',
    amount_refunded: '0.00',
    amount_authorized_remaining: '0.00',
    transaction_db: 'upi', // Mark as UPI record
    ...overrides,
  }) as TransactionLookupRecord;

// Helper to create a mock non-UPI record
const createMockNonUPIRecord = (
  overrides: Partial<TransactionLookupRecord> = {},
): TransactionLookupRecord =>
  ({
    id: 'TXN001',
    reference: 'REF001',
    transaction_type: 'pos_payment',
    tranx_status: 'success',
    payment_method: 'card',
    payment_gateway: 'stripe',
    amount: '100.00',
    currency: 'USD',
    created_at: '2024-01-15 10:30:00',
    remaining_balance: '100.00',
    amount_captured: '100.00',
    transaction_db: 'other', // Non-UPI record
    pre_auth: 0,
    ...overrides,
  }) as TransactionLookupRecord;

describe('transactionLookup.ts', () => {
  describe('getActionButtonsVisibility', () => {
    describe('UPI records (transaction_db === "upi")', () => {
      it('TC-TXN-001-01: should show Capture for authorized charge with remaining amount', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'authorized',
          amount_authorized_remaining: '100.00',
          amount_captured: '0.00',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showCapture).toBe(true);
      });

      it('TC-TXN-001-02: should show Refund for successful charge with balance and canRefund', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'success',
          remaining_balance: '100.00',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showRefund).toBe(true);
      });

      it('TC-TXN-001-03: should show Cancel for authorized charge with no captured amount', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'authorized',
          amount_captured: '0.00',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showCancel).toBe(true);
      });

      it('TC-TXN-001-04: should show status text for pending transactions', () => {
        const record = createMockUPIRecord({
          tranx_status: 'pending',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showStatus).toBe(true);
        expect(result.statusText).toBe('pending');
      });

      it('should not show Refund when canRefund is false', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'success',
          remaining_balance: '100.00',
        });

        const result = getActionButtonsVisibility(record, false, true); // canRefund = false
        expect(result.showRefund).toBe(false);
      });

      it('should not show Refund when remaining_balance is 0', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'success',
          remaining_balance: '0.00',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showRefund).toBe(false);
      });
    });

    describe('Gateway-specific rules', () => {
      it('TC-TXN-002-01: should not show Capture for wechatpay gateway', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'authorized',
          amount_authorized_remaining: '100.00',
          payment_gateway: 'wechatpay',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showCapture).toBe(false);
      });

      it('TC-TXN-002-02: should show Capture for upop gateway with card method', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'authorized',
          amount_authorized_remaining: '100.00',
          amount_captured: '0.00',
          payment_gateway: 'upop',
          payment_method: 'card',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showCapture).toBe(true);
      });

      it('TC-TXN-002-03: should not show Capture for sbps gateway with linepay', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'authorized',
          amount_authorized_remaining: '100.00',
          payment_gateway: 'sbps',
          payment_method: 'linepay',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showCapture).toBe(false);
      });

      it('should not show Cancel for alipay gateway', () => {
        const record = createMockUPIRecord({
          transaction_type: 'charge',
          tranx_status: 'authorized',
          amount_captured: '0.00',
          payment_gateway: 'alipay',
        });

        const result = getActionButtonsVisibility(record, true, true);
        expect(result.showCancel).toBe(false);
      });
    });
  });

  describe('formatPaymentMethod', () => {
    it('should format card payment method', () => {
      const result = formatPaymentMethod('card');
      expect(result).toBeTruthy();
    });

    it('should format wechat payment method', () => {
      const result = formatPaymentMethod('wechat');
      expect(result).toBeTruthy();
    });

    it('should handle empty payment method', () => {
      const result = formatPaymentMethod('');
      expect(result).toBe('');
    });

    it('should handle undefined payment method', () => {
      // @ts-expect-error Testing undefined
      const result = formatPaymentMethod(undefined);
      expect(result).toBe('');
    });
  });

  describe('formatTransactionType', () => {
    it('should format charge type', () => {
      const result = formatTransactionType('charge');
      expect(result).toBeTruthy();
    });

    it('should format refund type', () => {
      const result = formatTransactionType('refund');
      expect(result).toBeTruthy();
    });

    it('should format capture type', () => {
      const result = formatTransactionType('capture');
      expect(result).toBeTruthy();
    });
  });
});
