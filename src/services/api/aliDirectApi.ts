import { apiClient } from './apiClient';
import type { AliDirectRequest, AliDirectResponse } from '@/types/dashboard';

/**
 * Alipay Direct Settlement API
 */
export const aliDirectApi = {
  /**
   * Fetch Alipay Direct Settlement list
   */
  fetchAliDirect: async (
    params: AliDirectRequest,
    signal?: AbortSignal,
  ): Promise<AliDirectResponse> => {
    const response = await apiClient.post<AliDirectResponse>(
      '/tranx/ali_direct',
      params,
      { signal },
    );
    return response.data;
  },
};
