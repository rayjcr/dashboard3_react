/**
 * Dispute Action Modal Component
 * Main modal for handling dispute actions including submit and accept refund
 */

import React, { useCallback } from 'react';
import { Modal, Input, Button, Upload } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  FileOutlined,
  FileTextOutlined,
  LinkOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useThemeStore, useAuthStore } from '@/stores';
import { disputeApi } from '@/services/api/disputeApi';
import type { KlarnaShipmentData } from '@/config/klarnaForm';
import { useDisputeModals } from './DisputeModalsContext';
import {
  shouldShowProvideInfo,
  shouldShowProofOfFulfillment,
  shouldShowAttachmentUpload,
  isAfterPayVendor,
  isKlarnaVendor,
  validateFiles,
} from './utils';

// Scoped styles for action modal description
const actionDescriptionStyles = `
  .dispute-action-description-content {
    all: revert;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
  .dispute-action-description-content ul,
  .dispute-action-description-content ol {
    margin: 8px 0;
    padding-left: 20px;
    list-style-position: outside;
  }
  .dispute-action-description-content ul {
    list-style-type: disc;
  }
  .dispute-action-description-content ol {
    list-style-type: decimal;
  }
  .dispute-action-description-content li {
    margin: 4px 0;
    padding: 0;
    display: list-item;
  }
  .dispute-action-description-content p {
    margin: 8px 0;
  }
  .dispute-action-description-content a {
    color: #1890ff;
    text-decoration: underline;
  }
  .dispute-action-description-content table {
    border-collapse: collapse;
    margin: 8px 0;
  }
  .dispute-action-description-content th,
  .dispute-action-description-content td {
    border: 1px solid #d9d9d9;
    padding: 8px;
  }
`;

interface DisputeActionModalProps {
  onEvidenceSubmitted?: () => void;
}

