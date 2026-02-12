import { apiClient } from './apiClient';
import type {
  DisputeListRequest,
  DisputeListResponse,
  DisputeDetailResponse,
} from '@/types/dashboard';

/**
 * Download CSV request parameters type
 */
export interface DisputeDownloadRequest {
  startDate: string;
  endDate: string;
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily_dispute';
  disputeType: string;
  page_number: string;
  row_count: number;
  download: 'csv';
}

/**
 * Download PDF request parameters type
 */
export interface DisputePDFDownloadRequest {
  startDate: string;
  endDate: string;
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily_dispute';
  disputeType: string;
  page_number: string;
  row_count: number;
  download: 'pdf';
}

/**
 * Single file info in upload file response
 */
export interface UploadedFileInfo {
  fileId: string;
  fileName: string;
  staticUrl: string;
}

/**
 * Upload file response
 */
export interface DisputeUploadResponse {
  code: number;
  data: UploadedFileInfo[];
}

/**
 * Submit evidence data structure
 */
export interface SubmitEvidenceData {
  carrier_name: string;
  tracking_number: string;
  refund_id: string;
  note: string;
}

/**
 * Submit evidence response
 */
export interface SubmitEvidenceResponse {
  code: number;
  message?: string;
}

/**
 * Update dispute status request data
 */
export interface UpdateDisputeData {
  note: string;
  evidence: string; // JSON string of uploaded files, or empty string
  case_id: string;
  status: string;
  from: string; // merchant_id
  session_id: string;
}

/**
 * Update dispute status response
 */
export interface UpdateDisputeResponse {
  code: number;
  message?: string;
}

/**
 * Afterpay file info structure
 */
export interface AfterPayFileInfo {
  id: string;
  url: string;
  urlExpiresAt: string;
  filename: string;
}

/**
 * Afterpay file upload response
 */
export interface AfterPayUploadResponse {
  code: number;
  message?: string;
  data: AfterPayFileInfo;
}

/**
 * Afterpay Evidence submit data structure
 */
export interface SubmitAfterPayEvidenceData {
  uncategorizedText: string; // actionNote
  productDescription: string;
  shippingAddress: string;
  shippingDate: string;
  shippingCarrier: string;
  shippingTrackingNumber: string;
  refundPolicyDisclosure: string;
  refundRefusalExplanation: string;
  uncategorizedFile?: string; // file id
  shippingDocumentation?: string; // file id
  refundPolicy?: string; // file id
}

/**
 * Afterpay submit evidence response
 */
export interface SubmitAfterPayEvidenceResponse {
  code: number;
  message?: string;
}

/**
 * Klarna Shipment data structure
 */
export interface KlarnaShipmentFields {
  capture_id?: string;
  is_shipping_company_contacted?: string;
  shipping_carrier?: string;
  shipping_date?: string;
  tracking_id?: string;
}

/**
 * Klarna requested fields structure
 */
export interface KlarnaRequestedFields {
  [key: string]: string | KlarnaShipmentFields[] | undefined;
  list_of_shipments?: KlarnaShipmentFields[];
}

/**
 * Klarna request item structure
/**
 * Klarna uploaded file info
 */
export interface KlarnaUploadedFileInfo {
  fileName: string;
  id: string;
}

/**
 * Klarna request item structure
 */
export interface KlarnaRequestItem {
  attachments?: KlarnaUploadedFileInfo[];
  comment: string;
  request_id: number;
  requested_fields: KlarnaRequestedFields;
}

/**
 * Klarna Evidence submit data structure
 */
export interface SubmitKlarnaEvidenceData {
  case_id: string;
  status: string;
  from: string; // merchant_id
  session_id: string;
  requests: KlarnaRequestItem[];
}

/**
 * Klarna submit evidence response
 */
export interface SubmitKlarnaEvidenceResponse {
  code: number;
  message?: string;
}

/**
 * Klarna file upload response
 */
export interface KlarnaUploadResponse {
  code: number;
  message?: string;
  data: KlarnaUploadedFileInfo[];
}

