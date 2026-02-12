import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  Table,
  Typography,
  Button,
  Tag,
  Empty,
  Modal,
  Spin,
  Descriptions,
  Timeline,
  message,
  Input,
  Upload,
  Tooltip,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  FileOutlined,
  FileTextOutlined,
  LinkOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {
  DisputeListResponse,
  DisputeSummaryTableRow,
  DisputeRecord,
  DisputeNote,
  DisputeNoteEvidence,
} from '@/types/dashboard';
import { ACTION_BUTTON_VENDORS } from '@/types/dashboard';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore, useAuthStore } from '@/stores';
import {
  disputeApi,
  type UploadedFileInfo,
  type AfterPayFileInfo,
} from '@/services/api/disputeApi';
import {
  parseKlarnaRequests,
  createInitialKlarnaProvideInfo,
  KlarnaFormShipments as KlarnaFormShipmentsConfig,
  type KlarnaDisplayForm,
  type KlarnaProvideInfoData,
  type KlarnaShipmentData,
  type KlarnaFormField,
} from '@/config/klarnaForm';
import { Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import '../dashboard.css';

const { Text } = Typography;

// File upload constants
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total

interface DisputeSummaryTableProps {
  data: DisputeListResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onEvidenceSubmitted?: () => void; // Callback when evidence is successfully submitted
}

/**
 * Determine whether to show Action button
 */
function shouldShowActionButton(status: string, vendor: string): boolean {
  const upperVendor = vendor?.toUpperCase() || '';

  // If vendor is one of the special list
  if (ACTION_BUTTON_VENDORS.includes(upperVendor)) {
    // Only show Action when status === 'request_info'
    if (status === 'request_info') {
      return true;
    }
    return false;
  } else if (
    status === 'request_info' ||
    status === 'lost_waiting_for_refund'
  ) {
    // Not in special list, show Action when status is request_info or lost_waiting_for_refund
    return true;
  }

  return false;
}

/**
 * Get status tag color
 */
function getStatusTagColor(status: string): string {
  switch (status) {
    case 'request_info':
      return 'orange';
    case 'under_review':
      return 'blue';
    case 'lost_waiting_for_refund':
      return 'volcano';
    case 'win':
    case 'won':
      return 'green';
    case 'lost':
      return 'red';
    case 'close':
      return 'default';
    default:
      return 'default';
  }
}

/**
 * Get status display text
 */
function getStatusDisplayText(status: string): string {
  switch (status) {
    case 'request_info':
      return 'Waiting For Response';
    case 'under_review':
      return 'Under Review';
    case 'lost_waiting_for_refund':
      return 'Waiting For Refund';
    case 'won':
    case 'win':
      return 'Merchant Win';
    case 'lost':
      return 'Merchant Lost';
    case 'close':
      return 'Closed';
    default:
      return status || '-';
  }
}

export const DisputeSummaryTable: React.FC<DisputeSummaryTableProps> = ({
  data,
  loading,
  error,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEvidenceSubmitted,
}) => {
  const { currentTheme } = useThemeStore();
  const { sessionId } = useAuthStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  // Modal state for Dispute Detail
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<DisputeSummaryTableRow | null>(null);
  const [disputeNotes, setDisputeNotes] = useState<DisputeNote[]>([]);

  // Action Modal state
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionRecord, setActionRecord] =
    useState<DisputeSummaryTableRow | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Upload state - file info uploaded to server
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [uploading, setUploading] = useState(false);

  // Ref to collect files for batch upload (prevents multiple API calls)
  const pendingFilesRef = useRef<File[]>([]);
  const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Provide Information Modal state
  const [provideInfoModalVisible, setProvideInfoModalVisible] = useState(false);
  const [provideInfoData, setProvideInfoData] = useState({
    trackNum: '',
    carrierName: '',
    refId: '',
  });

  // Confirm Submit Modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Accept and Refund Modal state
  const [acceptRefundModalVisible, setAcceptRefundModalVisible] =
    useState(false);
  const [acceptRefundLoading, setAcceptRefundLoading] = useState(false);

  // Store original files for final submission (separate from uploadedFiles which is server response)
  const pendingSubmitFilesRef = useRef<File[]>([]);

  // Afterpay Provide Information Modal state
  const [provideInfoAfterPayModalVisible, setProvideInfoAfterPayModalVisible] =
    useState(false);
  const [provideInfoAfterPay, setProvideInfoAfterPay] = useState({
    productDescription: '',
    shippingAddress: '',
    shippingDate: '',
    shippingCarrier: '',
    shippingTrackingNumber: '',
    shippingDocument: null as AfterPayFileInfo | null,
    refundPolicyDisclosure: '',
    refundRefusalExplanation: '',
    refundPolicy: null as AfterPayFileInfo | null,
  });

  // Afterpay file upload states
  const [afterpayShippingDocUploading, setAfterPayShippingDocUploading] =
    useState(false);
  const [afterpayRefundPolicyUploading, setAfterPayRefundPolicyUploading] =
    useState(false);
  const pendingAfterPayShippingDocRef = useRef<File | null>(null);
  const pendingAfterPayRefundPolicyRef = useRef<File | null>(null);
  const afterpayShippingDocTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const afterpayRefundPolicyTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Klarna Provide Information Modal state
  const [provideInfoKlarnaModalVisible, setProvideInfoKlarnaModalVisible] =
    useState(false);
  const [klarnaDisplayForm, setKlarnaDisplayForm] = useState<
    KlarnaDisplayForm[]
  >([]);
  const [klarnaProvideInfo, setKlarnaProvideInfo] = useState<
    KlarnaProvideInfoData[]
  >([]);
  const [klarnaIsMultiShipments, setKlarnaIsMultiShipments] = useState<
    boolean[]
  >([]);
  const [klarnaHasShipments, setKlarnaHasShipments] = useState(false);
  const [klarnaRequestIds, setKlarnaRequestIds] = useState<number[]>([]);

  // Handle Action button click
  const handleActionClick = useCallback((record: DisputeSummaryTableRow) => {
    setActionRecord(record);
    setActionNote('');
    setUploadedFiles([]);
    setUploading(false);
    // Reset provide info data when opening for a new record
    setProvideInfoData({
      trackNum: '',
      carrierName: '',
      refId: '',
    });
    // Reset afterpay provide info
    setProvideInfoAfterPay({
      productDescription: '',
      shippingAddress: '',
      shippingDate: '',
      shippingCarrier: '',
      shippingTrackingNumber: '',
      shippingDocument: null,
      refundPolicyDisclosure: '',
      refundRefusalExplanation: '',
      refundPolicy: null,
    });
    // Reset klarna provide info
    setKlarnaDisplayForm([]);
    setKlarnaProvideInfo([]);
    setKlarnaIsMultiShipments([]);
    setKlarnaHasShipments(false);
    setKlarnaRequestIds([]);
    // Reset submit related state
    setConfirmModalVisible(false);
    setSubmitting(false);
    pendingSubmitFilesRef.current = [];
    setActionModalVisible(true);
  }, []);

  // Handle Action Modal close
  const handleActionModalClose = useCallback(() => {
    setActionModalVisible(false);
    setActionRecord(null);
    setActionNote('');
    setUploadedFiles([]);
    setUploading(false);
    // Clear provide info data when closing the main modal
    setProvideInfoData({
      trackNum: '',
      carrierName: '',
      refId: '',
    });
    // Also close the provide info modal if it's open
    setProvideInfoModalVisible(false);
    // Close afterpay modal
    setProvideInfoAfterPayModalVisible(false);
    // Close klarna modal
    setProvideInfoKlarnaModalVisible(false);
    setKlarnaDisplayForm([]);
    setKlarnaProvideInfo([]);
    setKlarnaIsMultiShipments([]);
    setKlarnaHasShipments(false);
    setKlarnaRequestIds([]);
    // Close confirm modal and reset submit state
    setConfirmModalVisible(false);
    setSubmitting(false);
    pendingSubmitFilesRef.current = [];
    // Close accept refund modal
    setAcceptRefundModalVisible(false);
    setAcceptRefundLoading(false);
  }, []);

  // Check if should show Provide Information section
  const shouldShowProvideInfo = useCallback(
    (record: DisputeSummaryTableRow | null): boolean => {
      if (!record) return false;
      const allowedVendors = ['card', 'paze', 'afterpay', 'klarna'];
      return (
        record.status !== 'lost_waiting_for_refund' &&
        !!record.vendor &&
        allowedVendors.includes(record.vendor.toLowerCase())
      );
    },
    [],
  );

  // Check if should show Proof of Fulfillment section in Provide Info Modal
  const shouldShowProofOfFulfillment = (
    record: DisputeSummaryTableRow | null,
  ): boolean => {
    if (!record) return false;
    const fulfillmentReasons = [
      'unauthorized',
      'merchandise or service not received',
    ];
    return fulfillmentReasons.includes(record.reason?.toLowerCase() || '');
  };

  // Check if vendor is afterpay
  const isAfterPayVendor = (record: DisputeSummaryTableRow | null): boolean => {
    if (!record) return false;
    return record.vendor?.toLowerCase() === 'afterpay';
  };

  // Check if vendor is klarna
  const isKlarnaVendor = (record: DisputeSummaryTableRow | null): boolean => {
    if (!record) return false;
    return record.vendor?.toLowerCase() === 'klarna';
  };

  // Handle open Afterpay Provide Information Modal
  const handleOpenProvideInfoAfterPayModal = useCallback(() => {
    setProvideInfoAfterPayModalVisible(true);
  }, []);

  // Handle close Afterpay Provide Information Modal
  const handleCloseProvideInfoAfterPayModal = useCallback(() => {
    setProvideInfoAfterPayModalVisible(false);
  }, []);

  // Handle open Klarna Provide Information Modal
  const handleOpenProvideInfoKlarnaModal = useCallback(() => {
    if (!actionRecord) return;

    // Only initialize data if not already initialized
    if (klarnaDisplayForm.length === 0) {
      // Parse requests from the record
      const requestsStr = actionRecord.requests;

      const { displayKlarnaForm, isMultiShipments, hasShipments, requestIds } =
        parseKlarnaRequests(requestsStr);

      setKlarnaDisplayForm(displayKlarnaForm);
      setKlarnaIsMultiShipments(isMultiShipments);
      setKlarnaHasShipments(hasShipments);
      setKlarnaRequestIds(requestIds);

      // Initialize provide info data
      const initialProvideInfo =
        createInitialKlarnaProvideInfo(displayKlarnaForm);
      setKlarnaProvideInfo(initialProvideInfo);
    }

    setProvideInfoKlarnaModalVisible(true);
  }, [actionRecord, klarnaDisplayForm.length]);

  // Handle close Klarna Provide Information Modal
  const handleCloseProvideInfoKlarnaModal = useCallback(() => {
    setProvideInfoKlarnaModalVisible(false);
  }, []);

  // Handle Klarna form field change
  const handleKlarnaFieldChange = useCallback(
    (requestIndex: number, fieldKey: string, value: string | null) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (!newInfo[requestIndex]) {
          newInfo[requestIndex] = {};
        }
        newInfo[requestIndex][fieldKey] = value || '';
        return newInfo;
      });
    },
    [],
  );

  // Handle Klarna shipment field change
  const handleKlarnaShipmentChange = useCallback(
    (
      requestIndex: number,
      shipmentIndex: number,
      fieldKey: string,
      value: string | null,
    ) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (!newInfo[requestIndex]) {
          newInfo[requestIndex] = {};
        }
        if (!newInfo[requestIndex].list_of_shipments) {
          newInfo[requestIndex].list_of_shipments = [];
        }
        if (!newInfo[requestIndex].list_of_shipments![shipmentIndex]) {
          newInfo[requestIndex].list_of_shipments![shipmentIndex] = {};
        }
        newInfo[requestIndex].list_of_shipments![shipmentIndex][
          fieldKey as keyof KlarnaShipmentData
        ] = value || '';
        return newInfo;
      });
    },
    [],
  );

  // Handle add Klarna shipment
  const handleAddKlarnaShipment = useCallback((requestIndex: number) => {
    setKlarnaProvideInfo((prev) => {
      const newInfo = [...prev];
      if (!newInfo[requestIndex]) {
        newInfo[requestIndex] = {};
      }
      if (!newInfo[requestIndex].list_of_shipments) {
        newInfo[requestIndex].list_of_shipments = [];
      }
      newInfo[requestIndex].list_of_shipments!.push({});
      return newInfo;
    });

    // Also add a new shipments form section
    setKlarnaDisplayForm((prev) => {
      const newDisplayForm = [...prev];
      if (newDisplayForm[requestIndex]) {
        newDisplayForm[requestIndex] = {
          ...newDisplayForm[requestIndex],
          KlarnaFormShipments: [
            ...newDisplayForm[requestIndex].KlarnaFormShipments,
            [...KlarnaFormShipmentsConfig],
          ],
        };
      }
      return newDisplayForm;
    });
  }, []);

  // Handle remove Klarna shipment
  const handleRemoveKlarnaShipment = useCallback(
    (requestIndex: number, shipmentIndex: number) => {
      setKlarnaProvideInfo((prev) => {
        const newInfo = [...prev];
        if (newInfo[requestIndex]?.list_of_shipments) {
          newInfo[requestIndex].list_of_shipments!.splice(shipmentIndex, 1);
        }
        return newInfo;
      });

      // Also remove from display form
      setKlarnaDisplayForm((prev) => {
        const newDisplayForm = [...prev];
        if (newDisplayForm[requestIndex]?.KlarnaFormShipments) {
          newDisplayForm[requestIndex].KlarnaFormShipments.splice(
            shipmentIndex,
            1,
          );
        }
        return newDisplayForm;
      });
    },
    [],
  );

  // Handle afterpay provide info field change
  const handleProvideInfoAfterPayChange = useCallback(
    (
      field: keyof typeof provideInfoAfterPay,
      value: string | AfterPayFileInfo | null,
    ) => {
      setProvideInfoAfterPay((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Validate files before upload
  const validateFiles = useCallback(
    (files: File[]): { valid: boolean; error?: string } => {
      // Check file types
      for (const file of files) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          return {
            valid: false,
            error: `File "${file.name}" is not allowed. Only PNG, JPEG, and PDF files are accepted.`,
          };
        }
      }

      // Check individual file size
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          return {
            valid: false,
            error: `File "${file.name}" exceeds 5MB limit.`,
          };
        }
      }

      // Check total size
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        return {
          valid: false,
          error: `Total file size exceeds 20MB limit.`,
        };
      }

      return { valid: true };
    },
    [],
  );

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
        setProvideInfoAfterPay((prev) => ({
          ...prev,
          shippingDocument: {
            id: fileInfo.id,
            filename: fileInfo.filename,
            url: fileInfo.url,
            urlExpiresAt: fileInfo.urlExpiresAt,
          },
        }));
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
  }, [actionRecord?.caseId, validateFiles]);

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
        setProvideInfoAfterPay((prev) => ({
          ...prev,
          refundPolicy: {
            id: fileInfo.id,
            filename: fileInfo.filename,
            url: fileInfo.url,
            urlExpiresAt: fileInfo.urlExpiresAt,
          },
        }));
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
  }, [actionRecord?.caseId, validateFiles]);

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
    [executeAfterPayShippingDocUpload],
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
    [executeAfterPayRefundPolicyUpload],
  );

  // Handle open Provide Information Modal (preserve data)
  const handleOpenProvideInfoModal = useCallback(() => {
    setProvideInfoModalVisible(true);
  }, []);

  // Handle close Provide Information Modal (preserve data)
  const handleCloseProvideInfoModal = useCallback(() => {
    setProvideInfoModalVisible(false);
  }, []);

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
      if (!provideInfoData.refId?.trim()) {
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
        !provideInfoData.trackNum?.trim() ||
        !provideInfoData.carrierName?.trim()
      ) {
        return {
          valid: false,
          error: 'Please provide Tracking Number and Carrier Name',
        };
      }
    }

    return { valid: true };
  }, [actionRecord, provideInfoData, actionNote]);

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
              // Check all KlarnaFormShipments fields
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
    setConfirmModalVisible(true);
  }, [actionRecord?.vendor, validateSubmitForm, validateKlarnaForm]);

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
          productDescription: provideInfoAfterPay.productDescription || '',
          shippingAddress: provideInfoAfterPay.shippingAddress || '',
          shippingDate: provideInfoAfterPay.shippingDate || '',
          shippingCarrier: provideInfoAfterPay.shippingCarrier || '',
          shippingTrackingNumber:
            provideInfoAfterPay.shippingTrackingNumber || '',
          refundPolicyDisclosure:
            provideInfoAfterPay.refundPolicyDisclosure || '',
          refundRefusalExplanation:
            provideInfoAfterPay.refundRefusalExplanation || '',
          uncategorizedFile: uploadedFiles[0]?.fileId || '',
          shippingDocumentation: provideInfoAfterPay.shippingDocument?.id
            ? String(provideInfoAfterPay.shippingDocument.id)
            : '',
          refundPolicy: provideInfoAfterPay.refundPolicy?.id
            ? String(provideInfoAfterPay.refundPolicy.id)
            : '',
        };

        const afterpayResponse = await disputeApi.submitAfterPayEvidence(
          actionRecord.caseId,
          evidenceData,
          sessionId,
        );

        if (afterpayResponse.code === 200) {
          message.success('Evidence submitted successfully');
          setConfirmModalVisible(false);
          handleActionModalClose();
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
          setConfirmModalVisible(false);
          handleActionModalClose();
          onEvidenceSubmitted?.();
        } else {
          message.error(klarnaResponse.message || 'Submit evidence failed');
        }
      } else {
        // Regular submission flow (PPCP)
        // Step 1: Submit evidence files
        const submitData = {
          carrier_name: provideInfoData.carrierName || '',
          tracking_number: provideInfoData.trackNum || '',
          refund_id: provideInfoData.refId || '',
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
          setConfirmModalVisible(false);
          handleActionModalClose();
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
    provideInfoData,
    provideInfoAfterPay,
    actionNote,
    uploadedFiles,
    sessionId,
    handleActionModalClose,
    onEvidenceSubmitted,
    klarnaProvideInfo,
    klarnaRequestIds,
  ]);

  // Handle cancel confirm modal
  const handleCancelConfirm = useCallback(() => {
    setConfirmModalVisible(false);
  }, []);

  // Handle Accept and Refund button click
  const handleAcceptRefundClick = useCallback(() => {
    setAcceptRefundModalVisible(true);
  }, []);

  // Handle cancel accept refund modal
  const handleCancelAcceptRefund = useCallback(() => {
    setAcceptRefundModalVisible(false);
  }, []);

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
        setAcceptRefundModalVisible(false);
        handleActionModalClose();
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
  }, [actionRecord, sessionId, handleActionModalClose, onEvidenceSubmitted]);

  // Handle provideInfoData field change
  const handleProvideInfoChange = useCallback(
    (field: keyof typeof provideInfoData, value: string) => {
      setProvideInfoData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Check if should show Attachment Upload section
  const shouldShowAttachmentUpload = (
    record: DisputeSummaryTableRow | null,
  ): boolean => {
    if (!record) return false;
    return record.status !== 'lost_waiting_for_refund';
  };

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
          actionRecord.caseId,
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
          actionRecord.caseId,
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
          actionRecord.id,
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
    actionRecord?.id,
    actionRecord?.caseId,
    actionRecord?.vendor,
    validateFiles,
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
    [executeUpload],
  );

  // Handle remove uploaded file (frontend only)
  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  }, []);

  // Get note character count and check if over limit
  const noteCharCount = actionNote.length;
  const isNoteOverLimit = noteCharCount > 2000;

  // Handle case ID click
  const handleCaseIdClick = useCallback(
    async (record: DisputeSummaryTableRow) => {
      setSelectedRecord(record);
      setModalVisible(true);
      setModalLoading(true);
      setDisputeNotes([]);

      try {
        const response = await disputeApi.getDisputeDetail(record.caseId);
        if (response.code === 200) {
          setDisputeNotes(response.notes || []);
        } else {
          message.error('Failed to load dispute details');
        }
      } catch (err) {
        console.error('Failed to fetch dispute detail:', err);
        message.error('Failed to load dispute details');
      } finally {
        setModalLoading(false);
      }
    },
    [],
  );

  // Parse evidence JSON string
  const parseEvidence = (evidenceStr: string): DisputeNoteEvidence[] => {
    try {
      if (!evidenceStr) return [];
      return JSON.parse(evidenceStr) as DisputeNoteEvidence[];
    } catch {
      return [];
    }
  };

  // Convert transactions to table rows
  const tableData: DisputeSummaryTableRow[] = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.map((record: DisputeRecord, index: number) => ({
      key: `${record.case_id}-${index}`,
      id: record.id,
      caseId: record.case_id || '-',
      status: record.status || '-',
      disputeAmount: formatCurrency(record.amount, record.currency),
      timeCreated: record.time_created || '-',
      timeUpdated: record.time_updated || '-',
      paymentTransactionId: record.payment_transaction_id || '-',
      paymentMethod: record.vendor || '-',
      reason: record.reason_code || '-',
      type: record.itme_transaction_type || '-',
      caseExpirationTime: record.case_expiration_date || '-',
      currency: record.currency,
      vendor: record.vendor,
      description: record.description || '-',
      merchantId: record.merchant_id || '',
      requests: record.requests || undefined,
    }));
  }, [data]);

  // Define table columns
  const columns: ColumnsType<DisputeSummaryTableRow> = useMemo(() => {
    return [
      {
        title: 'Operation',
        key: 'operation',
        align: 'center',
        width: 100,
        fixed: 'left',
        render: (_: unknown, record: DisputeSummaryTableRow) => {
          if (shouldShowActionButton(record.status, record.vendor)) {
            return (
              <Button
                type="primary"
                size="small"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                onClick={() => handleActionClick(record)}
              >
                Action
              </Button>
            );
          }
          return <Text type="secondary">-</Text>;
        },
      },
      {
        title: 'Dispute case ID',
        dataIndex: 'caseId',
        key: 'caseId',
        align: 'left',
        width: 280,
        ellipsis: true,
        render: (text: string, record: DisputeSummaryTableRow) => (
          <Text
            copyable={{ text }}
            style={{
              fontSize: 12,
              color: primaryColor,
              cursor: 'pointer',
            }}
            onClick={() => handleCaseIdClick(record)}
          >
            {text}
          </Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        width: 160,
        render: (status: string) => (
          <Tag color={getStatusTagColor(status)}>
            {getStatusDisplayText(status)}
          </Tag>
        ),
      },
      {
        title: 'Dispute Amount',
        dataIndex: 'disputeAmount',
        key: 'disputeAmount',
        align: 'right',
        width: 130,
      },
      {
        title: 'Time Created',
        dataIndex: 'timeCreated',
        key: 'timeCreated',
        align: 'center',
        width: 180,
      },
      {
        title: 'Last updated Time',
        dataIndex: 'timeUpdated',
        key: 'timeUpdated',
        align: 'center',
        width: 180,
      },
      {
        title: 'Payment Transaction ID',
        dataIndex: 'paymentTransactionId',
        key: 'paymentTransactionId',
        align: 'left',
        width: 280,
        ellipsis: true,
        render: (text: string) => (
          <Text copyable={{ text }} style={{ fontSize: 12 }}>
            {text}
          </Text>
        ),
      },
      {
        title: 'Payment Method',
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        align: 'center',
        width: 130,
      },
      {
        title: 'Reason',
        dataIndex: 'reason',
        key: 'reason',
        align: 'left',
        width: 200,
        ellipsis: true,
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        align: 'center',
        width: 120,
      },
      {
        title: 'Case Expiration Time',
        dataIndex: 'caseExpirationTime',
        key: 'caseExpirationTime',
        align: 'center',
        width: 180,
      },
    ];
  }, [primaryColor, handleCaseIdClick, handleActionClick]);

  if (error) {
    return (
      <div style={{ padding: '16px', color: '#ff4d4f' }}>Error: {error}</div>
    );
  }

  return (
    <div className="dashboard-table">
      <Table<DisputeSummaryTableRow>
        columns={columns}
        dataSource={tableData}
        loading={loading}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: data?.total_records || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (newPage) => {
            onPageChange(newPage - 1);
          },
          onShowSizeChange: (_, newSize) => {
            onPageSizeChange(newSize);
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        size="middle"
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data" />
          ),
        }}
        scroll={{ x: 1800 }}
      />

      {/* Dispute Detail Modal */}
      <Modal
        title="Dispute Detail"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
      >
        {modalLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Basic Info */}
            <Descriptions
              bordered
              column={1}
              size="small"
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Dispute case ID">
                {selectedRecord?.caseId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedRecord?.description ? (
                  <div
                    className="dispute-description-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedRecord.description,
                    }}
                    style={{
                      all: 'revert',
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: '#333',
                    }}
                  />
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Scoped styles for description HTML content */}
            <style>
              {`
                .dispute-description-content ul,
                .dispute-description-content ol {
                  margin: 8px 0;
                  padding-left: 20px;
                  list-style-position: outside;
                }
                .dispute-description-content ul {
                  list-style-type: disc;
                }
                .dispute-description-content ol {
                  list-style-type: decimal;
                }
                .dispute-description-content li {
                  margin: 4px 0;
                  padding: 0;
                  display: list-item;
                }
                .dispute-description-content p {
                  margin: 8px 0;
                }
                .dispute-description-content a {
                  color: #1890ff;
                  text-decoration: underline;
                }
                .dispute-description-content table {
                  border-collapse: collapse;
                  margin: 8px 0;
                }
                .dispute-description-content th,
                .dispute-description-content td {
                  border: 1px solid #d9d9d9;
                  padding: 8px;
                }
              `}
            </style>

            {/* Status Change History */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 14 }}>
                Status Change History
              </Text>
            </div>

            {disputeNotes.length > 0 ? (
              <Timeline
                items={disputeNotes.map((note, index) => {
                  const evidenceList = parseEvidence(note.evidence);
                  return {
                    key: index,
                    color: getStatusTagColor(note.status),
                    children: (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 8 }}>
                          <Tag color={getStatusTagColor(note.status)}>
                            {getStatusDisplayText(note.status)}
                          </Tag>
                          <Text
                            type="secondary"
                            style={{ marginLeft: 8, fontSize: 12 }}
                          >
                            Updated: {note.time_updated || '-'}
                          </Text>
                        </div>
                        <div
                          style={{
                            background: '#f5f5f5',
                            padding: 12,
                            borderRadius: 4,
                            border: '1px solid #e8e8e8',
                          }}
                        >
                          <div style={{ marginBottom: 8 }}>
                            <Text
                              strong
                              style={{ fontSize: 12, color: '#333' }}
                            >
                              From:{' '}
                            </Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>
                              {note.note_from || '-'}
                            </Text>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text
                              strong
                              style={{ fontSize: 12, color: '#333' }}
                            >
                              Note:{' '}
                            </Text>
                            {note.note ? (
                              <div
                                className="dispute-description-content"
                                dangerouslySetInnerHTML={{
                                  __html: note.note
                                    .replace(/\n/g, '<br />')
                                    .replace(/\\n/g, '<br />'),
                                }}
                                style={{
                                  fontSize: 12,
                                  color: '#666',
                                  marginTop: 4,
                                }}
                              />
                            ) : (
                              <Text style={{ fontSize: 12, color: '#666' }}>
                                -
                              </Text>
                            )}
                          </div>
                          {evidenceList.length > 0 && (
                            <div>
                              <Text
                                strong
                                style={{ fontSize: 12, color: '#333' }}
                              >
                                Evidence:{' '}
                              </Text>
                              <ul
                                style={{
                                  margin: '4px 0 0 0',
                                  padding: 0,
                                  color: '#666',
                                  listStyle: 'none',
                                }}
                              >
                                {evidenceList.map((ev, evIndex) => (
                                  <li
                                    key={evIndex}
                                    style={{ fontSize: 12, marginLeft: 0 }}
                                  >
                                    {ev.file_name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  };
                })}
              />
            ) : (
              <Empty description="No status change history" />
            )}
          </>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title="Dispute"
        open={actionModalVisible}
        onCancel={handleActionModalClose}
        width={700}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button type="primary" onClick={handleSubmitClick}>
              Submit
            </Button>
            <Button danger onClick={handleAcceptRefundClick}>
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
            <style>
              {`
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
              `}
            </style>

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
                  <Button
                    type="primary"
                    onClick={handleOpenProvideInfoAfterPayModal}
                  >
                    Provide Information
                  </Button>
                ) : isKlarnaVendor(actionRecord) ? (
                  <Button
                    type="primary"
                    onClick={handleOpenProvideInfoKlarnaModal}
                  >
                    Provide Information
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleOpenProvideInfoModal}>
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
                          onClick={() => handleRemoveFile(file.fileId)}
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

      {/* Provide Information Modal */}
      <Modal
        title="Provide Information"
        open={provideInfoModalVisible}
        onCancel={handleCloseProvideInfoModal}
        width={500}
        footer={
          <Button type="primary" onClick={handleCloseProvideInfoModal}>
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

          {/* Proof of Fulfillment Section */}
          {shouldShowProofOfFulfillment(actionRecord) && (
            <div
              style={{
                border: '1px solid #e8e8e8',
                borderRadius: 4,
                padding: 16,
                background: '#fafafa',
              }}
            >
              <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
                Proof of Fulfillment
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 120, fontSize: 13, color: '#666' }}>
                    Tracking Number:
                  </div>
                  <Input
                    value={provideInfoData.trackNum}
                    onChange={(e) =>
                      handleProvideInfoChange('trackNum', e.target.value)
                    }
                    placeholder="Enter tracking number"
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 120, fontSize: 13, color: '#666' }}>
                    Carrier Name:
                  </div>
                  <Input
                    value={provideInfoData.carrierName}
                    onChange={(e) =>
                      handleProvideInfoChange('carrierName', e.target.value)
                    }
                    placeholder="Enter carrier name"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Proof of Refund Section */}
          <div
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: 4,
              padding: 16,
              background: '#fafafa',
            }}
          >
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>
              Proof of Refund
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 120, fontSize: 13, color: '#666' }}>
                Refund ID/Reference:
              </div>
              <Input
                value={provideInfoData.refId}
                onChange={(e) =>
                  handleProvideInfoChange('refId', e.target.value)
                }
                placeholder="Enter refund ID or reference"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Submit Modal */}
      <Modal
        title="Confirm Submit"
        open={confirmModalVisible}
        onCancel={handleCancelConfirm}
        width={600}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleCancelConfirm} disabled={submitting}>
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
                  {provideInfoData.trackNum && (
                    <div style={{ display: 'flex', fontSize: 13 }}>
                      <div style={{ width: 140, color: '#666' }}>
                        Tracking Number:
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {provideInfoData.trackNum}
                      </div>
                    </div>
                  )}
                  {provideInfoData.carrierName && (
                    <div style={{ display: 'flex', fontSize: 13 }}>
                      <div style={{ width: 140, color: '#666' }}>
                        Carrier Name:
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {provideInfoData.carrierName}
                      </div>
                    </div>
                  )}
                  {provideInfoData.refId && (
                    <div style={{ display: 'flex', fontSize: 13 }}>
                      <div style={{ width: 140, color: '#666' }}>
                        Refund ID/Reference:
                      </div>
                      <div style={{ fontWeight: 500 }}>
                        {provideInfoData.refId}
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
        onCancel={handleCancelAcceptRefund}
        width={500}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              onClick={handleCancelAcceptRefund}
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

      {/* Afterpay Provide Information Modal */}
      <Modal
        title="Provide Information"
        open={provideInfoAfterPayModalVisible}
        onCancel={handleCloseProvideInfoAfterPayModal}
        width={600}
        footer={
          <Button type="primary" onClick={handleCloseProvideInfoAfterPayModal}>
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
              value={provideInfoAfterPay.productDescription}
              onChange={(e) =>
                handleProvideInfoAfterPayChange(
                  'productDescription',
                  e.target.value,
                )
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
                  value={provideInfoAfterPay.shippingAddress}
                  onChange={(e) =>
                    handleProvideInfoAfterPayChange(
                      'shippingAddress',
                      e.target.value,
                    )
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
                  value={provideInfoAfterPay.shippingDate}
                  onChange={(e) =>
                    handleProvideInfoAfterPayChange(
                      'shippingDate',
                      e.target.value,
                    )
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
                  value={provideInfoAfterPay.shippingCarrier}
                  onChange={(e) =>
                    handleProvideInfoAfterPayChange(
                      'shippingCarrier',
                      e.target.value,
                    )
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
                  value={provideInfoAfterPay.shippingTrackingNumber}
                  onChange={(e) =>
                    handleProvideInfoAfterPayChange(
                      'shippingTrackingNumber',
                      e.target.value,
                    )
                  }
                  placeholder="Enter shipping tracking number"
                  style={{ flex: 1 }}
                />
              </div>
              <div>
                <div
                  style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                >
                  Shipping Document
                </div>
                {provideInfoAfterPay.shippingDocument ? (
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
                        {provideInfoAfterPay.shippingDocument.filename}
                      </span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        handleProvideInfoAfterPayChange(
                          'shippingDocument',
                          null,
                        )
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
                  value={provideInfoAfterPay.refundPolicyDisclosure}
                  onChange={(e) =>
                    handleProvideInfoAfterPayChange(
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
                  value={provideInfoAfterPay.refundRefusalExplanation}
                  onChange={(e) =>
                    handleProvideInfoAfterPayChange(
                      'refundRefusalExplanation',
                      e.target.value,
                    )
                  }
                  placeholder="Enter refund refusal explanation"
                  style={{ flex: 1 }}
                />
              </div>
              <div>
                <div
                  style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                >
                  Refund Policy
                </div>
                {provideInfoAfterPay.refundPolicy ? (
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
                        {provideInfoAfterPay.refundPolicy.filename}
                      </span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        handleProvideInfoAfterPayChange('refundPolicy', null)
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

      {/* Klarna Provide Information Modal */}
      <Modal
        title="Provide Information"
        open={provideInfoKlarnaModalVisible}
        onCancel={handleCloseProvideInfoKlarnaModal}
        width={700}
        footer={
          <Button type="primary" onClick={handleCloseProvideInfoKlarnaModal}>
            Done
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {klarnaDisplayForm.map((formSection, requestIndex) => (
            <div key={requestIndex}>
              {/* General Section */}
              {formSection.KlarnaForm.length > 0 && (
                <div
                  style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: 4,
                    padding: 16,
                    background: '#fafafa',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}
                  >
                    General
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {formSection.KlarnaForm.map((field: KlarnaFormField) => (
                      <div
                        key={field.key}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <div
                          style={{
                            width: 220,
                            fontSize: 13,
                            color: '#666',
                            textAlign: 'right',
                            paddingRight: 8,
                            flexShrink: 0,
                          }}
                        >
                          {field.label}:
                        </div>
                        {field.type === 'DropDown' && field.value ? (
                          <Select
                            value={
                              (klarnaProvideInfo[requestIndex]?.[
                                field.key
                              ] as string) || undefined
                            }
                            onChange={(value) =>
                              handleKlarnaFieldChange(
                                requestIndex,
                                field.key,
                                value,
                              )
                            }
                            placeholder={`Select ${field.label.toLowerCase()}`}
                            style={{ flex: 1, minWidth: 0 }}
                            options={field.value.map((opt) => ({
                              value: opt.value,
                              label: opt.label,
                            }))}
                            labelRender={({ label }) => (
                              <Tooltip title={label} placement="topLeft">
                                <span
                                  style={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {label}
                                </span>
                              </Tooltip>
                            )}
                            allowClear
                          />
                        ) : field.type === 'Date' ? (
                          <DatePicker
                            value={
                              klarnaProvideInfo[requestIndex]?.[field.key]
                                ? dayjs(
                                    klarnaProvideInfo[requestIndex][
                                      field.key
                                    ] as string,
                                  )
                                : null
                            }
                            onChange={(date) =>
                              handleKlarnaFieldChange(
                                requestIndex,
                                field.key,
                                date ? date.toISOString() : null,
                              )
                            }
                            style={{ flex: 1 }}
                          />
                        ) : field.type === 'TextArea' ? (
                          <Input.TextArea
                            value={
                              (klarnaProvideInfo[requestIndex]?.[
                                field.key
                              ] as string) || ''
                            }
                            onChange={(e) =>
                              handleKlarnaFieldChange(
                                requestIndex,
                                field.key,
                                e.target.value,
                              )
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            maxLength={field.maxLength}
                            rows={2}
                            style={{ flex: 1 }}
                          />
                        ) : field.type === 'UploadFile' ? (
                          <Upload
                            beforeUpload={() => false}
                            showUploadList={false}
                            accept=".png,.jpg,.jpeg,.pdf"
                          >
                            <Button icon={<UploadOutlined />}>
                              Upload {field.label}
                            </Button>
                          </Upload>
                        ) : (
                          <Input
                            value={
                              (klarnaProvideInfo[requestIndex]?.[
                                field.key
                              ] as string) || ''
                            }
                            onChange={(e) =>
                              handleKlarnaFieldChange(
                                requestIndex,
                                field.key,
                                e.target.value,
                              )
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            maxLength={field.maxLength}
                            minLength={field.minLength}
                            style={{ flex: 1 }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipments Section */}
              {klarnaHasShipments &&
                formSection.KlarnaFormShipments.length > 0 && (
                  <div
                    style={{
                      border: '1px solid #e8e8e8',
                      borderRadius: 4,
                      padding: 16,
                      background: '#fafafa',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        Shipments
                      </div>
                      {klarnaIsMultiShipments[requestIndex] && (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleAddKlarnaShipment(requestIndex)}
                        >
                          Add Shipments
                        </Button>
                      )}
                    </div>

                    {formSection.KlarnaFormShipments.map(
                      (shipmentFields, shipmentIndex) => (
                        <div
                          key={shipmentIndex}
                          style={{
                            border: '1px dashed #d9d9d9',
                            borderRadius: 4,
                            padding: 12,
                            marginBottom:
                              shipmentIndex <
                              formSection.KlarnaFormShipments.length - 1
                                ? 12
                                : 0,
                            background: '#fff',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 13,
                                color: '#666',
                              }}
                            >
                              Shipment #{shipmentIndex + 1}
                            </div>
                            {shipmentIndex > 0 && (
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleRemoveKlarnaShipment(
                                    requestIndex,
                                    shipmentIndex,
                                  )
                                }
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12,
                            }}
                          >
                            {shipmentFields.map((field: KlarnaFormField) => (
                              <div
                                key={field.key}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <div
                                  style={{
                                    width: 200,
                                    fontSize: 13,
                                    color: '#666',
                                    textAlign: 'right',
                                    paddingRight: 8,
                                    flexShrink: 0,
                                  }}
                                >
                                  {field.label}:
                                </div>
                                {field.type === 'DropDown' && field.value ? (
                                  <Select
                                    value={
                                      klarnaProvideInfo[requestIndex]
                                        ?.list_of_shipments?.[shipmentIndex]?.[
                                        field.key as keyof KlarnaShipmentData
                                      ] || undefined
                                    }
                                    onChange={(value) =>
                                      handleKlarnaShipmentChange(
                                        requestIndex,
                                        shipmentIndex,
                                        field.key,
                                        value,
                                      )
                                    }
                                    placeholder={`Select ${field.label.toLowerCase()}`}
                                    style={{ flex: 1, minWidth: 0 }}
                                    options={field.value.map((opt) => ({
                                      value: opt.value,
                                      label: opt.label,
                                    }))}
                                    labelRender={({ label }) => (
                                      <Tooltip
                                        title={label}
                                        placement="topLeft"
                                      >
                                        <span
                                          style={{
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {label}
                                        </span>
                                      </Tooltip>
                                    )}
                                    allowClear
                                  />
                                ) : field.type === 'TextArea' ? (
                                  <Input.TextArea
                                    value={
                                      klarnaProvideInfo[requestIndex]
                                        ?.list_of_shipments?.[shipmentIndex]?.[
                                        field.key as keyof KlarnaShipmentData
                                      ] || ''
                                    }
                                    onChange={(e) =>
                                      handleKlarnaShipmentChange(
                                        requestIndex,
                                        shipmentIndex,
                                        field.key,
                                        e.target.value,
                                      )
                                    }
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    maxLength={field.maxLength}
                                    rows={2}
                                    style={{ flex: 1 }}
                                  />
                                ) : (
                                  <Input
                                    value={
                                      klarnaProvideInfo[requestIndex]
                                        ?.list_of_shipments?.[shipmentIndex]?.[
                                        field.key as keyof KlarnaShipmentData
                                      ] || ''
                                    }
                                    onChange={(e) =>
                                      handleKlarnaShipmentChange(
                                        requestIndex,
                                        shipmentIndex,
                                        field.key,
                                        e.target.value,
                                      )
                                    }
                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                    maxLength={field.maxLength}
                                    style={{ flex: 1 }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
            </div>
          ))}

          {/* Empty state when no form fields parsed */}
          {klarnaDisplayForm.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#999' }}>
              No requested fields available
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
