import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { multiFundingsApi } from '@/services/api/multiFundingsApi';
import type {
  MultiFundingsState,
  MultiFundingsRequest,
} from '@/types/dashboard';

// AbortController for multi fundings requests
let multiFundingsAbortController: AbortController | null = null;

export const useMultiFundingsStore = create<MultiFundingsState>()(
  devtools(
    (set) => ({
      // Data
      multiFundingsData: null,
      loading: false,
      error: null,

      // Pagination
      page: 0,
      pageSize: 10,

      // Actions
      fetchMultiFundings: async (params: MultiFundingsRequest) => {
        // Cancel previous request if exists
        if (multiFundingsAbortController) {
          multiFundingsAbortController.abort();
        }
        multiFundingsAbortController = new AbortController();

        set({ loading: true, error: null });
        try {
          const response = await multiFundingsApi.fetchMultiFundings(
            params,
            multiFundingsAbortController.signal,
          );

          if (response.code !== '200') {
            throw new Error('Failed to fetch Multi Fundings data');
          }

          set({
            multiFundingsData: response,
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
              : 'Failed to fetch Multi Fundings data';
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

      clearMultiFundings: () => {
        // Cancel pending request
        if (multiFundingsAbortController) {
          multiFundingsAbortController.abort();
          multiFundingsAbortController = null;
        }

        set({
          multiFundingsData: null,
          loading: false,
          error: null,
          page: 0,
          pageSize: 10,
        });
      },
    }),
    { name: 'MultiFundingsStore' },
  ),
);

// Export function to cancel multi fundings requests and reset loading state
export const cancelMultiFundingsRequests = () => {
  if (multiFundingsAbortController) {
    multiFundingsAbortController.abort();
    multiFundingsAbortController = null;
    // Reset loading state when request is cancelled
    useMultiFundingsStore.setState({ loading: false });
  }
};
