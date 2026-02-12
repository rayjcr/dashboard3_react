import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

// Mock the authApi module
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
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
  });

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('should have null token initially', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('should not be loading initially', () => {
      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      const { error } = useAuthStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('Login', () => {
    it('TC-STORE-001-01: should update state on successful login', async () => {
      const { authApi } = await import('@/services/api/authApi');
      vi.mocked(authApi.login).mockResolvedValueOnce({
        code: 200,
        message: 'Success',
        user_id: '12345',
        user_email: 'test@example.com',
        role: 'merchant',
        session_id: 'session_123',
        hierarchy: 'H001',
        hierarchyName: 'Test Hierarchy',
        merchant_id: 'M001',
        merchant_name: 'Test Merchant',
        merchants: [{ id: 'M001', name: 'Test Merchant' }],
        child: [],
        adminPermissions: 'full',
        can_refund: 1,
        MFA: false,
        config: '{}',
        settlement_currencys: ['USD'],
        timezone: 'America/Los_Angeles',
        timezone_short: 'PST',
      });

      const { login } = useAuthStore.getState();

      await login({ email: 'test@example.com', password: 'password123' });

      const state = useAuthStore.getState();
      expect(state.user).toEqual({
        id: '12345',
        email: 'test@example.com',
        role: 'merchant',
        sessionId: 'session_123',
      });
      expect(state.sessionId).toBe('session_123');
      expect(state.token).toBe('session_123');
      expect(state.canRefund).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('TC-STORE-001-02: should set error on failed login', async () => {
      const { authApi } = await import('@/services/api/authApi');
      vi.mocked(authApi.login).mockRejectedValueOnce(
        new Error('Invalid credentials'),
      );

      const { login } = useAuthStore.getState();

      await expect(
        login({ email: 'wrong@example.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.error).toBe('Invalid credentials');
      expect(state.isLoading).toBe(false);
    });

    it('should set isLoading to true during login', async () => {
      const { authApi } = await import('@/services/api/authApi');

      // Create a promise that we can control
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      vi.mocked(authApi.login).mockReturnValueOnce(loginPromise as never);

      const { login } = useAuthStore.getState();
      const loginCall = login({
        email: 'test@example.com',
        password: 'password123',
      });

      // Check loading state immediately
      expect(useAuthStore.getState().isLoading).toBe(true);

      // Resolve the promise
      resolveLogin!({
        code: 200,
        user_id: '1',
        user_email: 'test@example.com',
        session_id: 'session',
        MFA: false,
      });

      await loginCall;

      // Check loading is false after completion
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('TC-STORE-001-03: should clear all state on logout', () => {
      // First set some state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', role: 'merchant' },
        token: 'token123',
        sessionId: 'session123',
        merchantId: 'M001',
        canRefund: true,
      });

      // Mock window.location.href
      const originalLocation = window.location;
      // @ts-expect-error Testing mock
      delete window.location;
      window.location = { ...originalLocation, href: '' };

      const { logout } = useAuthStore.getState();
      logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.sessionId).toBeNull();
      expect(state.merchantId).toBeNull();
      expect(state.canRefund).toBe(false);

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error message' });

      const { clearError } = useAuthStore.getState();
      clearError();

      const { error } = useAuthStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('State selectors', () => {
    it('should properly return canRefund', () => {
      useAuthStore.setState({ canRefund: true });
      expect(useAuthStore.getState().canRefund).toBe(true);

      useAuthStore.setState({ canRefund: false });
      expect(useAuthStore.getState().canRefund).toBe(false);
    });

    it('should properly return mfaEnabled', () => {
      useAuthStore.setState({ mfaEnabled: true });
      expect(useAuthStore.getState().mfaEnabled).toBe(true);

      useAuthStore.setState({ mfaEnabled: false });
      expect(useAuthStore.getState().mfaEnabled).toBe(false);
    });
  });
});
