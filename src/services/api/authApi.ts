import { apiClient } from './apiClient';
import type {
  LoginCredentials,
  LoginResponse,
  NauthLoginUrlRequest,
  NauthLoginUrlResponse,
  ChangePhoneRequest,
  ChangePhoneResponse,
  ResendAuthCodeResponse,
  VerifyChangePhoneRequest,
  VerifyChangePhoneResponse,
} from '@/types/auth';

export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/login', credentials);
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get nauth login URL for password change
   */
  async getNauthLoginUrl(
    request: NauthLoginUrlRequest,
  ): Promise<NauthLoginUrlResponse> {
    const response = await apiClient.post<NauthLoginUrlResponse>(
      '/nauth_login_url',
      request,
    );
    return response.data;
  },

  /**
   * Change phone number - Step 1
   */
  async changePhone(request: ChangePhoneRequest): Promise<ChangePhoneResponse> {
    const response = await apiClient.post<ChangePhoneResponse>(
      '/change_phone',
      request,
    );
    return response.data;
  },

  /**
   * Resend auth code to initial phone
   */
  async resendAuthCode(): Promise<ResendAuthCodeResponse> {
    const response = await apiClient.post<ResendAuthCodeResponse>(
      '/resend_auth_code_to_init_phone',
      {},
    );
    return response.data;
  },

  /**
   * Verify phone change with auth code - Step 2
   */
  async verifyChangePhone(
    request: VerifyChangePhoneRequest,
  ): Promise<VerifyChangePhoneResponse> {
    const response = await apiClient.post<VerifyChangePhoneResponse>(
      '/verify_change_phone',
      request,
    );
    return response.data;
  },
};
