import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { reserveSummaryApi } from '@/services/api/reserveSummaryApi';
import type {
  ReserveSummaryState,
  ReserveSummaryRequest,
} from '@/types/dashboard';

// AbortController for reserve summary requests
let reserveSummaryAbortController: AbortController | null = null;

export const useReserveSummaryStore = create<ReserveSummaryState>()(
  devtools(
    (set) => ({
      // Data
      reserveSummaryData: null,
      loading: false,
      error: null,
      currency: 'USD',

      // Pagination
      page: 0,
      pageSize: 10,

      // Actions
      fetchReserveSummary: async (params: ReserveSummaryRequest) => {
        // Cancel previous request if exists
        if (reserveSummaryAbortController) {
          reserveSummaryAbortController.abort();
        }
        reserveSummaryAbortController = new AbortController();

        set({ loading: true, error: null });
        try {
          const response = await reserveSummaryApi.fetchReserveSummary(
            params,
            reserveSummaryAbortController.signal,
          );

          if (response.code !== 200) {
            throw new Error('Failed to fetch Reserve Summary data');
          }

          set({
            reserveSummaryData: response,
            currency: response.merchant_info?.currency || 'USD',
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
              : 'Failed to fetch Reserve Summary data';
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

      clearReserveSummary: () => {
        // Cancel pending request
        if (reserveSummaryAbortController) {
          reserveSummaryAbortController.abort();
          reserveSummaryAbortController = null;
        }

        set({
          reserveSummaryData: null,
          loading: false,
          error: null,
          currency: 'USD',
          page: 0,
          pageSize: 10,
        });
      },
    }),
    { name: 'ReserveSummaryStore' },
  ),
);

// Export function to cancel reserve summary requests and reset loading state
export const cancelReserveSummaryRequests = () => {
  if (reserveSummaryAbortController) {
    reserveSummaryAbortController.abort();
    reserveSummaryAbortController = null;
    // Reset loading state when request is cancelled
    useReserveSummaryStore.setState({ loading: false });
  }
};