export const disputeApi = {
  /**
   * Fetch dispute list
   */
  async fetchDisputeList(
    params: DisputeListRequest,
    signal?: AbortSignal,
  ): Promise<DisputeListResponse> {
    const response = await apiClient.post<DisputeListResponse>(
      '/dispute/list',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Download dispute data as CSV
   */
  async downloadDisputes(
    params: DisputeDownloadRequest,
    signal?: AbortSignal,
  ): Promise<DisputeListResponse> {
    const response = await apiClient.post<DisputeListResponse>(
      '/dispute/list',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Download dispute data as PDF (returns blob data)
   */
  async downloadDisputesPDF(
    params: DisputePDFDownloadRequest,
    signal?: AbortSignal,
  ): Promise<Blob> {
    const response = await apiClient.post<Blob>('/dispute/list', params, {
      signal,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Get dispute detail by case ID
   */
  async getDisputeDetail(
    caseId: string,
    signal?: AbortSignal,
  ): Promise<DisputeDetailResponse> {
    const response = await apiClient.get<DisputeDetailResponse>(
      `/dispute/${caseId}`,
      { signal },
    );
    return response.data;
  },

  /**
   * Upload files for a dispute case
   * @param id - The dispute record ID (not case_id)
   * @param files - Array of files to upload
   * @param signal - Optional abort signal
   * @returns Upload response with file info
   */
  async uploadDisputeFiles(
    id: number,
    files: File[],
    signal?: AbortSignal,
  ): Promise<DisputeUploadResponse> {
    const formData = new FormData();
    // Use data1, data2, data3... as parameter names
    files.forEach((file, index) => {
      formData.append(`data${index + 1}`, file);
    });

    const response = await apiClient.put<DisputeUploadResponse>(
      `/dispute/resource/${id}`,
      formData,
      {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  /**
   * Submit dispute evidence
   * @param caseId - The dispute case ID (not record id)
   * @param files - Array of files to submit
   * @param data - Evidence data (carrier_name, tracking_number, refund_id, note)
   * @param signal - Optional abort signal
   * @returns Submit response
   */
  async submitEvidence(
    caseId: string,
    files: File[],
    data: SubmitEvidenceData,
    signal?: AbortSignal,
  ): Promise<SubmitEvidenceResponse> {
    const formData = new FormData();

    // Add files as file0, file1, file2...
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    // Add data as JSON string
    formData.append('data', JSON.stringify(data));

    const response = await apiClient.post<SubmitEvidenceResponse>(
      `/dispute/${caseId}/ppcp/evidence`,
      formData,
      {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  /**
   * Update dispute status after evidence submission
   * @param caseId - The dispute case ID (case_id, not record id)
   * @param data - Update data
   * @param signal - Optional abort signal
   * @returns Update response
   */
  async updateDispute(
    caseId: string,
    data: UpdateDisputeData,
    signal?: AbortSignal,
  ): Promise<UpdateDisputeResponse> {
    const response = await apiClient.put<UpdateDisputeResponse>(
      `/dispute/${caseId}`,
      data,
      { signal },
    );
    return response.data;
  },

  /**
   * Submit afterpay evidence
   * @param caseId - The dispute case ID (not record id)
   * @param evidenceData - Afterpay evidence data
   * @param sessionId - Session ID
   * @param signal - Optional abort signal
   * @returns Submit response
   */
  async submitAfterPayEvidence(
    caseId: string,
    evidenceData: SubmitAfterPayEvidenceData,
    sessionId: string,
    signal?: AbortSignal,
  ): Promise<SubmitAfterPayEvidenceResponse> {
    const payload = {
      evidence: evidenceData,
      session_id: sessionId,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    const response = await apiClient.post<SubmitAfterPayEvidenceResponse>(
      `/dispute/${caseId}/afterpay/evidence`,
      formData,
      {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  /**
   * Upload files for afterpay dispute
   * @param caseId - The dispute case ID (not record id)
   * @param file - File to upload
   * @param signal - Optional abort signal
   * @returns Upload response with file info
   */
  async uploadAfterPayFile(
    caseId: string,
    file: File,
    signal?: AbortSignal,
  ): Promise<AfterPayUploadResponse> {
    const formData = new FormData();
    formData.append('data1', file);

    const response = await apiClient.post<AfterPayUploadResponse>(
      `/dispute/${caseId}/afterpay/file`,
      formData,
      {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  /**
   * Submit Klarna evidence
   * @param caseId - The dispute case ID (not record id)
   * @param data - Klarna evidence data
   * @param signal - Optional abort signal
   * @returns Submit response
   */
  async submitKlarnaEvidence(
    caseId: string,
    data: SubmitKlarnaEvidenceData,
    signal?: AbortSignal,
  ): Promise<SubmitKlarnaEvidenceResponse> {
    const response = await apiClient.put<SubmitKlarnaEvidenceResponse>(
      `/dispute/${caseId}`,
      data,
      { signal },
    );
    return response.data;
  },

  /**
   * Upload files for Klarna dispute
   * @param caseId - The dispute case ID (not record id)
   * @param files - Files to upload
   * @param signal - Optional abort signal
   * @returns Upload response with file info array
   */
  async uploadKlarnaFiles(
    caseId: string,
    files: File[],
    signal?: AbortSignal,
  ): Promise<KlarnaUploadResponse> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`data${index + 1}`, file);
    });

    const response = await apiClient.post<KlarnaUploadResponse>(
      `/dispute/${caseId}/klarna/file`,
      formData,
      {
        signal,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};
