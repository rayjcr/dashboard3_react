import { apiClient } from './apiClient';
import type { MultilayerResponse } from '@/types/hierarchy';

export const hierarchyApi = {
  /**
   * Fetch children nodes for a given parent node
   * @param parentId - Parent node ID
   * @param sessionId - Current session ID
   * @returns MultilayerResponse with children data
   */
  async fetchMultilayer(
    parentId: number,
    sessionId: string,
  ): Promise<MultilayerResponse> {
    const response = await apiClient.post<MultilayerResponse>('/multilayer', {
      parent_id: parentId,
      session_id: sessionId,
    });
    return response.data;
  },
};
