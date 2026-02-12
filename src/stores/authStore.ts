import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authApi } from '@/services/api/authApi';
import type { AuthState, LoginCredentials } from '@/types/auth';

const AUTH_STORAGE_KEY = 'auth-storage';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // User info
        user: null,
        token: null,
        sessionId: null,

        // Hierarchy/Merchant info
        hierarchyId: null,
        hierarchyName: null,
        merchantId: null,
        merchantName: null,
        merchants: [],
        hierarchyTree: [],

        // Permissions
        adminPermissions: '',
        canRefund: false,

        // MFA
        mfaEnabled: false,
        config: '',

        // Currency & Timezone
        settlementCurrencies: [],
        timezone: '',
        timezoneShort: '',

        // UI State
        isLoading: false,
        error: null,
        currentEmail: '',

        // Actions
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authApi.login(credentials);

            // Check response code
            if (response.code !== 200) {
              throw new Error(response.message || 'Login failed');
            }

            set({
              user: {
                id: response.user_id,
                email: response.user_email,
                role: response.role,
                sessionId: response.session_id,
              },
              token: response.session_id, // Use session_id as token since token is null
              sessionId: response.session_id,
              hierarchyId: response.hierarchy,
              hierarchyName: response.hierarchyName,
              merchantId: response.merchant_id || null,
              merchantName: response.merchant_name,
              merchants: response.merchants,
              hierarchyTree: response.child,
              adminPermissions: response.adminPermissions,
              canRefund: response.can_refund === 1,
              mfaEnabled: response.MFA,
              config: response.config,
              settlementCurrencies: response.settlement_currencys,
              timezone: response.timezone,
              timezoneShort: response.timezone_short,
              currentEmail: response.user_email,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Login failed';
            set({ isLoading: false, error: errorMessage });
            throw error;
          }
        },

        logout: () => {
          // Clear all sensitive data
          set({
            user: null,
            token: null,
            sessionId: null,
            hierarchyId: null,
            hierarchyName: null,
            merchantId: null,
            merchantName: null,
            merchants: [],
            hierarchyTree: [],
            adminPermissions: '',
            canRefund: false,
            mfaEnabled: false,
            config: '',
            settlementCurrencies: [],
            timezone: '',
            timezoneShort: '',
            currentEmail: '',
            isLoading: false,
            error: null,
          });
          // Clear localStorage
          localStorage.removeItem(AUTH_STORAGE_KEY);
          // Redirect to login page
          // Note: Using window.location.href intentionally to force full page reload
          // and clear all client-side state. Store cannot use React Hooks like useNavigate.
          window.location.href = '/login';
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: AUTH_STORAGE_KEY,
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          sessionId: state.sessionId,
          hierarchyId: state.hierarchyId,
          hierarchyName: state.hierarchyName,
          merchantId: state.merchantId,
          merchantName: state.merchantName,
          merchants: state.merchants,
          hierarchyTree: state.hierarchyTree,
          adminPermissions: state.adminPermissions,
          canRefund: state.canRefund,
          mfaEnabled: state.mfaEnabled,
          config: state.config,
          settlementCurrencies: state.settlementCurrencies,
          timezone: state.timezone,
          timezoneShort: state.timezoneShort,
          currentEmail: state.currentEmail,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);

// Multi-tab synchronization: Listen for storage changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === AUTH_STORAGE_KEY) {
      if (event.newValue === null) {
        // Token was removed in another tab, logout this tab too
        useAuthStore.setState({
          user: null,
          token: null,
          sessionId: null,
          hierarchyId: null,
          hierarchyName: null,
          merchantId: null,
          merchantName: null,
          merchants: [],
          hierarchyTree: [],
          adminPermissions: '',
          canRefund: false,
          mfaEnabled: false,
          config: '',
          settlementCurrencies: [],
          timezone: '',
          timezoneShort: '',
          currentEmail: '',
          isLoading: false,
          error: null,
        });
        // Note: Using window.location.href intentionally to force full page reload
        // when auth state is cleared in another tab. Store cannot use React Hooks.
        window.location.href = '/login';
      } else {
        // State was updated in another tab, sync this tab
        try {
          const newState = JSON.parse(event.newValue);
          if (newState?.state) {
            useAuthStore.setState(newState.state);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  });
}
