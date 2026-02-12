import React, { useState } from 'react';
import { Modal, Button, Alert, Space } from 'antd';
import type { TransactionLookupRecord } from '@/types/dashboard';
import { transactionLookupApi } from '@/services/api/transactionLookupApi';
import { useAuthStore } from '@/stores';

interface CancelConfirmModalProps {
  open: boolean;
  record: TransactionLookupRecord | null;
  merchantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  open,
  record,
  merchantId,
  onClose,
  onSuccess,
}) => {
  const { sessionId } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleYes = async () => {
    if (!record || !sessionId) return;

    setError(null);
    setLoading(true);

    try {
      const response = await transactionLookupApi.cancel({
        merchantId: merchantId,
        transactionId: record.transaction_id,
        transactionDb: record.transaction_db,
        sessionId: sessionId,
        source: record.source || null,
        pre_auth: record.pre_auth === 1,
      });

      if (response.code === 200) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Cancel failed');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Cancel request failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNo = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleNo}
      footer={null}
      closable={false}
      destroyOnHidden
      width={400}
    >
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        {error && (
          <Alert
            title={error}
            type="error"
            showIcon
            style={{ marginBottom: 16, textAlign: 'left' }}
          />
        )}

        <p style={{ fontSize: 16, marginBottom: 24 }}>
          Do you want to cancel this transaction?
        </p>

        <Space size="middle">
          <Button onClick={handleNo} disabled={loading}>
            No
          </Button>
          <Button type="primary" onClick={handleYes} loading={loading}>
            Yes
          </Button>
        </Space>
      </div>
    </Modal>
  );
};
