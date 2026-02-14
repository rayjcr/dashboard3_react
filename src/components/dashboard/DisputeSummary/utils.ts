/**
 * Shared utilities, constants and types for Dispute Summary components
 */

import type {
  DisputeNoteEvidence,
  DisputeSummaryTableRow,
} from '@/types/dashboard';
import { ACTION_BUTTON_VENDORS } from '@/types/dashboard';
import type { AfterPayFileInfo } from '@/services/api/disputeApi';

// ============ Constants ============

/** File upload constants */
export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
export const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB total

// ============ Types ============

/** PPCP Provide Information data structure */
export interface PPCPProvideInfoData {
  trackNum: string;
  carrierName: string;
  refId: string;
}

/** Afterpay Provide Information data structure */
export interface AfterpayProvideInfoData {
  productDescription: string;
  shippingAddress: string;
  shippingDate: string;
  shippingCarrier: string;
  shippingTrackingNumber: string;
  shippingDocument: AfterPayFileInfo | null;
  refundPolicyDisclosure: string;
  refundRefusalExplanation: string;
  refundPolicy: AfterPayFileInfo | null;
}

// ============ Utility Functions ============

/**
 * Determine whether to show Action button based on status and vendor
 */
export function shouldShowActionButton(
  status: string,
  vendor: string,
): boolean {
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
 * Get status tag color for display
 */
export function getStatusTagColor(status: string): string {
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
export function getStatusDisplayText(status: string): string {
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

/**
 * Check if should show Provide Information section
 */
export function shouldShowProvideInfo(
  record: DisputeSummaryTableRow | null,
): boolean {
  if (!record) return false;
  const allowedVendors = ['card', 'paze', 'afterpay', 'klarna'];
  return (
    record.status !== 'lost_waiting_for_refund' &&
    !!record.vendor &&
    allowedVendors.includes(record.vendor.toLowerCase())
  );
}

/**
 * Check if should show Proof of Fulfillment section
 */
export function shouldShowProofOfFulfillment(
  record: DisputeSummaryTableRow | null,
): boolean {
  if (!record) return false;
  const fulfillmentReasons = [
    'unauthorized',
    'merchandise or service not received',
  ];
  return fulfillmentReasons.includes(record.reason?.toLowerCase() || '');
}

/**
 * Check if should show Attachment Upload section
 */
export function shouldShowAttachmentUpload(
  record: DisputeSummaryTableRow | null,
): boolean {
  if (!record) return false;
  return record.status !== 'lost_waiting_for_refund';
}

/**
 * Check if vendor is Afterpay
 */
export function isAfterPayVendor(
  record: DisputeSummaryTableRow | null,
): boolean {
  if (!record) return false;
  return record.vendor?.toLowerCase() === 'afterpay';
}

/**
 * Check if vendor is Klarna
 */
export function isKlarnaVendor(record: DisputeSummaryTableRow | null): boolean {
  if (!record) return false;
  return record.vendor?.toLowerCase() === 'klarna';
}

/**
 * Parse evidence JSON string to evidence array
 */
export function parseEvidence(evidenceStr: string): DisputeNoteEvidence[] {
  try {
    if (!evidenceStr) return [];
    return JSON.parse(evidenceStr) as DisputeNoteEvidence[];
  } catch {
    return [];
  }
}

/**
 * Validate files before upload
 */
export function validateFiles(files: File[]): {
  valid: boolean;
  error?: string;
} {
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
}

/**
 * Get initial PPCP provide info data
 */
export function getInitialPPCPProvideInfo(): PPCPProvideInfoData {
  return {
    trackNum: '',
    carrierName: '',
    refId: '',
  };
}

/**
 * Get initial Afterpay provide info data
 */
export function getInitialAfterpayProvideInfo(): AfterpayProvideInfoData {
  return {
    productDescription: '',
    shippingAddress: '',
    shippingDate: '',
    shippingCarrier: '',
    shippingTrackingNumber: '',
    shippingDocument: null,
    refundPolicyDisclosure: '',
    refundRefusalExplanation: '',
    refundPolicy: null,
  };
}
