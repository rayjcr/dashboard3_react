import { apiClient } from './apiClient';
import type {
  TransactionLookupRequest,
  TransactionLookupResponse,
  RefundRequest,
  CaptureRequest,
  CancelRequest,
  TransactionActionResponse,
} from '@/types/dashboard';

/**
 * Download request parameter type
 */
export interface TransactionLookupDownloadRequest {
  merchantId: string;
  sessionId: string;
  rowCount: number;
  pageNumber: number;
  startDate: string;
  endDate: string;
  searchKey: string;
  hierarchy: number;
  selectedMid: number;
}

export const transactionLookupApi = {
  /**
   * Fetch transaction lookup list
   */
  fetchTransactions: async (
    params: TransactionLookupRequest,
    signal?: AbortSignal,
  ): Promise<TransactionLookupResponse> => {
    const response = await apiClient.post<TransactionLookupResponse>(
      '/transactions_lookup',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Download transaction data
   */
  downloadTransactions: async (
    params: TransactionLookupDownloadRequest,
    signal?: AbortSignal,
  ): Promise<TransactionLookupResponse> => {
    const response = await apiClient.post<TransactionLookupResponse>(
      '/download_records',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Refund operation
   */
  refund: async (
    params: RefundRequest,
    signal?: AbortSignal,
  ): Promise<TransactionActionResponse> => {
    const response = await apiClient.post<TransactionActionResponse>(
      '/transaction_action/refund',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Capture operation
   */
  capture: async (
    params: CaptureRequest,
    signal?: AbortSignal,
  ): Promise<TransactionActionResponse> => {
    const response = await apiClient.post<TransactionActionResponse>(
      '/transaction_action/capture',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Cancel operation
   */
  cancel: async (
    params: CancelRequest,
    signal?: AbortSignal,
  ): Promise<TransactionActionResponse> => {
    const response = await apiClient.post<TransactionActionResponse>(
      '/transaction_action/cancel',
      params,
      { signal },
    );
    return response.data;
  },
};
