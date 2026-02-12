import { apiClient } from './apiClient';
import type {
  SummaryRequest,
  SummaryResponse,
  DailyDetailReportRequest,
  DailyDetailReportResponse,
  MonthlyDetailReportRequest,
} from '@/types/dashboard';

/**
 * Download request parameters type (row_count is 'all')
 */
export interface SummaryDownloadRequest {
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily' | 'monthly' | 'daily_settle';
  date_month: string;
  page_number: string;
  row_count: 'all';
}

/**
 * PDF download request parameters type
 */
export interface SummaryPDFDownloadRequest {
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily' | 'monthly' | 'daily_settle';
  date_month: string;
  page_number: string;
  row_count: 'all';
  method: 'pdf';
}

export const summaryApi = {
  /**
   * Fetch summary data (daily, monthly, settle, reserve)
   */
  async fetchSummary(
    params: SummaryRequest,
    signal?: AbortSignal,
  ): Promise<SummaryResponse> {
    const response = await apiClient.post<SummaryResponse>(
      '/tranx/summary',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Download summary data (returns all records)
   */
  async downloadSummary(
    params: SummaryDownloadRequest,
    signal?: AbortSignal,
  ): Promise<SummaryResponse> {
    const response = await apiClient.post<SummaryResponse>(
      '/tranx/summary',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Download summary as PDF (returns blob data)
   */
  async downloadSummaryPDF(
    params: SummaryPDFDownloadRequest,
    signal?: AbortSignal,
  ): Promise<Blob> {
    const response = await apiClient.post<Blob>('/tranx/summary', params, {
      signal,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Fetch daily detail report
   */
  async fetchDailyDetailReport(
    params: DailyDetailReportRequest,
    signal?: AbortSignal,
  ): Promise<DailyDetailReportResponse> {
    const response = await apiClient.post<DailyDetailReportResponse>(
      '/detail_daily_report',
      params,
      { signal },
    );
    return response.data;
  },

  /**
   * Fetch monthly detail report
   */
  async fetchMonthlyDetailReport(
    params: MonthlyDetailReportRequest,
    signal?: AbortSignal,
  ): Promise<DailyDetailReportResponse> {
    const response = await apiClient.post<DailyDetailReportResponse>(
      '/detail_month_report',
      params,
      { signal },
    );
    return response.data;
  },
};
