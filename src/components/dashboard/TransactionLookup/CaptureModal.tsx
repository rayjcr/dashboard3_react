import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Checkbox,
  Typography,
  Divider,
} from 'antd';
import type { TransactionLookupRecord } from '@/types/dashboard';
import { transactionLookupApi } from '@/services/api/transactionLookupApi';
import { useAuthStore } from '@/stores';
import {
  validateCurrencyAmount,
  convertDbAmountToDisplay,
  getCurrencyDecimalPlaces,
  formatCurrency,
} from '@/utils/currency';

const { Text } = Typography;

interface CaptureModalProps {
  open: boolean;
  record: TransactionLookupRecord | null;
  merchantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({
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
      // Format amount with proper decimal places (number only, no currency symbol)
      const formattedOriginalAmount = formatCurrency(
        record.amount_authorized_remaining,
        record.currency,
        { format: 'number' },
      );
      form.setFieldsValue({
        transactionId: record.transaction_id,
        reference: record.reference,
        dateTime: record.time_created || '',
        originalAmount: formattedOriginalAmount,
        currency: record.currency,
        captureAmount: formattedOriginalAmount,
        multiCapture: false,
        lastCapture: false,
      });
    }
  }, [open, record, form]);

  const handleConfirm = async () => {
    if (!record || !sessionId) return;

    try {
      const values = await form.validateFields(['captureAmount']);
      const { captureAmount } = values;
      const multiCapture = form.getFieldValue('multiCapture') || false;
      const lastCapture = form.getFieldValue('lastCapture') || false;

      // Validate capture amount
      const amountValidation = validateCurrencyAmount(
        captureAmount,
        record.currency,
      );
      if (!amountValidation.valid) {
        setError(amountValidation.message || 'Invalid amount');
        return;
      }

      // Validate capture amount is not greater than remaining authorized amount
      const remainingAmount = convertDbAmountToDisplay(
        record.amount_authorized_remaining,
        record.currency,
      );
      const captureAmountNum = parseFloat(captureAmount);
      if (captureAmountNum > remainingAmount) {
        setError(
          `Capture amount cannot be greater than remaining authorized amount (${remainingAmount})`,
        );
        return;
      }

      setError(null);
      setLoading(true);

      const response = await transactionLookupApi.capture({
        merchantId: merchantId,
        transactionId: record.transaction_id,
        amount: captureAmount,
        currency: record.currency,
        transactionDb: record.transaction_db,
        sessionId: sessionId,
        multi_capture: multiCapture,
        last_capture: lastCapture,
        source: record.source || null,
        pre_auth: record.pre_auth === 1,
      });

      if (response.code === 200) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Capture failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Capture request failed';
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
      title="Capture"
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
      width={600}
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

        <Form.Item label="Original Amount" name="originalAmount">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Currency" name="currency">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Capture Amount"
          name="captureAmount"
          rules={[{ required: true, message: 'Please enter capture amount' }]}
          extra={decimalHint}
        >
          <Input placeholder="Enter capture amount" />
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0' }} />

      {/* Checkboxes and Tips - Full width layout */}
      <div style={{ paddingLeft: 8 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="multiCapture"
            valuePropName="checked"
            style={{ marginBottom: 8 }}
          >
            <Checkbox>
              <span style={{ fontWeight: 500 }}>Multi-Capture</span>
            </Checkbox>
          </Form.Item>
          <Text
            type="secondary"
            style={{
              display: 'block',
              fontSize: 12,
              marginBottom: 16,
              paddingLeft: 24,
            }}
          >
            Selected when more than one capture will be performed on a single
            authorization
          </Text>

          <Form.Item
            name="lastCapture"
            valuePropName="checked"
            style={{ marginBottom: 8 }}
          >
            <Checkbox>
              <span style={{ fontWeight: 500 }}>Last Capture</span>
            </Checkbox>
          </Form.Item>
          <Text
            type="secondary"
            style={{
              display: 'block',
              fontSize: 12,
              marginBottom: 16,
              paddingLeft: 24,
            }}
          >
            Selected when this will be the last capture of the initial
            authorization releasing any remaining amount
          </Text>

          <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            * If a transaction is partially captured the remaining authorization
            amount will be released
          </Text>
        </Form>
      </div>
    </Modal>
  );
};