export const DisputeActionModal: React.FC<DisputeActionModalProps> = ({
  onEvidenceSubmitted,
}) => {
  const { currentTheme } = useThemeStore();
  const { sessionId } = useAuthStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  const {
    // Action Modal state
    actionModalVisible,
    actionRecord,
    actionNote,
    uploadedFiles,
    uploading,
    closeActionModal,
    setActionNote,
    setUploadedFiles,
    setUploading,
    removeUploadedFile,
    pendingFilesRef,
    uploadTimerRef,
    pendingSubmitFilesRef,

    // PPCP Modal actions
    openPPCPModal,
    ppcpProvideInfo,

    // Afterpay Modal actions
    openAfterpayModal,
    afterpayProvideInfo,

    // Klarna Modal actions
    openKlarnaModal,
    klarnaProvideInfo,
    klarnaRequestIds,
    setKlarnaDisplayForm,
    setKlarnaProvideInfo,
    setKlarnaIsMultiShipments,
    setKlarnaHasShipments,
    setKlarnaRequestIds,
    klarnaDisplayForm,

    // Confirm Modal
    confirmModalVisible,
    submitting,
    openConfirmModal,
    closeConfirmModal,
    setSubmitting,

    // Accept Refund Modal
    acceptRefundModalVisible,
    acceptRefundLoading,
    openAcceptRefundModal,
    closeAcceptRefundModal,
    setAcceptRefundLoading,

    // Message API
    message,
  } = useDisputeModals();

  // Get note character count and check if over limit
  const noteCharCount = actionNote.length;
  const isNoteOverLimit = noteCharCount > 2000;

  // Validate submit form data
  const validateSubmitForm = useCallback((): {
    valid: boolean;
    error?: string;
  } => {
    if (!actionRecord) return { valid: false, error: 'No record selected' };

    const vendor = actionRecord.vendor?.toLowerCase() || '';
    const isCardOrPaze = ['card', 'paze'].includes(vendor);

    // For card/paze vendors: validate refId and note
    if (isCardOrPaze) {
      if (!ppcpProvideInfo.refId?.trim()) {
        return {
          valid: false,
          error: 'Please provide Refund ID Or Reference ID',
        };
      }
      if (actionNote && actionNote.length > 2000) {
        return { valid: false, error: 'The text is limited to 2000 words' };
      }
    }

    // For vendors that show provide info: validate tracking info
    if (shouldShowProofOfFulfillment(actionRecord)) {
      if (
        !ppcpProvideInfo.trackNum?.trim() ||
        !ppcpProvideInfo.carrierName?.trim()
      ) {
        return {
          valid: false,
          error: 'Please provide Tracking Number and Carrier Name',
        };
      }
    }

    return { valid: true };
  }, [actionRecord, ppcpProvideInfo, actionNote]);

  // Validate Klarna form data
  const validateKlarnaForm = useCallback((): boolean => {
    if (!actionRecord?.requests) {
      return true;
    }

    try {
      const requests = JSON.parse(actionRecord.requests);

      for (let i = 0; i < requests.length; i++) {
        const requestedFields = requests[i].requested_fields;

        if (!requestedFields || !Array.isArray(requestedFields)) {
          continue;
        }

        for (let j = 0; j < requestedFields.length; j++) {
          const fieldKey = requestedFields[j];

          // Check if provide info exists for this request
          if (!klarnaProvideInfo[i]) {
            return false;
          }

          // Skip shipment fields, validate them separately
          if (!['list_of_shipments', 'shipment'].includes(fieldKey)) {
            // Validate regular field
            if (!klarnaProvideInfo[i][fieldKey]) {
              return false;
            }
          } else {
            // Validate shipment fields
            const shipments = klarnaProvideInfo[i].list_of_shipments;
            if (!shipments || shipments.length === 0) {
              return false;
            }

            // Validate each shipment has all required fields
            for (let m = 0; m < shipments.length; m++) {
              const shipmentFieldKeys = [
                'capture_id',
                'is_shipping_company_contacted',
                'shipping_carrier',
                'shipping_date',
                'tracking_id',
              ];

              for (const shipmentFieldKey of shipmentFieldKeys) {
                if (
                  !shipments[m][shipmentFieldKey as keyof KlarnaShipmentData]
                ) {
                  return false;
                }
              }
            }
          }
        }
      }

      return true;
    } catch {
      return true; // If parsing fails, skip validation
    }
  }, [actionRecord?.requests, klarnaProvideInfo]);

  // Handle Submit button click - validate and show confirm modal
  const handleSubmitClick = useCallback(() => {
    const vendor = actionRecord?.vendor?.toLowerCase() || '';

    // Validate based on vendor
    if (vendor === 'klarna') {
      // Validate Klarna form
      if (!validateKlarnaForm()) {
        message.error(
          'Please complete the required fields in the "Provide Information"',
        );
        return;
      }
    } else if (vendor !== 'afterpay') {
      // For non-afterpay and non-klarna vendors, use existing validation
      const validation = validateSubmitForm();
      if (!validation.valid) {
        message.error(validation.error);
        return;
      }
    }
    openConfirmModal();
  }, [
    actionRecord?.vendor,
    validateSubmitForm,
    validateKlarnaForm,
    openConfirmModal,
    message,
  ]);

  // Handle confirm submit - call API
  const handleConfirmSubmit = useCallback(async () => {
    if (!actionRecord?.caseId) {
      message.error('Case ID not found');
      return;
    }

    if (!sessionId) {
      message.error('Session expired. Please login again.');
      return;
    }

    setSubmitting(true);

    try {
      const vendor = actionRecord.vendor?.toLowerCase() || '';
      const isAfterPay = vendor === 'afterpay';
      const isKlarna = vendor === 'klarna';

      if (isAfterPay) {
        // Afterpay submission flow
        const evidenceData = {
          uncategorizedText: actionNote || '',
          productDescription: afterpayProvideInfo.productDescription || '',
          shippingAddress: afterpayProvideInfo.shippingAddress || '',
          shippingDate: afterpayProvideInfo.shippingDate || '',
          shippingCarrier: afterpayProvideInfo.shippingCarrier || '',
          shippingTrackingNumber:
            afterpayProvideInfo.shippingTrackingNumber || '',
          refundPolicyDisclosure:
            afterpayProvideInfo.refundPolicyDisclosure || '',
          refundRefusalExplanation:
            afterpayProvideInfo.refundRefusalExplanation || '',
          uncategorizedFile: uploadedFiles[0]?.fileId || '',
          shippingDocumentation: afterpayProvideInfo.shippingDocument?.id
            ? String(afterpayProvideInfo.shippingDocument.id)
            : '',
          refundPolicy: afterpayProvideInfo.refundPolicy?.id
            ? String(afterpayProvideInfo.refundPolicy.id)
            : '',
        };

        const afterpayResponse = await disputeApi.submitAfterPayEvidence(
          actionRecord.caseId,
          evidenceData,
          sessionId,
        );

        if (afterpayResponse.code === 200) {
          message.success('Evidence submitted successfully');
          closeConfirmModal();
          closeActionModal();
          onEvidenceSubmitted?.();
        } else {
          message.error(afterpayResponse.message || 'Submit evidence failed');
        }
      } else if (isKlarna) {
        // Klarna submission flow
        // Build attachments from uploaded files
        const attachments = uploadedFiles.map((file) => ({
          fileName: file.fileName,
          id: file.fileId,
        }));

        // Build requests array from klarnaProvideInfo
        const requests = klarnaProvideInfo.map((info, index) => {
          // Filter out list_of_shipments and build requested_fields object
          const requestedFields: {
            [key: string]: string | KlarnaShipmentData[] | undefined;
          } = {};

          Object.keys(info).forEach((key) => {
            if (key === 'list_of_shipments') {
              // Include shipments if they exist and have data
              const shipments = info.list_of_shipments;
              if (shipments && shipments.length > 0) {
                // Filter out empty shipments
                const validShipments = shipments.filter((shipment) =>
                  Object.values(shipment).some((v) => v && v.trim()),
                );
                if (validShipments.length > 0) {
                  requestedFields.list_of_shipments = validShipments;
                }
              }
            } else if (
              info[key] &&
              typeof info[key] === 'string' &&
              (info[key] as string).trim()
            ) {
              requestedFields[key] = info[key];
            }
          });

          return {
            attachments: attachments,
            comment: actionNote || '',
            request_id: klarnaRequestIds[index] || index + 1,
            requested_fields: requestedFields,
          };
        });

        const klarnaData = {
          case_id: actionRecord.caseId,
          status: 'under_review',
          from: actionRecord.merchantId,
          session_id: sessionId,
          requests: requests,
        };

        const klarnaResponse = await disputeApi.submitKlarnaEvidence(
          actionRecord.caseId,
          klarnaData,
        );

        if (klarnaResponse.code === 200) {
          message.success('Evidence submitted successfully');
          closeConfirmModal();
          closeActionModal();
          onEvidenceSubmitted?.();
        } else {
          message.error(klarnaResponse.message || 'Submit evidence failed');
        }
      } else {
        // Regular submission flow (PPCP)
        // Step 1: Submit evidence files
        const submitData = {
          carrier_name: ppcpProvideInfo.carrierName || '',
          tracking_number: ppcpProvideInfo.trackNum || '',
          refund_id: ppcpProvideInfo.refId || '',
          note: actionNote || '',
        };

        const evidenceResponse = await disputeApi.submitEvidence(
          actionRecord.caseId,
          pendingSubmitFilesRef.current,
          submitData,
        );

        if (evidenceResponse.code !== 200) {
          message.error(evidenceResponse.message || 'Submit evidence failed');
          return;
        }

        // Step 2: Update dispute status
        // Build evidence JSON string from uploaded files
        const evidenceJson =
          uploadedFiles.length > 0
            ? JSON.stringify(
                uploadedFiles.map((file) => ({
                  id: file.fileId,
                  file_name: file.fileName,
                })),
              )
            : '';

        const updateData = {
          note: actionNote || '',
          evidence: evidenceJson,
          case_id: actionRecord.caseId,
          status: 'under_review',
          from: actionRecord.merchantId,
          session_id: sessionId,
        };

        const updateResponse = await disputeApi.updateDispute(
          actionRecord.caseId,
          updateData,
        );

        if (updateResponse.code === 200) {
          message.success('Evidence submitted successfully');
          // Close all modals
          closeConfirmModal();
          closeActionModal();
          // Trigger refresh of dispute list
          onEvidenceSubmitted?.();
        } else {
          message.error(updateResponse.message || 'Update dispute failed');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      message.error('Failed to submit evidence. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    actionRecord,
    ppcpProvideInfo,
    afterpayProvideInfo,
    actionNote,
    uploadedFiles,
    sessionId,
    closeActionModal,
    closeConfirmModal,
    onEvidenceSubmitted,
    klarnaProvideInfo,
    klarnaRequestIds,
    setSubmitting,
    pendingSubmitFilesRef,
    message,
  ]);

  // Handle confirm accept refund
  const handleConfirmAcceptRefund = useCallback(async () => {
    if (!actionRecord?.caseId) {
      message.error('Case ID not found');
      return;
    }

    if (!sessionId) {
      message.error('Session expired. Please login again.');
      return;
    }

    setAcceptRefundLoading(true);

    try {
      const updateData = {
        note: 'merchant accept refund',
        evidence: '',
        case_id: actionRecord.caseId,
        status: 'lost_waiting_for_refund',
        from: actionRecord.merchantId,
        session_id: sessionId,
      };

      const response = await disputeApi.updateDispute(
        actionRecord.caseId,
        updateData,
      );

      if (response.code === 200) {
        message.success(
          'Dispute accepted. Funds will be returned to consumer.',
        );
        // Close all modals
        closeAcceptRefundModal();
        closeActionModal();
        // Trigger refresh of dispute list
        onEvidenceSubmitted?.();
      } else {
        message.error(response.message || 'Accept refund failed');
      }
    } catch (error) {
      console.error('Accept refund error:', error);
      message.error('Failed to accept refund. Please try again.');
    } finally {
      setAcceptRefundLoading(false);
    }
  }, [
    actionRecord,
    sessionId,
    closeActionModal,
    closeAcceptRefundModal,
    onEvidenceSubmitted,
    setAcceptRefundLoading,
    message,
  ]);

  // Execute the actual upload
  const executeUpload = useCallback(async () => {
    let filesToUpload = [...pendingFilesRef.current];
    pendingFilesRef.current = []; // Clear pending files

    const vendor = actionRecord?.vendor?.toLowerCase() || '';
    const isAfterPay = vendor === 'afterpay';
    const isKlarna = vendor === 'klarna';

    if (filesToUpload.length === 0) {
      return;
    }

    // For Afterpay and Klarna, use caseId; for others use id
    if ((isAfterPay || isKlarna) && !actionRecord?.caseId) {
      return;
    }

    if (!isAfterPay && !isKlarna && !actionRecord?.id) {
      return;
    }

    // For Afterpay vendor, only keep the last file
    if (isAfterPay && filesToUpload.length > 1) {
      filesToUpload = [filesToUpload[filesToUpload.length - 1]];
    }

    // Validate files
    const validation = validateFiles(filesToUpload);
    if (!validation.valid) {
      message.error(validation.error);
      return;
    }

    setUploading(true);

    try {
      if (isAfterPay) {
        // Afterpay: use POST /dispute/{caseId}/afterpay/file
        const response = await disputeApi.uploadAfterPayFile(
          actionRecord!.caseId,
          filesToUpload[0],
        );

        if (response.code === 200 && response.data) {
          const fileInfo = response.data;
          // Convert AfterPayFileInfo to UploadedFileInfo format for consistency
          const uploadedFileInfo = {
            fileId: fileInfo.id,
            fileName: fileInfo.filename,
            staticUrl: fileInfo.url,
          };
          setUploadedFiles([uploadedFileInfo]);
          pendingSubmitFilesRef.current = filesToUpload;
          message.success('Successfully uploaded 1 file');
        } else {
          message.error('Upload failed');
        }
      } else if (isKlarna) {
        // Klarna: use POST /dispute/{caseId}/klarna/file
        const response = await disputeApi.uploadKlarnaFiles(
          actionRecord!.caseId,
          filesToUpload,
        );

        if (response.code === 200 && response.data) {
          // Convert Klarna file info to UploadedFileInfo format
          const uploadedFileInfos = response.data.map((fileInfo) => ({
            fileId: fileInfo.id,
            fileName: fileInfo.fileName,
            staticUrl: '', // Klarna doesn't return URL
          }));
          setUploadedFiles((prev) => [...prev, ...uploadedFileInfos]);
          pendingSubmitFilesRef.current = [
            ...pendingSubmitFilesRef.current,
            ...filesToUpload,
          ];
          message.success(
            `Successfully uploaded ${response.data.length} file(s)`,
          );
        } else {
          message.error('Upload failed');
        }
      } else {
        // Others: use PUT /dispute/resource/{id}
        const response = await disputeApi.uploadDisputeFiles(
          actionRecord!.id,
          filesToUpload,
        );

        if (response.code === 200 && response.data) {
          setUploadedFiles((prev) => [...prev, ...response.data]);
          pendingSubmitFilesRef.current = [
            ...pendingSubmitFilesRef.current,
            ...filesToUpload,
          ];
          message.success(
            `Successfully uploaded ${response.data.length} file(s)`,
          );
        } else {
          message.error('Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [
    actionRecord,
    pendingFilesRef,
    pendingSubmitFilesRef,
    setUploading,
    setUploadedFiles,
    message,
  ]);

  // Handle file selection - collect files and debounce upload
  const handleFileSelect = useCallback(
    (file: File) => {
      // Add file to pending list
      pendingFilesRef.current.push(file);

      // Clear existing timer
      if (uploadTimerRef.current) {
        clearTimeout(uploadTimerRef.current);
      }

      // Set a short delay to collect all files before uploading
      uploadTimerRef.current = setTimeout(() => {
        executeUpload();
        uploadTimerRef.current = null;
      }, 100);
    },
    [executeUpload, pendingFilesRef, uploadTimerRef],
  );

  // Handle open Klarna modal with initialization
  const handleOpenKlarnaModal = useCallback(() => {
    if (!actionRecord) return;

    // Only initialize data if not already initialized
    if (klarnaDisplayForm.length === 0) {
      // Parse requests from the record
      const requestsStr = actionRecord.requests;

      // Dynamic import to avoid require
      import('@/config/klarnaForm').then(
        ({ parseKlarnaRequests, createInitialKlarnaProvideInfo }) => {
          const {
            displayKlarnaForm,
            isMultiShipments,
            hasShipments,
            requestIds,
          } = parseKlarnaRequests(requestsStr);

          setKlarnaDisplayForm(displayKlarnaForm);
          setKlarnaIsMultiShipments(isMultiShipments);
          setKlarnaHasShipments(hasShipments);
          setKlarnaRequestIds(requestIds);

          // Initialize provide info data
          const initialProvideInfo =
            createInitialKlarnaProvideInfo(displayKlarnaForm);
          setKlarnaProvideInfo(initialProvideInfo);

          openKlarnaModal();
        },
      );
    } else {
      openKlarnaModal();
    }
  }, [
    actionRecord,
    klarnaDisplayForm.length,
    openKlarnaModal,
    setKlarnaDisplayForm,
    setKlarnaIsMultiShipments,
    setKlarnaHasShipments,
    setKlarnaRequestIds,
    setKlarnaProvideInfo,
  ]);

  return (
    <>
      {/* Action Modal */}
      <Modal
        title="Dispute"
        open={actionModalVisible}
        onCancel={closeActionModal}
        width={700}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="primary" onClick={handleSubmitClick}>
              Submit
            </Button>
            <Button danger onClick={openAcceptRefundModal}>
              Accept and Refund
            </Button>
          </div>
        }
      >
        {actionRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Description */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Description
              </div>
              <div
                style={{
                  padding: 12,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  minHeight: 60,
                }}
              >
                {actionRecord.description &&
                actionRecord.description !== '-' ? (
                  <div
                    className="dispute-action-description-content"
                    dangerouslySetInnerHTML={{
                      __html: actionRecord.description,
                    }}
                  />
                ) : (
                  'No description available'
                )}
              </div>
            </div>

            {/* Scoped styles for action modal description */}
            <style>{actionDescriptionStyles}</style>

            {/* Note Input */}
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Note</div>
              <Input.TextArea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={4}
                placeholder="Enter your note here..."
              />
              <div
                style={{
                  textAlign: 'right',
                  marginTop: 4,
                  color: isNoteOverLimit ? '#ff4d4f' : '#999',
                  fontSize: 12,
                }}
              >
                {isNoteOverLimit && (
                  <span style={{ marginRight: 8 }}>
                    Exceeded character limit!
                  </span>
                )}
                {noteCharCount}/2000
              </div>
            </div>

            {/* Provide Information Section */}
            {shouldShowProvideInfo(actionRecord) && (
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>
                  Provide Information
                </div>
                {isAfterPayVendor(actionRecord) ? (
                  <Button type="primary" onClick={openAfterpayModal}>
                    Provide Information
                  </Button>
                ) : isKlarnaVendor(actionRecord) ? (
                  <Button type="primary" onClick={handleOpenKlarnaModal}>
                    Provide Information
                  </Button>
                ) : (
                  <Button type="primary" onClick={openPPCPModal}>
                    Provide Information
                  </Button>
                )}
              </div>
            )}

            {/* Attachment Upload Section */}
            {shouldShowAttachmentUpload(actionRecord) && (
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>
                  Attachment Upload
                </div>
                <div style={{ marginBottom: 8, fontSize: 12, color: '#999' }}>
                  Allowed: PNG, JPEG, PDF. Max 5MB per file, 20MB total.
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.fileId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f6ffed',
                          border: '1px solid #b7eb8f',
                          borderRadius: 4,
                          marginBottom: 4,
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
                            {file.fileName}
                          </span>
                          {file.staticUrl && (
                            <a
                              href={file.staticUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ marginLeft: 8, flexShrink: 0 }}
                            >
                              <LinkOutlined style={{ color: primaryColor }} />
                            </a>
                          )}
                        </div>
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeUploadedFile(file.fileId)}
                          style={{ marginLeft: 8 }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <Upload
                  beforeUpload={(file) => {
                    handleFileSelect(file as File);
                    return false; // Prevent auto upload
                  }}
                  showUploadList={false}
                  multiple={!isAfterPayVendor(actionRecord)}
                  accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf"
                  disabled={uploading}
                >
                  <Button
                    icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                    loading={uploading}
                    style={{
                      borderColor: primaryColor,
                      color: primaryColor,
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                </Upload>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Submit Modal */}
      <Modal
        title="Confirm Submit"
        open={confirmModalVisible}
        onCancel={closeConfirmModal}
        width={600}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={closeConfirmModal} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmSubmit}
              loading={submitting}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Info Tips */}
          <div
            style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: 4,
              padding: 12,
              color: '#096dd9',
              fontSize: 13,
            }}
          >
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Please make sure that all the files and information have been
            uploaded. After clicking Confirm, you will not be able to upload
            other files and information.
          </div>

          {/* Non-Afterpay and Non-Klarna: Show Evidence Summary */}
          {!isAfterPayVendor(actionRecord) && !isKlarnaVendor(actionRecord) && (
            <>
              {/* Submitted Evidence Summary */}
              <div
                style={{
                  border: '1px solid #e8e8e8',
                  borderRadius: 4,
                  padding: 16,
                  background: '#fafafa',
                }}
              >
                <div
                  style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                >
                  Evidence Summary
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {ppcpProvideInfo.trackNum && (
                    <div style={{ display: 'flex', fontSize: 13 }}>
                      <div style={{ width: 140, color: '#666' }}>
                        Tracking Number:
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {ppcpProvideInfo.trackNum}
                      </div>
                    </div>
                  )}
                  {ppcpProvideInfo.carrierName && (
                    <div style={{ display: 'flex', fontSize: 13 }}>
                      <div style={{ width: 140, color: '#666' }}>
                        Carrier Name:
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {ppcpProvideInfo.carrierName}
                      </div>
                    </div>
                  )}
                  {ppcpProvideInfo.refId && (
                    <div style={{ display: 'flex', fontSize: 13 }}>
                      <div style={{ width: 140, color: '#666' }}>
                        Refund ID/Reference:
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {ppcpProvideInfo.refId}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Section */}
              {actionNote && (
                <div
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: 4,
                    padding: 16,
                    background: '#fafafa',
                  }}
                >
                  <div
                    style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                  >
                    Note
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#333',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {actionNote}
                  </div>
                </div>
              )}

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: 4,
                    padding: 16,
                    background: '#fafafa',
                  }}
                >
                  <div
                    style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                  >
                    Uploaded Files ({uploadedFiles.length})
                  </div>
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={file.fileId || index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          color: '#333',
                        }}
                      >
                        <FileTextOutlined style={{ color: '#1890ff' }} />
                        <span>{file.fileName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Accept and Refund Confirmation Modal */}
      <Modal
        title="Accept Dispute"
        open={acceptRefundModalVisible}
        onCancel={closeAcceptRefundModal}
        width={500}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              onClick={closeAcceptRefundModal}
              disabled={acceptRefundLoading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleConfirmAcceptRefund}
              loading={acceptRefundLoading}
            >
              OK
            </Button>
          </div>
        }
      >
        <div style={{ fontSize: 14, lineHeight: 1.6, color: '#333' }}>
          {isAfterPayVendor(actionRecord) || isKlarnaVendor(actionRecord) ? (
            <>I accept this dispute case and will refund the funds later.</>
          ) : (
            <>
              I accept this dispute case.
              <br />* The funds will be returned to the consumer's account
              automatically.
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DisputeActionModal;
