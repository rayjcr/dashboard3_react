import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  allTransactionsApi,
  AllTransactionsSearchResponse,
} from '@/services/api/allTransactionsApi';

// AbortController for cancelling requests
let abortController: AbortController | null = null;

/**
 * Cancel any pending all transactions requests
 */
export const cancelAllTransactionsRequests = () => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
};

interface AllTransactionsState {
  // Data
  data: AllTransactionsSearchResponse | null;
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  pageSize: number;

  // Search
  searchKey: string;
  startDate: string;
  endDate: string;

  // Actions
  fetchTransactions: (
    sessionId: string,
    timezone: string,
    startDate: string,
    endDate: string,
    searchKey: string,
    page: number,
    pageSize: number,
  ) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchKey: (key: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  clearData: () => void;
}

export const useAllTransactionsStore = create<AllTransactionsState>()(
  devtools(
    (set) => ({
      // Initial state
      data: null,
      loading: false,
      error: null,
      page: 0,
      pageSize: 10,
      searchKey: '',
      startDate: '',
      endDate: '',

      // Actions
      fetchTransactions: async (
        sessionId: string,
        timezone: string,
        startDate: string,
        endDate: string,
        searchKey: string,
        page: number,
        pageSize: number,
      ) => {
        // Cancel any previous request
        cancelAllTransactionsRequests();
        abortController = new AbortController();

        set({ loading: true, error: null });

        try {
          const response = await allTransactionsApi.searchTransactions(
            {
              sessionId,
              rowCount: pageSize,
              pageNumber: page,
              startDate,
              endDate,
              searchKey,
              timezone,
              download: false,
            },
            abortController.signal,
          );

          set({
            data: response,
            loading: false,
            error: null,
            page,
            pageSize,
            searchKey,
            startDate,
            endDate,
          });
        } catch (error) {
          // Handle abort errors - don't update state if aborted
          if (error instanceof Error && error.name === 'CanceledError') {
            // Only reset loading if there's no new request pending
            // (abortController would be null if no new request started)
            if (!abortController) {
              set({ loading: false });
            }
            return;
          }
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to fetch transactions';
          set({ loading: false, error: errorMessage });
        }
      },

      setPage: (page: number) => {
        set({ page });
      },

      setPageSize: (pageSize: number) => {
        set({ pageSize, page: 0 });
      },

      setSearchKey: (key: string) => {
        set({ searchKey: key });
      },

      setDateRange: (startDate: string, endDate: string) => {
        set({ startDate, endDate });
      },

      clearData: () => {
        cancelAllTransactionsRequests();
        set({
          data: null,
          loading: false,
          error: null,
          page: 0,
          searchKey: '',
        });
      },
    }),
    { name: 'AllTransactionsStore' },
  ),
);
