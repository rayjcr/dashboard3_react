/**
 * Hierarchy node settings
 */
export interface HierarchyNodeSettings {
  isCollapsedOnInit?: string;
}

/**
 * Hierarchy node (recursive structure)
 */
export interface HierarchyNode {
  id?: number;
  value: string;
  merchantId?: string;
  hasAliDirect?: number;
  hasMultiFundings?: number;
  settings?: HierarchyNodeSettings;
  children?: HierarchyNode[];
}

/**
 * User information derived from login response
 */
export interface User {
  id: number;
  email: string;
  role: string;
  sessionId: string;
}

/**
 * Credentials for login request
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response from login API (matches backend contract)
 */
export interface LoginResponse {
  // User info
  user_id: number;
  user_email: string;
  role: string;
  session_id: string;
  token: string | null;

  // MFA configuration
  MFA: boolean;
  config: string; // JSON string, e.g. '{"MFA":false}'

  // Hierarchy/Merchant info
  hierarchy: number;
  hierarchyName: string;
  merchant_id: string;
  merchant_name: string;
  merchants: string[];

  // Permissions
  adminPermissions: string;
  can_refund: number; // 0 or 1

  // Settlement currencies
  settlement_currencys: string[];

  // Timezone
  timezone: string;
  timezone_short: string;

  // Hierarchy tree structure
  child: HierarchyNode[];

  // Response status
  code: number;
  message: string;
}

/**
 * Auth state for Zustand store
 */
export interface AuthState {
  // User info
  user: User | null;
  token: string | null;
  sessionId: string | null;

  // Hierarchy/Merchant info
  hierarchyId: number | null;
  hierarchyName: string | null;
  merchantId: string | null;
  merchantName: string | null;
  merchants: string[];
  hierarchyTree: HierarchyNode[];

  // Permissions
  adminPermissions: string;
  canRefund: boolean;

  // MFA
  mfaEnabled: boolean;

  // Config
  config: string;

  // Currency & Timezone
  settlementCurrencies: string[];
  timezone: string;
  timezoneShort: string;

  // UI State
  isLoading: boolean;
  error: string | null;
  currentEmail: string;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Request for getting nauth login URL (password change)
 */
export interface NauthLoginUrlRequest {
  /** Callback URL after auth */
  callback_url: string;
  /** User email hint */
  login_hint: string;
  /** Whether to update password */
  update_password: boolean;
}

/**
 * Response from nauth login URL API
 */
export interface NauthLoginUrlResponse {
  /** Response code, 200 for success */
  code: number;
  /** Redirect URL on success, error message on failure */
  data: string;
}

/**
 * Request for changing phone number
 */
export interface ChangePhoneRequest {
  /** User password */
  password: string;
  /** New phone number with country code */
  phone: string;
}

/**
 * Response data from change phone API
 */
export interface ChangePhoneResponseData {
  /** Response code */
  code?: string;
  /** Attempt count for phone change */
  attempt_change_phone_count?: number;
  /** Resent count */
  resent_count?: number;
  /** Error message */
  msg?: string;
}

/**
 * Response from change phone API
 */
export interface ChangePhoneResponse {
  /** Response code, 201 for success */
  code: number;
  /** Response data */
  data: ChangePhoneResponseData;
}

/**
 * Response data from resend auth code API
 */
export interface ResendAuthCodeResponseData {
  /** Response code */
  code?: string;
  /** Resent count */
  resent_count?: number;
  /** Remaining minutes for account lock */
  remain_minutes?: number;
}

/**
 * Response from resend auth code API
 */
export interface ResendAuthCodeResponse {
  /** Response code */
  code: number;
  /** Response data */
  data: ResendAuthCodeResponseData;
}

/**
 * Request for verifying phone change
 */
export interface VerifyChangePhoneRequest {
  /** Authorization code */
  auth_code: string;
}

/**
 * Response data from verify change phone API
 */
export interface VerifyChangePhoneResponseData {
  /** Response code */
  code?: string;
  /** Attempt count */
  attempt_count?: number;
  /** Resent count */
  resent_count?: number;
  /** Error message */
  msg?: string;
  /** Remaining minutes for account lock */
  remain_minutes?: number;
}

/**
 * Response from verify change phone API
 */
export interface VerifyChangePhoneResponse {
  /** Response code, 200 for success */
  code: number;
  /** Response data */
  data: VerifyChangePhoneResponseData;
}
