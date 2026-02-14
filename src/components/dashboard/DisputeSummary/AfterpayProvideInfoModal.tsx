/**
 * Afterpay Provide Information Modal Component
 * Contains product description, shipping info, and refund policy fields
 */

import React, { useCallback } from 'react';
import { Modal, Input, Button, Upload } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useThemeStore } from '@/stores';
import { disputeApi } from '@/services/api/disputeApi';
import { useDisputeModals } from './DisputeModalsContext';
import { validateFiles } from './utils';

export const AfterpayProvideInfoModal: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  const {
    afterpayModalVisible,
    afterpayProvideInfo,
    afterpayShippingDocUploading,
    afterpayRefundPolicyUploading,
    actionRecord,
    closeAfterpayModal,
    handleAfterpayFieldChange,
    setAfterPayShippingDocUploading,
    setAfterPayRefundPolicyUploading,
    pendingAfterPayShippingDocRef,
    pendingAfterPayRefundPolicyRef,
    afterpayShippingDocTimerRef,
    afterpayRefundPolicyTimerRef,
    message,
  } = useDisputeModals();

  // Execute afterpay shipping document upload
  const executeAfterPayShippingDocUpload = useCallback(async () => {
    const fileToUpload = pendingAfterPayShippingDocRef.current;
    pendingAfterPayShippingDocRef.current = null;

    if (!fileToUpload || !actionRecord?.caseId) {
      return;
    }

    const validation = validateFiles([fileToUpload]);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }

    setAfterPayShippingDocUploading(true);

    try {
      const response = await disputeApi.uploadAfterPayFile(
        actionRecord.caseId,
        fileToUpload,
      );

      if (response.code === 200 && response.data) {
        const fileInfo = response.data;
        handleAfterpayFieldChange('shippingDocument', {
          id: fileInfo.id,
          filename: fileInfo.filename,
          url: fileInfo.url,
          urlExpiresAt: fileInfo.urlExpiresAt,
        });
        message.success('Shipping document uploaded successfully');
      } else {
        message.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file. Please try again.');
    } finally {
      setAfterPayShippingDocUploading(false);
    }
  }, [
    actionRecord?.caseId,
    handleAfterpayFieldChange,
    pendingAfterPayShippingDocRef,
    setAfterPayShippingDocUploading,
    message,
  ]);

  // Execute afterpay refund policy upload
  const executeAfterPayRefundPolicyUpload = useCallback(async () => {
    const fileToUpload = pendingAfterPayRefundPolicyRef.current;
    pendingAfterPayRefundPolicyRef.current = null;

    if (!fileToUpload || !actionRecord?.caseId) {
      return;
    }

    const validation = validateFiles([fileToUpload]);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }

    setAfterPayRefundPolicyUploading(true);

    try {
      const response = await disputeApi.uploadAfterPayFile(
        actionRecord.caseId,
        fileToUpload,
      );

      if (response.code === 200 && response.data) {
        const fileInfo = response.data;
        handleAfterpayFieldChange('refundPolicy', {
          id: fileInfo.id,
          filename: fileInfo.filename,
          url: fileInfo.url,
          urlExpiresAt: fileInfo.urlExpiresAt,
        });
        message.success('Refund policy uploaded successfully');
      } else {
        message.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload file. Please try again.');
    } finally {
      setAfterPayRefundPolicyUploading(false);
    }
  }, [
    actionRecord?.caseId,
    handleAfterpayFieldChange,
    pendingAfterPayRefundPolicyRef,
    setAfterPayRefundPolicyUploading,
    message,
  ]);

  // Handle afterpay shipping document file selection
  const handleAfterPayShippingDocSelect = useCallback(
    (file: File) => {
      pendingAfterPayShippingDocRef.current = file;

      if (afterpayShippingDocTimerRef.current) {
        clearTimeout(afterpayShippingDocTimerRef.current);
      }

      afterpayShippingDocTimerRef.current = setTimeout(() => {
        executeAfterPayShippingDocUpload();
        afterpayShippingDocTimerRef.current = null;
      }, 100);
    },
    [
      executeAfterPayShippingDocUpload,
      pendingAfterPayShippingDocRef,
      afterpayShippingDocTimerRef,
    ],
  );

  // Handle afterpay refund policy file selection
  const handleAfterPayRefundPolicySelect = useCallback(
    (file: File) => {
      pendingAfterPayRefundPolicyRef.current = file;

      if (afterpayRefundPolicyTimerRef.current) {
        clearTimeout(afterpayRefundPolicyTimerRef.current);
      }

      afterpayRefundPolicyTimerRef.current = setTimeout(() => {
        executeAfterPayRefundPolicyUpload();
        afterpayRefundPolicyTimerRef.current = null;
      }, 100);
    },
    [
      executeAfterPayRefundPolicyUpload,
      pendingAfterPayRefundPolicyRef,
      afterpayRefundPolicyTimerRef,
    ],
  );

  return (
    <Modal
      title="Provide Information"
      open={afterpayModalVisible}
      onCancel={closeAfterpayModal}
      width={600}
      footer={
        <Button type="primary" onClick={closeAfterpayModal}>
          Done
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hint text */}
        <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
          For different reasons of dispute, the type of evidence will be
          different.
        </div>

        {/* Product Description Section */}
        <div
          style={{
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            padding: 16,
            background: '#fafafa',
          }}
        >
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
            Product Description
          </div>
          <Input.TextArea
            value={afterpayProvideInfo.productDescription}
            onChange={(e) =>
              handleAfterpayFieldChange('productDescription', e.target.value)
            }
            placeholder="Enter product description"
            rows={3}
          />
        </div>

        {/* Shipping Information Section */}
        <div
          style={{
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            padding: 16,
            background: '#fafafa',
          }}
        >
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
            Shipping Information
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  fontSize: 13,
                  color: '#666',
                  textAlign: 'right',
                  paddingRight: 8,
                }}
              >
                Shipping Address:
              </div>
              <Input
                value={afterpayProvideInfo.shippingAddress}
                onChange={(e) =>
                  handleAfterpayFieldChange('shippingAddress', e.target.value)
                }
                placeholder="Enter shipping address"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  fontSize: 13,
                  color: '#666',
                  textAlign: 'right',
                  paddingRight: 8,
                }}
              >
                Shipping Date:
              </div>
              <Input
                value={afterpayProvideInfo.shippingDate}
                onChange={(e) =>
                  handleAfterpayFieldChange('shippingDate', e.target.value)
                }
                placeholder="Enter shipping date"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  fontSize: 13,
                  color: '#666',
                  textAlign: 'right',
                  paddingRight: 8,
                }}
              >
                Shipping Carrier:
              </div>
              <Input
                value={afterpayProvideInfo.shippingCarrier}
                onChange={(e) =>
                  handleAfterpayFieldChange('shippingCarrier', e.target.value)
                }
                placeholder="Enter shipping carrier"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  fontSize: 13,
                  color: '#666',
                  textAlign: 'right',
                  paddingRight: 8,
                }}
              >
                Shipping Tracking Number:
              </div>
              <Input
                value={afterpayProvideInfo.shippingTrackingNumber}
                onChange={(e) =>
                  handleAfterpayFieldChange(
                    'shippingTrackingNumber',
                    e.target.value,
                  )
                }
                placeholder="Enter shipping tracking number"
                style={{ flex: 1 }}
              />
            </div>
            <div>
              <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
                Shipping Document
              </div>
              {afterpayProvideInfo.shippingDocument ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <FileOutlined
                      style={{ marginRight: 8, color: '#52c41a' }}
                    />
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {afterpayProvideInfo.shippingDocument.filename}
                    </span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleAfterpayFieldChange('shippingDocument', null)
                    }
                    style={{ marginLeft: 8 }}
                  />
                </div>
              ) : null}
              <Upload
                beforeUpload={(file) => {
                  handleAfterPayShippingDocSelect(file as File);
                  return false;
                }}
                showUploadList={false}
                multiple={false}
                accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                disabled={afterpayShippingDocUploading}
              >
                <Button
                  icon={
                    afterpayShippingDocUploading ? (
                      <LoadingOutlined />
                    ) : (
                      <UploadOutlined />
                    )
                  }
                  loading={afterpayShippingDocUploading}
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  {afterpayShippingDocUploading
                    ? 'Uploading...'
                    : 'Shipping Document'}
                </Button>
              </Upload>
            </div>
          </div>
        </div>

        {/* Refund Information Section */}
        <div
          style={{
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            padding: 16,
            background: '#fafafa',
          }}
        >
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
            Refund Information
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  fontSize: 13,
                  color: '#666',
                  textAlign: 'right',
                  paddingRight: 8,
                }}
              >
                Refund Policy Disclosure:
              </div>
              <Input
                value={afterpayProvideInfo.refundPolicyDisclosure}
                onChange={(e) =>
                  handleAfterpayFieldChange(
                    'refundPolicyDisclosure',
                    e.target.value,
                  )
                }
                placeholder="Enter refund policy disclosure"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: 180,
                  fontSize: 13,
                  color: '#666',
                  textAlign: 'right',
                  paddingRight: 8,
                }}
              >
                Refund Refusal Explanation:
              </div>
              <Input
                value={afterpayProvideInfo.refundRefusalExplanation}
                onChange={(e) =>
                  handleAfterpayFieldChange(
                    'refundRefusalExplanation',
                    e.target.value,
                  )
                }
                placeholder="Enter refund refusal explanation"
                style={{ flex: 1 }}
              />
            </div>
            <div>
              <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
                Refund Policy
              </div>
              {afterpayProvideInfo.refundPolicy ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <FileOutlined
                      style={{ marginRight: 8, color: '#52c41a' }}
                    />
                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {afterpayProvideInfo.refundPolicy.filename}
                    </span>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleAfterpayFieldChange('refundPolicy', null)
                    }
                    style={{ marginLeft: 8 }}
                  />
                </div>
              ) : null}
              <Upload
                beforeUpload={(file) => {
                  handleAfterPayRefundPolicySelect(file as File);
                  return false;
                }}
                showUploadList={false}
                multiple={false}
                accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                disabled={afterpayRefundPolicyUploading}
              >
                <Button
                  icon={
                    afterpayRefundPolicyUploading ? (
                      <LoadingOutlined />
                    ) : (
                      <UploadOutlined />
                    )
                  }
                  loading={afterpayRefundPolicyUploading}
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                >
                  {afterpayRefundPolicyUploading
                    ? 'Uploading...'
                    : 'Refund Policy'}
                </Button>
              </Upload>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AfterpayProvideInfoModal;
