import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { transactionLookupApi } from '@/services/api/transactionLookupApi';
import type {
  TransactionLookupState,
  TransactionLookupRequest,
} from '@/types/dashboard';
import { getDefaultVisibleColumns } from '@/types/dashboard';

// Local storage key
const COLUMN_CONFIG_STORAGE_KEY = 'transaction_lookup_column_config';

// AbortController for transaction lookup requests
let transactionAbortController: AbortController | null = null;

// Load column config from local storage
const loadColumnConfigFromStorage = (): Record<string, string[]> => {
  try {
    const stored = localStorage.getItem(COLUMN_CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load column config from storage:', e);
  }
  return {};
};

// Save column config to local storage
const saveColumnConfigToStorage = (config: Record<string, string[]>) => {
  try {
    localStorage.setItem(COLUMN_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save column config to storage:', e);
  }
};

export const useTransactionLookupStore = create<TransactionLookupState>()(
  devtools(
    (set, get) => ({
      // Data
      transactionData: null,
      loading: false,
      error: null,

      // Pagination
      page: 0,
      pageSize: 10,

      // Search filters
      startDate: '',
      endDate: '',
      searchKey: '',

      // Column visibility config (keyed by merchantId)
      columnConfig: loadColumnConfigFromStorage(),

      // Actions
      fetchTransactions: async (params: TransactionLookupRequest) => {
        // Cancel previous request if exists
        if (transactionAbortController) {
          transactionAbortController.abort();
        }
        transactionAbortController = new AbortController();

        set({ loading: true, error: null });
        try {
          const response = await transactionLookupApi.fetchTransactions(
            params,
            transactionAbortController.signal,
          );

          set({
            transactionData: response,
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
              : 'Failed to fetch transactions';
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

      setColumnConfig: (merchantId: string, visibleColumns: string[]) => {
        const currentConfig = get().columnConfig;
        const newConfig = {
          ...currentConfig,
          [merchantId]: visibleColumns,
        };
        set({ columnConfig: newConfig });
        saveColumnConfigToStorage(newConfig);
      },

      getVisibleColumns: (merchantId: string) => {
        const config = get().columnConfig;
        return config[merchantId] || getDefaultVisibleColumns();
      },

      clearTransactionLookup: () => {
        // Cancel pending request
        if (transactionAbortController) {
          transactionAbortController.abort();
          transactionAbortController = null;
        }

        set({
          transactionData: null,
          loading: false,
          error: null,
          page: 0,
          startDate: '',
          endDate: '',
          searchKey: '',
        });
      },
    }),
    { name: 'TransactionLookupStore' },
  ),
);

// Export function to cancel transaction lookup requests and reset loading state
export const cancelTransactionLookupRequests = () => {
  if (transactionAbortController) {
    transactionAbortController.abort();
    transactionAbortController = null;
    // Reset loading state when request is cancelled
    useTransactionLookupStore.setState({ loading: false });
  }
};
