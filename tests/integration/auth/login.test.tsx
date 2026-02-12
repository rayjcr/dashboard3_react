import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp, ConfigProvider } from 'antd';
import { useAuthStore } from '@/stores/authStore';

// Mock the authApi module
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

// Create a test wrapper component
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AntApp>
          <BrowserRouter>{children}</BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

// Simple mock login form for testing
const MockLoginForm = () => {
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit" disabled={isLoading} data-testid="login-button">
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
};

describe('Login Flow Integration', () => {
  beforeEach(() => {
    // Reset auth store
    useAuthStore.setState({
      user: null,
      token: null,
      sessionId: null,
      isLoading: false,
      error: null,
      mfaEnabled: false,
    });
    vi.clearAllMocks();
  });

  it('IT-AUTH-001: should login successfully with valid credentials', async () => {
    const { authApi } = await import('@/services/api/authApi');
    vi.mocked(authApi.login).mockResolvedValueOnce({
      code: 200,
      message: 'Success',
      user_id: '12345',
      user_email: 'test@example.com',
      role: 'merchant',
      session_id: 'session_123456',
      hierarchy: 'H001',
      hierarchyName: 'Test Hierarchy',
      merchant_id: 'M001',
      merchant_name: 'Test Merchant',
      merchants: [],
      child: [],
      adminPermissions: 'full',
      can_refund: 1,
      MFA: false,
      config: '{}',
      settlement_currencys: ['USD'],
      timezone: 'America/Los_Angeles',
      timezone_short: 'PST',
    });

    const user = userEvent.setup();
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockLoginForm />
      </Wrapper>,
    );

    // Fill in credentials
    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');

    // Submit form
    await user.click(screen.getByTestId('login-button'));

    // Wait for login to complete
    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.user).not.toBeNull();
      expect(state.user?.email).toBe('test@example.com');
      expect(state.sessionId).toBe('session_123456');
    });
  });

  it('IT-AUTH-002: should show error on failed login', async () => {
    const { authApi } = await import('@/services/api/authApi');
    vi.mocked(authApi.login).mockRejectedValueOnce(
      new Error('Invalid credentials'),
    );

    const user = userEvent.setup();
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockLoginForm />
      </Wrapper>,
    );

    // Fill in wrong credentials
    await user.type(screen.getByTestId('email-input'), 'wrong@example.com');
    await user.type(screen.getByTestId('password-input'), 'wrongpassword');

    // Submit form
    await user.click(screen.getByTestId('login-button'));

    // Wait for error
    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.error).not.toBeNull();
      expect(state.user).toBeNull();
    });
  });

  it('IT-AUTH-003: should handle MFA required response', async () => {
    const { authApi } = await import('@/services/api/authApi');
    vi.mocked(authApi.login).mockResolvedValueOnce({
      code: 200,
      message: 'MFA required',
      user_id: '12346',
      user_email: 'mfa@example.com',
      session_id: 'session_mfa',
      MFA: true,
    });

    const user = userEvent.setup();
    const Wrapper = createTestWrapper();

    render(
      <Wrapper>
        <MockLoginForm />
      </Wrapper>,
    );

    // Fill in MFA user credentials
    await user.type(screen.getByTestId('email-input'), 'mfa@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');

    // Submit form
    await user.click(screen.getByTestId('login-button'));

    // Wait for MFA flag to be set
    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.mfaEnabled).toBe(true);
    });
  });

  it('IT-AUTH-005: should logout and clear state', () => {
    // First, set up logged in state
    useAuthStore.setState({
      user: { id: '1', email: 'test@example.com', role: 'merchant' },
      token: 'token123',
      sessionId: 'session123',
      canRefund: true,
    });

    // Mock window.location.href
    const originalLocation = window.location;
    // @ts-expect-error Testing mock
    delete window.location;
    window.location = { ...originalLocation, href: '' };

    // Logout
    const { logout } = useAuthStore.getState();
    logout();

    // Check state is cleared
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.sessionId).toBeNull();

    // Restore window.location
    window.location = originalLocation;
  });
});
