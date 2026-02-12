import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { summaryApi } from '@/services/api/summaryApi';
import type {
  DashboardState,
  SummaryRequest,
  SummaryResponse,
  NodeSharedInfo,
} from '@/types/dashboard';
import { DEFAULT_NODE_SHARED_INFO } from '@/types/dashboard';

// AbortController instances for each request type
let dailyAbortController: AbortController | null = null;
let monthlyAbortController: AbortController | null = null;
let dailySettleAbortController: AbortController | null = null;

// Helper function to extract node shared info from response
const extractNodeSharedInfo = (response: SummaryResponse): NodeSharedInfo => ({
  disputeManage: response.disputeManage ?? false,
  gateway: response.gateway ?? '',
  hasDisputeChild: response.hasDisputeChild ?? false,
  hasElavonChild: response.hasElavonChild ?? false,
  hasItemizedFee: response.hasItemizedFee ?? false,
  hasJkoPay: response.hasJkoPay ?? false,
  hasPreAuth: response.hasPreAuth ?? false,
  hasReserve: response.hasReserve ?? false,
  hasUPI: response.hasUPI ?? false,
  umfEnabled: response.umfEnabled ?? false,
});

const DASHBOARD_STORAGE_KEY = 'dashboard-storage';

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        // Daily Summary
        dailySummary: null,
        dailySummaryLoading: false,
        dailySummaryError: null,
        dailyPage: 0,
        dailyPageSize: 10,

        // Monthly Summary
        monthlySummary: null,
        monthlySummaryLoading: false,
        monthlySummaryError: null,
        monthlyPage: 0,
        monthlyPageSize: 10,

        // Daily Settle Summary
        dailySettleSummary: null,
        dailySettleSummaryLoading: false,
        dailySettleSummaryError: null,
        dailySettlePage: 0,
        dailySettlePageSize: 10,

        // Node shared info (persisted)
        nodeSharedInfo: DEFAULT_NODE_SHARED_INFO,

        // Actions
        fetchDailySummary: async (
          params: Omit<SummaryRequest, 'search_type'>,
        ) => {
          // Cancel previous request if exists
          if (dailyAbortController) {
            dailyAbortController.abort();
          }
          dailyAbortController = new AbortController();

          set({ dailySummaryLoading: true, dailySummaryError: null });
          try {
            const response = await summaryApi.fetchSummary(
              {
                ...params,
                search_type: 'daily',
              },
              dailyAbortController.signal,
            );

            if (response.code !== 200) {
              throw new Error(
                response.message || 'Failed to fetch daily summary',
              );
            }

            set({
              dailySummary: response,
              dailySummaryLoading: false,
              dailySummaryError: null,
              // Update node shared info
              nodeSharedInfo: extractNodeSharedInfo(response),
            });
          } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'CanceledError') {
              return;
            }
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch daily summary';
            set({
              dailySummaryLoading: false,
              dailySummaryError: errorMessage,
            });
          }
        },

        fetchMonthlySummary: async (
          params: Omit<SummaryRequest, 'search_type'>,
        ) => {
          // Cancel previous request if exists
          if (monthlyAbortController) {
            monthlyAbortController.abort();
          }
          monthlyAbortController = new AbortController();

          set({ monthlySummaryLoading: true, monthlySummaryError: null });
          try {
            const response = await summaryApi.fetchSummary(
              {
                ...params,
                search_type: 'monthly',
              },
              monthlyAbortController.signal,
            );

            if (response.code !== 200) {
              throw new Error(
                response.message || 'Failed to fetch monthly summary',
              );
            }

            set({
              monthlySummary: response,
              monthlySummaryLoading: false,
              monthlySummaryError: null,
              // Update node shared info
              nodeSharedInfo: extractNodeSharedInfo(response),
            });
          } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'CanceledError') {
              return;
            }
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch monthly summary';
            set({
              monthlySummaryLoading: false,
              monthlySummaryError: errorMessage,
            });
          }
        },

        fetchDailySettleSummary: async (
          params: Omit<SummaryRequest, 'search_type'>,
        ) => {
          // Cancel previous request if exists
          if (dailySettleAbortController) {
            dailySettleAbortController.abort();
          }
          dailySettleAbortController = new AbortController();

          set({
            dailySettleSummaryLoading: true,
            dailySettleSummaryError: null,
          });
          try {
            const response = await summaryApi.fetchSummary(
              {
                ...params,
                search_type: 'daily_settle',
              },
              dailySettleAbortController.signal,
            );

            if (response.code !== 200) {
              throw new Error(
                response.message || 'Failed to fetch daily settle summary',
              );
            }

            set({
              dailySettleSummary: response,
              dailySettleSummaryLoading: false,
              dailySettleSummaryError: null,
              // Update node shared info
              nodeSharedInfo: extractNodeSharedInfo(response),
            });
          } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'CanceledError') {
              return;
            }
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch daily settle summary';
            set({
              dailySettleSummaryLoading: false,
              dailySettleSummaryError: errorMessage,
            });
          }
        },

        setDailyPage: (page: number) => {
          set({ dailyPage: page });
        },

        setDailyPageSize: (pageSize: number) => {
          set({ dailyPageSize: pageSize, dailyPage: 0 });
        },

        setMonthlyPage: (page: number) => {
          set({ monthlyPage: page });
        },

        setMonthlyPageSize: (pageSize: number) => {
          set({ monthlyPageSize: pageSize, monthlyPage: 0 });
        },

        setDailySettlePage: (page: number) => {
          set({ dailySettlePage: page });
        },

        setDailySettlePageSize: (pageSize: number) => {
          set({ dailySettlePageSize: pageSize, dailySettlePage: 0 });
        },

        updateNodeSharedInfo: (info: Partial<NodeSharedInfo>) => {
          set((state) => ({
            nodeSharedInfo: { ...state.nodeSharedInfo, ...info },
          }));
        },

        clearDashboard: () => {
          // Cancel all pending requests
          if (dailyAbortController) {
            dailyAbortController.abort();
            dailyAbortController = null;
          }
          if (monthlyAbortController) {
            monthlyAbortController.abort();
            monthlyAbortController = null;
          }
          if (dailySettleAbortController) {
            dailySettleAbortController.abort();
            dailySettleAbortController = null;
          }

          set({
            dailySummary: null,
            dailySummaryLoading: false,
            dailySummaryError: null,
            dailyPage: 0,
            monthlySummary: null,
            monthlySummaryLoading: false,
            monthlySummaryError: null,
            monthlyPage: 0,
            dailySettleSummary: null,
            dailySettleSummaryLoading: false,
            dailySettleSummaryError: null,
            dailySettlePage: 0,
            // Reset node shared info when clearing dashboard
            nodeSharedInfo: DEFAULT_NODE_SHARED_INFO,
          });
        },
      }),
      {
        name: DASHBOARD_STORAGE_KEY,
        // Only persist nodeSharedInfo
        partialize: (state) => ({
          nodeSharedInfo: state.nodeSharedInfo,
        }),
      },
    ),
    { name: 'DashboardStore' },
  ),
);

// Export function to cancel all pending requests and reset loading states (for use in tab switch)
export const cancelAllDashboardRequests = () => {
  let needsReset = false;

  if (dailyAbortController) {
    dailyAbortController.abort();
    dailyAbortController = null;
    needsReset = true;
  }
  if (monthlyAbortController) {
    monthlyAbortController.abort();
    monthlyAbortController = null;
    needsReset = true;
  }
  if (dailySettleAbortController) {
    dailySettleAbortController.abort();
    dailySettleAbortController = null;
    needsReset = true;
  }

  // Reset loading states when requests are cancelled
  if (needsReset) {
    useDashboardStore.setState({
      dailySummaryLoading: false,
      monthlySummaryLoading: false,
      dailySettleSummaryLoading: false,
    });
  }
};
