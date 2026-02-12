import { apiClient } from './apiClient';

/**
 * All Transactions Search request parameters type
 */
export interface AllTransactionsSearchRequest {
  sessionId: string;
  rowCount: number;
  pageNumber: number;
  startDate: string;
  endDate: string;
  searchKey: string;
  timezone: string;
  download: boolean;
}

/**
 * Single transaction record type
 */
export interface TransactionRecord {
  store_name: string;
  location: string;
  merchant_name: string;
  merchant_defined_code: string | null;
  merchant_id: string;
  reference2: string;
  currency: string;
  transaction_type: string;
  merchant_db: string;
  mttimezone: string;
  time_created: string;
  payment_method: string;
  buyer_id: string;
  method_trans_id: string;
  total: number;
  auth_amount: number;
  auth_currency: string;
  merchant_discount: string;
  merchant_fixed: string;
  net: number;
  sales: number;
  amount_captured: string;
  tip: string;
  login_code: string;
  transaction_tag: string;
  terminal_id: string;
  source: string | null;
  tranx_status: string;
  original_merchant_name_english: string;
  extral_reference: string;
  reference1: string | null;
  reference: string;
  transaction_id: string;
  parent_transaction_id: string | null;
}

/**
 * All Transactions Search response type
 */
export interface AllTransactionsSearchResponse {
  totalRecords: number;
  transactions: TransactionRecord[];
}

export const allTransactionsApi = {
  /**
   * Search all transactions
   */
  async searchTransactions(
    params: AllTransactionsSearchRequest,
    signal?: AbortSignal,
  ): Promise<AllTransactionsSearchResponse> {
    const response = await apiClient.post<AllTransactionsSearchResponse>(
      '/all_transactions_search',
      params,
      { signal },
    );
    return response.data;
  },
};
