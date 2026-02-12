import { apiClient } from './apiClient';
import type {
  MultiFundingsRequest,
  MultiFundingsResponse,
} from '@/types/dashboard';

export const multiFundingsApi = {
  /**
   * Fetch Multi Fundings data
   */
  fetchMultiFundings: async (
    params: MultiFundingsRequest,
    signal?: AbortSignal,
  ): Promise<MultiFundingsResponse> => {
    const response = await apiClient.post<MultiFundingsResponse>(
      '/tranx/multi_fundings',
      params,
      { signal },
    );
    return response.data;
  },
};
