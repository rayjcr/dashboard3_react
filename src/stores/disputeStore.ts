import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { disputeApi } from '@/services/api/disputeApi';
import type {
  DisputeState,
  DisputeListRequest,
  DisputeType,
} from '@/types/dashboard';

// AbortController for dispute requests
let disputeAbortController: AbortController | null = null;

export const useDisputeStore = create<DisputeState>()(
  devtools(
    (set) => ({
      // Data
      disputeData: null,
      loading: false,
      error: null,

      // Loaded node tracking (for caching)
      loadedNodeId: null,

      // Pagination
      page: 0,
      pageSize: 10,

      // Search filters
      startDate: '',
      endDate: '',
      searchKey: '',
      disputeType: 'all',

      // Actions
      fetchDisputes: async (params: DisputeListRequest, nodeId?: string) => {
        // Cancel previous request if exists
        if (disputeAbortController) {
          disputeAbortController.abort();
        }
        disputeAbortController = new AbortController();

        set({ loading: true, error: null });
        try {
          const response = await disputeApi.fetchDisputeList(
            params,
            disputeAbortController.signal,
          );

          if (response.code !== 200) {
            throw new Error(response.message || 'Failed to fetch disputes');
          }

          set({
            disputeData: response,
            loading: false,
            error: null,
            loadedNodeId: nodeId || null,
          });
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'CanceledError') {
            return;
          }
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch disputes';
          set({
            loading: false,
            error: errorMessage,
          });
        }
      },

      setPage: (page: number) => {
        set({ page });
      },

      setPageSize: (pageSize: number) => {
        set({ pageSize, page: 0 });
      },

      setStartDate: (startDate: string) => {
        set({ startDate });
      },

      setEndDate: (endDate: string) => {
        set({ endDate });
      },

      setSearchKey: (searchKey: string) => {
        set({ searchKey });
      },

      setDisputeType: (disputeType: DisputeType) => {
        set({ disputeType });
      },

      clearDispute: () => {
        // Cancel pending request
        if (disputeAbortController) {
          disputeAbortController.abort();
          disputeAbortController = null;
        }

        set({
          disputeData: null,
          loading: false,
          error: null,
          loadedNodeId: null,
          page: 0,
          startDate: '',
          endDate: '',
          searchKey: '',
          disputeType: 'all',
        });
      },
    }),
    { name: 'DisputeStore' },
  ),
);

// Export function to cancel dispute requests and reset loading state
export const cancelDisputeRequests = () => {
  if (disputeAbortController) {
    disputeAbortController.abort();
    disputeAbortController = null;
    // Reset loading state when request is cancelled
    useDisputeStore.setState({ loading: false });
  }
};
