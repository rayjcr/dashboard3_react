import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { aliDirectApi } from '@/services/api/aliDirectApi';
import type { AliDirectState, AliDirectRequest } from '@/types/dashboard';

// AbortController for aliDirect requests
let aliDirectAbortController: AbortController | null = null;

export const useAliDirectStore = create<AliDirectState>()(
  devtools(
    (set) => ({
      // Data
      aliDirectData: null,
      loading: false,
      error: null,

      // Pagination
      page: 0,
      pageSize: 10,

      // Search filters
      startDate: '',
      endDate: '',

      // Actions
      fetchAliDirect: async (params: AliDirectRequest) => {
        // Cancel previous request if exists
        if (aliDirectAbortController) {
          aliDirectAbortController.abort();
        }
        aliDirectAbortController = new AbortController();

        set({ loading: true, error: null });
        try {
          const response = await aliDirectApi.fetchAliDirect(
            params,
            aliDirectAbortController.signal,
          );

          if (response.code !== '200') {
            throw new Error('Failed to fetch Alipay Direct data');
          }

          set({
            aliDirectData: response,
            loading: false,
            error: null,
          });
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'CanceledError') {
            return;
          }
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch Alipay Direct data';
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

      clearAliDirect: () => {
        // Cancel pending request
        if (aliDirectAbortController) {
          aliDirectAbortController.abort();
          aliDirectAbortController = null;
        }

        set({
          aliDirectData: null,
          loading: false,
          error: null,
          page: 0,
          pageSize: 10,
          startDate: '',
          endDate: '',
        });
      },
    }),
    { name: 'AliDirectStore' },
  ),
);

// Export function to cancel aliDirect requests and reset loading state
export const cancelAliDirectRequests = () => {
  if (aliDirectAbortController) {
    aliDirectAbortController.abort();
    aliDirectAbortController = null;
    // Reset loading state when request is cancelled
    useAliDirectStore.setState({ loading: false });
  }
};
