import { apiClient } from './apiClient';
import type {
  ReserveSummaryRequest,
  ReserveSummaryResponse,
} from '@/types/dashboard';

export const reserveSummaryApi = {
  /**
   * Fetch reserve summary data
   */
  async fetchReserveSummary(
    params: ReserveSummaryRequest,
    signal?: AbortSignal,
  ): Promise<ReserveSummaryResponse> {
    const response = await apiClient.post<ReserveSummaryResponse>(
      '/tranx/summary',
      params,
      { signal },
    );
    return response.data;
  },
};
