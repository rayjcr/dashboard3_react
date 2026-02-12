import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Alert } from 'antd';
import type { TransactionLookupRecord } from '@/types/dashboard';
import { transactionLookupApi } from '@/services/api/transactionLookupApi';
import { useAuthStore } from '@/stores';
import {
  validateCurrencyAmount,
  convertDbAmountToDisplay,
  getCurrencyDecimalPlaces,
  formatCurrency,
} from '@/utils/currency';

interface RefundModalProps {
  open: boolean;
  record: TransactionLookupRecord | null;
  merchantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  open,
  record,
  merchantId,
  onClose,
  onSuccess,
}) => {
  const { sessionId } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens with new record
  useEffect(() => {
    if (open && record) {
      setError(null);
      // Format remain balance with proper decimal places (number only, no currency symbol)
      const formattedRemainBalance = formatCurrency(
        record.remaining_balance,
        record.currency,
        { format: 'number' },
      );
      form.setFieldsValue({
        transactionId: record.transaction_id,
        reference: record.reference,
        dateTime: record.time_created || '',
        remainBalance: formattedRemainBalance,
        refundCurrency: record.currency,
        refundAmount: formattedRemainBalance,
        reason: '',
      });
    }
  }, [open, record, form]);

  const handleConfirm = async () => {
    if (!record || !sessionId) return;

    try {
      const values = await form.validateFields(['refundAmount', 'reason']);
      const { refundAmount, reason } = values;

      // Validate reason is not empty
      if (!reason || reason.trim() === '') {
        setError('Reason is required');
        return;
      }

      // Validate refund amount
      const amountValidation = validateCurrencyAmount(
        refundAmount,
        record.currency,
      );
      if (!amountValidation.valid) {
        setError(amountValidation.message || 'Invalid amount');
        return;
      }

      // Validate refund amount is not greater than remain balance
      const remainBalance = convertDbAmountToDisplay(
        record.remaining_balance,
        record.currency,
      );
      const refundAmountNum = parseFloat(refundAmount);
      if (refundAmountNum > remainBalance) {
        setError(
          `Refund amount cannot be greater than remaining balance (${remainBalance})`,
        );
        return;
      }

      setError(null);
      setLoading(true);

      const response = await transactionLookupApi.refund({
        merchantId: merchantId,
        transactionId: record.transaction_id,
        amount: refundAmount,
        currency: record.currency,
        reason: reason.trim(),
        transactionDb: record.transaction_db,
        sessionId: sessionId,
        type: record.type || '',
        originReference: record.reference,
        vendor: record.vendor,
        source: record.source || null,
        gateway: record.payment_gateway,
        pre_auth: record.pre_auth === 1,
      });

      if (response.code === 200) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Refund failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Refund request failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    form.resetFields();
    onClose();
  };

  const decimalPlaces = record ? getCurrencyDecimalPlaces(record.currency) : 2;
  const decimalHint =
    decimalPlaces === 0
      ? 'No decimal places allowed'
      : `Up to ${decimalPlaces} decimal places`;

  return (
    <Modal
      title="Refund"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={loading}
          onClick={handleConfirm}
        >
          Confirm
        </Button>,
      ]}
      destroyOnHidden
      width={500}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
      >
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item label="Transaction ID" name="transactionId">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Reference" name="reference">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Date/Time" name="dateTime">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Remain Balance" name="remainBalance">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Refund Currency" name="refundCurrency">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Refund Amount"
          name="refundAmount"
          rules={[{ required: true, message: 'Please enter refund amount' }]}
          extra={decimalHint}
        >
          <Input placeholder="Enter refund amount" />
        </Form.Item>

        <Form.Item
          label="Reason"
          name="reason"
          rules={[{ required: true, message: 'Please enter reason' }]}
        >
          <Input.TextArea rows={3} placeholder="Enter refund reason" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
