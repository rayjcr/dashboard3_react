/**
 * Dashboard module type definitions
 */

// ============================================================
// Summary API Types
// ============================================================

/**
 * Summary search type
 */
export type SummarySearchType =
  | 'daily'
  | 'monthly'
  | 'settle'
  | 'reserve'
  | 'daily_settle';

/**
 * /summary request parameters
 */
export interface SummaryRequest {
  /** Date, daily/settle/reserve format: "2026-01-01", monthly format: "202601" */
  date_month: string;
  /** Dispute type, default "all" */
  disputeType: string;
  /** Merchant node ID */
  hierarchy_user_id: number;
  /** Merchant ID, leaf nodes pass actual value, parent nodes pass empty string */
  merchantId: string;
  /** Current page number, starts from 0 */
  page_number: string;
  /** Maximum records per page */
  row_count: number;
  /** Search type */
  search_type: SummarySearchType;
  /** Session ID */
  session_id: string;
}

/**
 * Hierarchy user data
 */
export interface HierarchyUserData {
  description: string | null;
  id: number;
  label: string | null;
  merchant_id: string;
  name: string;
  parent_id: number;
}

/**
 * Transaction record
 */
export interface TransactionRecord {
  /** Aggregation type */
  aggr_type: string;
  /** Currency type */
  currency: string;
  /** Date/month (with timezone display) */
  date_month: string;
  /** Database stored date/month */
  db_year_month: string;
  /** Discount amount */
  discount: number;
  /** Fixed fee */
  fixed: number;
  /** Gross amount */
  gross: number;
  /** Hierarchy ID */
  hierarchyId: number;
  /** Is ISV */
  is_isv: number;
  /** Net amount */
  net: number;
  /** Number of transactions */
  num_tran: number;
  /** Payout amount */
  payout: number;
  /** Settlement date */
  settle_date: string;
  /** Status */
  status: string;
  /** Payment method/vendor */
  vendor: string;
}

/**
 * /summary success response
 */
export interface SummaryResponse {
  /** Response status code, 200 means success */
  code: number;
  /** Error message */
  message?: string;
  /** Whether dispute management is supported */
  disputeManage: boolean;
  /** Gateway */
  gateway: string;
  /** Whether has dispute children */
  hasDisputeChild: boolean;
  /** Whether has Elavon children */
  hasElavonChild: boolean;
  /** Whether has itemized fee */
  hasItemizedFee: boolean;
  /** Whether is Elavon site */
  isElavonSite: boolean;
  /** Whether has JkoPay */
  hasJkoPay: boolean;
  /** Whether has pre-authorization */
  hasPreAuth: boolean;
  /** Whether has reserve */
  hasReserve: boolean;
  /** Whether has UPI */
  hasUPI: boolean;
  /** Whether is multi-currency */
  isMultiCurrency: boolean;
  /** Hierarchy user data */
  hierarchy_user_data: HierarchyUserData;
  /** Total records count */
  total_records: number;
  /** Transaction records list */
  transactions: TransactionRecord[];
  /** Whether UMF is enabled */
  umfEnabled: boolean;
}

// ============================================================
// Dashboard Store Types
// ============================================================

/**
 * Node shared info (returned from /summary API, needs to be persisted)
 */
export interface NodeSharedInfo {
  /** Whether dispute management is supported */
  disputeManage: boolean;
  /** Gateway */
  gateway: string;
  /** Whether has dispute children */
  hasDisputeChild: boolean;
  /** Whether has Elavon children */
  hasElavonChild: boolean;
  /** Whether has itemized fee */
  hasItemizedFee: boolean;
  /** Whether has JkoPay */
  hasJkoPay: boolean;
  /** Whether has pre-authorization */
  hasPreAuth: boolean;
  /** Whether has reserve */
  hasReserve: boolean;
  /** Whether has UPI */
  hasUPI: boolean;
  /** Whether UMF is enabled */
  umfEnabled: boolean;
}

/**
 * Default value for node shared info
 */
export const DEFAULT_NODE_SHARED_INFO: NodeSharedInfo = {
  disputeManage: false,
  gateway: '',
  hasDisputeChild: false,
  hasElavonChild: false,
  hasItemizedFee: false,
  hasJkoPay: false,
  hasPreAuth: false,
  hasReserve: false,
  hasUPI: false,
  umfEnabled: false,
};

/**
 * Dashboard state
 */
export interface DashboardState {
  // Daily Summary
  dailySummary: SummaryResponse | null;
  dailySummaryLoading: boolean;
  dailySummaryError: string | null;
  dailyPage: number;
  dailyPageSize: number;

  // Monthly Summary
  monthlySummary: SummaryResponse | null;
  monthlySummaryLoading: boolean;
  monthlySummaryError: string | null;
  monthlyPage: number;
  monthlyPageSize: number;

  // Daily Settle Summary
  dailySettleSummary: SummaryResponse | null;
  dailySettleSummaryLoading: boolean;
  dailySettleSummaryError: string | null;
  dailySettlePage: number;
  dailySettlePageSize: number;

  // Node shared info (persisted)
  nodeSharedInfo: NodeSharedInfo;

  // Actions
  fetchDailySummary: (
    params: Omit<SummaryRequest, 'search_type'>,
  ) => Promise<void>;
  fetchMonthlySummary: (
    params: Omit<SummaryRequest, 'search_type'>,
  ) => Promise<void>;
  fetchDailySettleSummary: (
    params: Omit<SummaryRequest, 'search_type'>,
  ) => Promise<void>;
  setDailyPage: (page: number) => void;
  setDailyPageSize: (pageSize: number) => void;
  setMonthlyPage: (page: number) => void;
  setMonthlyPageSize: (pageSize: number) => void;
  setDailySettlePage: (page: number) => void;
  setDailySettlePageSize: (pageSize: number) => void;
  clearDashboard: () => void;
  updateNodeSharedInfo: (info: Partial<NodeSharedInfo>) => void;
}

// ============================================================
// Transaction Lookup API Types
// ============================================================

/**
 * /transactions_lookup request parameters
 */
export interface TransactionLookupRequest {
  /** Merchant ID */
  merchantId: string;
  /** Session ID */
  sessionId: string;
  /** Records per page */
  rowCount: number;
  /** Page number, starts from 0 */
  pageNumber: number;
  /** Start date, format "2026-01-21" */
  startDate: string;
  /** End date, format "2026-01-21" */
  endDate: string;
  /** Search keyword */
  searchKey: string;
  /** Hierarchy ID */
  hierarchy: number;
  /** Selected MID (selectedNode.id) */
  selectedMid: number;
}

/**
 * Transaction record details
 */
export interface TransactionLookupRecord {
  transaction_id: string;
  parent_transaction_id: string | null;
  reference: string;
  reference2: string;
  tranx_status: string;
  currency: string;
  auth_currency: string;
  transaction_type: string;
  merchant_db: string;
  transaction_db: string;
  mttimezone: string;
  time_created: string | null;
  payment_method: string;
  payment_gateway: string;
  buyer_id: string;
  method_trans_id: string;
  total: number;
  merchant_discount: string;
  net: number;
  sales: number;
  auth_amount: number;
  amount_captured: string | number;
  tip: string | number;
  login_code: string;
  transaction_tag: string;
  terminal_id: string;
  remaining_balance: string | number;
  store_name: string;
  location: string;
  original_merchant_name_english: string;
  extral_reference: string | null;
  amount_authorized_remaining: number;
  amount_refunded: number;
  vendor: string;
  type: string | null;
  source: string;
  risk_score?: number;
  error_code?: string;
  chargeback_status?: string;
  pre_auth?: number;
}

/**
 * /transactions_lookup response
 */
export interface TransactionLookupResponse {
  /** Total records */
  totalRecords: string;
  /** Merchant ID */
  merchant_id: string;
  /** Merchant name */
  merchant_name: string;
  /** Currency */
  currency: string;
  /** Transaction records list */
  transactions: TransactionLookupRecord[];
}

/**
 * Transaction Lookup Store state
 */
export interface TransactionLookupState {
  // Data
  transactionData: TransactionLookupResponse | null;
  loading: boolean;
  error: string | null;

  // Loaded node tracking (for caching)
  loadedNodeId: string | null;

  // Pagination
  page: number;
  pageSize: number;

  // Search filters
  startDate: string;
  endDate: string;
  searchKey: string;

  // Column visibility config (keyed by merchantId)
  columnConfig: Record<string, string[]>;

  // Actions
  fetchTransactions: (
    params: TransactionLookupRequest,
    nodeId?: string,
  ) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSearchKey: (key: string) => void;
  setColumnConfig: (merchantId: string, visibleColumns: string[]) => void;
  getVisibleColumns: (merchantId: string) => string[];
  clearTransactionLookup: () => void;
}

// ============================================================
// Transaction Lookup Column Config Types
// ============================================================

/**
 * Column definition for show/hide configuration
 */
export interface ConfigurableColumn {
  key: string;
  title: string;
  defaultVisible: boolean;
}

/**
 * List of configurable columns
 */
export const CONFIGURABLE_COLUMNS: ConfigurableColumn[] = [
  { key: 'reference', title: 'Reference ID', defaultVisible: true },
  { key: 'reference2', title: 'Reference2', defaultVisible: true },
  { key: 'extral_reference', title: 'Extral Reference', defaultVisible: true },
  { key: 'tranx_status', title: 'Status', defaultVisible: true },
  { key: 'payment_gateway', title: 'Gateway', defaultVisible: true },
  { key: 'auth_currency', title: 'Auth Currency', defaultVisible: true },
  { key: 'auth_amount', title: 'Auth Amount', defaultVisible: true },
  { key: 'amount_captured', title: 'Captured Amount', defaultVisible: true },
  { key: 'risk_score', title: 'Score', defaultVisible: true },
  { key: 'error_code', title: 'Reason Code', defaultVisible: true },
  { key: 'dispute_tag', title: 'Dispute Tag', defaultVisible: true },
  { key: 'transaction_tag', title: 'Transaction Tag', defaultVisible: true },
  { key: 'terminal_id', title: 'Terminal ID', defaultVisible: true },
  {
    key: 'original_merchant_name_english',
    title: 'Store of Original Payment',
    defaultVisible: true,
  },
];

/**
 * Get default visible columns
 */
export const getDefaultVisibleColumns = (): string[] => {
  return CONFIGURABLE_COLUMNS.filter((col) => col.defaultVisible).map(
    (col) => col.key,
  );
};

// ============================================================
// Config Parsing Types
// ============================================================

/**
 * User configuration (parsed from authStore.config)
 */
export interface UserConfig {
  MFA?: boolean;
  /** Disable daily report details */
  detail_daily_report_disable?: string;
  /** Disable monthly report details */
  detail_monthly_report_disable?: string;
  /** Disable Daily Summary */
  daily_summary_disable?: boolean;
  /** Disable Monthly Summary */
  monthly_summary_disable?: boolean;
  /** Disable Transaction Lookup */
  transactions_lookup_disable?: boolean;
  /** Disable Daily Dispute Summary */
  daily_dispute_summary_disable?: boolean;
  /** Enable Dispute Manage */
  dispute_manage?: boolean;
  /** Disable Reserve Summary */
  reserve_summary_disable?: boolean;
}

/**
 * Parse config string to UserConfig object
 */
export const parseUserConfig = (config: string): UserConfig => {
  if (!config) return {};
  try {
    return JSON.parse(config) as UserConfig;
  } catch {
    return {};
  }
};

// ============================================================
// Table Column Config Types
// ============================================================

/**
 * Daily Summary table row data
 */
export interface DailySummaryTableRow {
  key: string;
  dateMonth: string;
  dbYearMonth: string;
  totalTranx: number;
  gross: string;
  net: string;
  payout: string;
  status: string;
  settleDate: string;
  paymentMethods: string;
  currency: string;
  /** Is ISV (for detail page navigation) */
  isIsv: number;
}

/**
 * Monthly Summary table row data
 */
export interface MonthlySummaryTableRow {
  key: string;
  month: string;
  dbYearMonth: string;
  totalTranx: number;
  gross: string;
  net: string;
  paymentMethods: string;
  currency: string;
}

// ============================================================
// Daily Settle Summary Types
// ============================================================

/**
 * Daily Settle Summary transaction record
 */
export interface DailySettleRecord {
  /** Hierarchy ID */
  hierarchyId: number;
  /** Aggregation type */
  aggr_type: string;
  /** Settlement date */
  date_month: string;
  /** Timezone name */
  timezone_name: string;
  /** Currency type */
  currency: string;
  /** Payment method/vendor */
  vendor: string;
  /** Is ISV */
  is_isv: number;
  /** Number of transactions */
  num_tran: number | null;
  /** Gross amount */
  gross: number;
  /** Discount amount */
  discount: number;
  /** Fixed fee */
  fixed: number;
  /** Net amount/Payout */
  net: number;
}

/**
 * Daily Settle Summary table row data
 */
export interface DailySettleSummaryTableRow {
  key: string;
  /** Settlement date + timezone (for display) */
  dateSettlement: string;
  /** Original date (for navigation) */
  dbDateMonth: string;
  /** Number of transactions */
  totalTranx: number;
  /** Gross amount (formatted) */
  gross: string;
  /** Payment method */
  method: string;
  /** Payout (formatted) */
  payout: string;
  /** Currency type */
  currency: string;
}

// ============================================================
// Dispute Summary Types
// ============================================================

/**
 * Dispute type enum
 */
export type DisputeType =
  | 'all'
  | 'request_info'
  | 'under_review'
  | 'lost_waiting_for_refund'
  | 'won/lost'
  | 'close'
  | 'other';

/**
 * Dispute type options (for UI display)
 */
export const DISPUTE_TYPE_OPTIONS: { value: DisputeType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'request_info', label: 'Waiting For Response' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'lost_waiting_for_refund', label: 'Waiting For Refund(Lost)' },
  { value: 'won/lost', label: 'Win/Lost' },
  { value: 'close', label: 'Closed' },
  { value: 'other', label: 'Other' },
];

/**
 * List of vendors that require Action button
 */
export const ACTION_BUTTON_VENDORS = [
  'PAYPAL',
  'VENMO',
  'CASHAPPPAY',
  'CARD',
  'AFTERPAY',
  'KLARNA',
  'GOOGLEPAY',
  'APPLEPAY',
];

/**
 * /dispute/list request parameters
 */
export interface DisputeListRequest {
  /** Merchant node ID */
  hierarchy_user_id: number;
  /** Merchant ID */
  merchantId: string;
  /** Session ID */
  session_id: string;
  /** Search type, fixed as 'daily_dispute' */
  search_type: 'daily_dispute';
  /** Date/month */
  date_month: string;
  /** Dispute type */
  disputeType: string;
  /** Current page number, starts from 0 */
  page_number: string;
  /** Maximum records per page */
  row_count: number;
  /** Start date */
  startDate: string;
  /** End date */
  endDate: string;
  /** Search keyword */
  searchKey: string;
}

/**
 * Dispute transaction record
 */
export interface DisputeRecord {
  id: number;
  case_id: string;
  description: string | null;
  requests: string | null;
  checked: string;
  case_expiration_date: string | null;
  cc_email: string | null;
  time_created: string | null;
  time_updated: string | null;
  item_transaction_id: string;
  item_method_trans_id: string;
  barcode: string;
  payment_transaction_id: string;
  merchant_id: string;
  merchant_db: string;
  vendor: string;
  itme_transaction_type: string;
  amount: number;
  settle_amount: number;
  currency: string;
  merchant_discount: number;
  merchant_fixed: number;
  monthly_fee: number | null;
  status: string;
  settle_status: string | null;
  time_settled: string | null;
  reason_code: string;
  gateway_transfer_id: string | null;
  trans_amount: number | null;
  trans_currency: string | null;
}

/**
 * /dispute/list response
 */
export interface DisputeListResponse {
  /** Response status code, 200 means success */
  code: number;
  /** Error message */
  message?: string;
  /** Transaction records list */
  transactions: DisputeRecord[];
  /** Total records count */
  total_records: number;
}

/**
 * Dispute Summary table row data
 */
export interface DisputeSummaryTableRow {
  key: string;
  /** Record ID (for file upload and other operations) */
  id: number;
  /** Case ID */
  caseId: string;
  /** Status */
  status: string;
  /** Dispute amount (formatted) */
  disputeAmount: string;
  /** Created time */
  timeCreated: string;
  /** Last updated time */
  timeUpdated: string;
  /** Payment transaction ID */
  paymentTransactionId: string;
  /** Payment method */
  paymentMethod: string;
  /** Reason */
  reason: string;
  /** Type */
  type: string;
  /** Case expiration time */
  caseExpirationTime: string;
  /** Currency type */
  currency: string;
  /** Original vendor (for determining whether to show Action button) */
  vendor: string;
  /** Description */
  description: string;
  /** Merchant ID */
  merchantId: string;
  /** Klarna requests JSON (optional, for Klarna vendor) */
  requests?: string;
}

/**
 * Evidence file in Dispute Note
 */
export interface DisputeNoteEvidence {
  id: string;
  file_name: string;
}

/**
 * Dispute Note record
 */
export interface DisputeNote {
  id: number;
  case_id: string;
  item_id: number;
  note_from: string;
  note: string;
  /** JSON string, parsed as DisputeNoteEvidence[] */
  evidence: string;
  note_read: string;
  time_updated: string | null;
  status: string;
}

/**
 * GET /dispute/{id} response
 */
export interface DisputeDetailResponse {
  code: number;
  notes: DisputeNote[];
}

/**
 * Dispute Store state
 */
export interface DisputeState {
  // Data
  disputeData: DisputeListResponse | null;
  loading: boolean;
  error: string | null;

  // Loaded node tracking (for caching)
  loadedNodeId: string | null;

  // Pagination
  page: number;
  pageSize: number;

  // Search filters
  startDate: string;
  endDate: string;
  searchKey: string;
  disputeType: DisputeType;

  // Actions
  fetchDisputes: (params: DisputeListRequest, nodeId?: string) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSearchKey: (key: string) => void;
  setDisputeType: (type: DisputeType) => void;
  clearDispute: () => void;
}

// ============================================================
// Alipay Direct Settlement Types
// ============================================================

/**
 * /tranx/ali_direct request parameters
 */
export interface AliDirectRequest {
  /** Merchant ID */
  merchantId: string;
  /** Session ID */
  session_id: string;
  /** Date/month */
  date_month: string;
  /** Current page number, starts from 0 */
  page_number: string;
  /** Maximum records per page */
  row_count: number;
  /** Start date */
  startDate?: string;
  /** End date */
  endDate?: string;
}

/**
 * Alipay Direct record
 */
export interface AliDirectRecord {
  /** Timezone */
  timezone: string;
  /** Currency type */
  currency: string;
  /** Number of transactions */
  number_of_transaction: number;
  /** Gross amount */
  gross: number;
  /** Net amount */
  net: number;
  /** China start date */
  china_start_date: string;
  /** China end date */
  china_end_date: string;
  /** China start time */
  china_start_time: string;
  /** China end time */
  china_end_time: string;
  /** Merchant start time */
  merchant_start_time: string;
  /** Merchant start date */
  merchant_start_date: string;
  /** Merchant end time */
  merchant_end_time: string;
  /** Merchant end date */
  merchant_end_date: string;
}

/**
 * /tranx/ali_direct response
 */
export interface AliDirectResponse {
  /** Response status code */
  code: string;
  /** Merchant timezone */
  merchantTimezone: string;
  /** Alipay Direct records list */
  aliDirect: AliDirectRecord[];
  /** Total records count */
  total_records: number;
}

/**
 * Alipay Direct Settlement table row data
 */
export interface AliDirectTableRow {
  key: string;
  /** Merchant date display */
  merchantDate: string;
  /** Merchant time range */
  merchantTimeRange: string;
  /** Number of transactions (merchant timezone) */
  merchantSubTotalTranx: number;
  /** Gross (merchant timezone) */
  merchantGross: string;
  /** Net (merchant timezone) */
  merchantNet: string;
  /** Daily Settlement Amount (merchant timezone, merged row) */
  merchantDailySettlement: string;
  /** China date display */
  chinaDate: string;
  /** China time range */
  chinaTimeRange: string;
  /** Number of transactions (China timezone) */
  chinaSubTotalTranx: number;
  /** Gross (China timezone) */
  chinaGross: string;
  /** Net (China timezone) */
  chinaNet: string;
  /** Daily Settlement Amount (China timezone, merged row) */
  chinaDailySettlement: string;
  /** Currency type */
  currency: string;
  /** Raw merchant date (for row merging) */
  rawMerchantDate: string;
  /** Raw China date (for row merging) */
  rawChinaDate: string;
  /** Raw net value (for accumulation) */
  rawNet: number;
  /** Merchant timezone row span */
  merchantRowSpan?: number;
  /** China timezone row span */
  chinaRowSpan?: number;
}

/**
 * Alipay Direct Store state
 */
export interface AliDirectState {
  // Data
  aliDirectData: AliDirectResponse | null;
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  pageSize: number;

  // Search filters
  startDate: string;
  endDate: string;

  // Actions
  fetchAliDirect: (params: AliDirectRequest) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  clearAliDirect: () => void;
}

// ============================================================
// Multi Fundings API Types
// ============================================================

/**
 * Multi Fundings request parameters
 */
export interface MultiFundingsRequest {
  /** Merchant ID */
  merchantId: string;
  /** Session ID */
  session_id: string;
  /** Date filter, format: "YYYY-MM-DD" or empty string */
  date_month: string;
  /** Current page number, starts from 0 */
  page_number: string;
  /** Records per page */
  row_count: number;
}

/**
 * Multi Fundings record
 */
export interface MultiFundingsRecord {
  /** Funding method */
  funding: string;
  /** Number of transactions */
  count: number;
  /** Gross amount */
  sum: number;
  /** Payout amount */
  settled: number;
  /** Occurred date */
  happenedDate: string;
  /** Timezone */
  timezone: string;
  /** Currency */
  currency: string;
}

/**
 * Multi Fundings response
 */
export interface MultiFundingsResponse {
  /** Response code */
  code: string;
  /** Data list (using aliDirect field name) */
  aliDirect: MultiFundingsRecord[];
  /** Total records count */
  total_records: number;
}

/**
 * Multi Fundings Store state
 */
export interface MultiFundingsState {
  // Data
  multiFundingsData: MultiFundingsResponse | null;
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  pageSize: number;

  // Actions
  fetchMultiFundings: (params: MultiFundingsRequest) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearMultiFundings: () => void;
}

// ============================================================
// Reserve Summary API Types
// ============================================================

/**
 * Reserve Summary request parameters
 */
export interface ReserveSummaryRequest {
  /** Merchant node ID */
  hierarchy_user_id: number;
  /** Merchant ID */
  merchantId: string;
  /** Session ID */
  session_id: string;
  /** Search type, fixed as "reserve" */
  search_type: 'reserve';
  /** Date filter, empty string */
  date_month: string;
  /** Dispute type, fixed as "all" */
  disputeType: string;
  /** Current page number, starts from 0 */
  page_number: string;
  /** Records per page */
  row_count: number;
}

/**
 * Fixed Reserve record
 */
export interface FixedReserveRecord {
  /** Record ID */
  id: string;
  /** Merchant ID */
  merchant_id: string;
  /** Type */
  type: 'fixed';
  /** Total amount */
  total_amount: number | null;
  /** Status */
  status: string;
  /** Content JSON */
  content: string;
  /** Start date */
  start_date: string;
  /** End date */
  end_date: string | null;
  /** Payment time */
  time_paid: string | null;
  /** Release time */
  time_released: string | null;
  /** Created time */
  time_created: string;
  /** Updated time */
  time_updated: string;
}

/**
 * Rolling Reserve record
 */
export interface RollingReserveRecord {
  /** Record ID */
  id: string;
  /** Merchant ID */
  merchant_id: string;
  /** Type */
  type: 'rolling';
  /** Total amount */
  total_amount: number | null;
  /** Status */
  status: string;
  /** Content JSON, contains percent, start_date, rolling_period */
  content: string;
  /** Start date */
  start_date: string;
  /** End date */
  end_date: string | null;
  /** Payment time */
  time_paid: string | null;
  /** Release time */
  time_released: string | null;
  /** Creation time */
  time_created: string;
  /** Update time */
  time_updated: string;
}

/**
 * Rolling Detail transaction record
 */
export interface RollingDetailRecord {
  /** Withheld amount */
  withheld: number;
  /** Released amount */
  released: number;
  /** Net amount */
  net: number;
  /** Date */
  date: string;
}

/**
 * Rolling Detail
 */
export interface RollingDetail {
  /** Transaction records */
  transactions: RollingDetailRecord[];
  /** Total records count */
  total_records: number;
}

/**
 * Reserve Summary response
 */
export interface ReserveSummaryResponse {
  /** Response code */
  code: number;
  /** Merchant info */
  merchant_info: {
    currency: string;
  };
  /** Fixed Reserves */
  fixed_reserves: FixedReserveRecord[];
  /** Rolling Reserves */
  rolling_reserves: RollingReserveRecord[];
  /** Rolling Detail */
  rolling_detail: RollingDetail;
  /** Whether has UPI */
  hasUPI: boolean;
  /** Whether has dispute child */
  hasDisputeChild: boolean;
  /** Whether has JkoPay */
  hasJkoPay: boolean;
  /** Gateway */
  gateway: string;
  /** Whether has pre-authorization */
  hasPreAuth: boolean;
  /** Whether supports dispute management */
  disputeManage: boolean;
  /** Whether has Reserve */
  hasReserve: boolean;
  /** Whether has itemized fee */
  hasItemizedFee: boolean;
  /** Hierarchy user data */
  hierarchy_user_data: HierarchyUserData;
}

/**
 * Reserve Summary Store state
 */
export interface ReserveSummaryState {
  // Data
  reserveSummaryData: ReserveSummaryResponse | null;
  loading: boolean;
  error: string | null;
  currency: string;

  // Pagination for rolling detail
  page: number;
  pageSize: number;

  // Actions
  fetchReserveSummary: (params: ReserveSummaryRequest) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearReserveSummary: () => void;
}

// ============================================================
// Daily Detail Report API related types
// ============================================================

/**
 * Daily Detail Report request parameters
 */
export interface DailyDetailReportRequest {
  /** Merchant ID */
  merchantId: string;
  /** Date, format "YYYY-MM-DD" */
  date: string;
  /** Session ID */
  sessionId: string;
  /** Whether is ISV, 0 in record means false */
  isIsv: boolean;
  /** Report type: daily or settle */
  type?: 'daily' | 'settle';
}

/**
 * Monthly Detail Report request parameters
 */
export interface MonthlyDetailReportRequest {
  /** Merchant ID */
  merchantId: string;
  /** Month, format "Jul 2024" */
  month: string;
  /** Session ID */
  sessionId: string;
  /** Whether is ISV */
  isIsv: boolean;
}

/**
 * Daily Detail Report transaction record
 */
export interface DailyDetailTransaction {
  /** Transaction ID */
  transaction_id: string;
  /** Reference ID */
  reference: string | null;
  /** Reference ID 2 */
  reference2: string | null;
  /** Currency type */
  currency: string;
  /** Transaction type */
  transaction_type: string;
  /** Payment method */
  payment_method: string;
  /** Buyer ID */
  buyer_id: string;
  /** Payment method transaction ID */
  method_trans_id: string;
  /** Merchant database */
  merchant_db: string;
  /** Creation time */
  time_created: string | null;
  /** Local creation time */
  time_created_local: string | null;
  /** Total amount */
  total: number;
  /** Merchant fixed fee */
  merchant_fixed: number;
  /** Net amount */
  net: number;
  /** Tip amount */
  tip: number;
  /** Login code */
  login_code: string | null;
  /** Transaction tag */
  transaction_tag: string | null;
  /** Status */
  status: string | null;
  /** Settlement time */
  time_settled: string | null;
  /** Merchant discount */
  merchant_discount: number;
  /** Original merchant English name */
  original_merchant_name_english: string | null;
  /** Extra reference */
  extral_reference: string | null;
  /** VAT fee */
  vat_fee: number;
  /** Refund fee */
  refund_fee: number | null;
  /** Customized fee */
  customized_fee: number;
}

/**
 * Daily Detail Report Dispute record
 */
export interface DailyDetailDispute {
  /** Dispute ID */
  id: number;
  /** Case ID (legacy field, kept for compatibility) */
  case_id: string;
  /** Item Transaction ID (Dispute ID) */
  item_transaction_id: string;
  /** Transaction ID (Payment Transaction ID) */
  transaction_id: string;
  /** Payment transaction ID (legacy field, kept for compatibility) */
  payment_transaction_id: string;
  /** Creation time (legacy field, kept for compatibility) */
  time_created: string | null;
  /** Local creation time */
  time_created_local: string | null;
  /** Transaction type */
  transaction_type: string;
  /** Payment method */
  payment_method: string;
  /** Amount (legacy field, kept for compatibility) */
  amount: number;
  /** Gross (total amount) */
  total: number;
  /** Merchant discount */
  merchant_discount: number;
  /** Authorization amount (legacy field, kept for compatibility) */
  auth_amount: number;
  /** Authorization (merchant fixed fee) */
  merchant_fixed: number;
  /** Net amount */
  net: number;
  /** Dispute tag (legacy field, kept for compatibility) */
  dispute_tag: string | null;
  /** Status (Dispute Tag) */
  status: string | null;
  /** Settlement time */
  time_settled: string | null;
  /** Currency */
  currency: string;
}

/**
 * Monthly Fee record
 */
export interface DailyDetailMonthlyFee {
  /** Transaction ID */
  transaction_id: string;
  /** Reference ID */
  reference: string | null;
  /** Reference ID 2 */
  reference2: string | null;
  /** Extra reference */
  extral_reference: string | null;
  /** Creation time */
  time_created: string | null;
  /** Transaction type */
  transaction_type: string;
  /** Payment method */
  payment_method: string;
  /** Buyer ID */
  buyer_id: string;
  /** Payment method transaction ID */
  method_trans_id: string;
  /** Total amount */
  total: number;
  /** Merchant discount */
  merchant_discount: number;
  /** Authorization amount */
  auth_amount: number;
  /** Fee */
  fee: number;
  /** Net amount */
  net: number;
  /** Tip amount */
  tip: number;
  /** Login code */
  login_code: string | null;
  /** Settlement time */
  time_settled: string | null;
  /** Original merchant English name */
  original_merchant_name_english: string | null;
  /** Currency */
  currency: string;
}

/**
 * Settlement Fee record
 */
export interface DailyDetailSettlementFee {
  /** Transaction ID */
  transaction_id: string;
  /** Reference ID */
  reference: string | null;
  /** Reference ID 2 */
  reference2: string | null;
  /** Extra reference */
  extral_reference: string | null;
  /** Creation time */
  time_created: string | null;
  /** Transaction type */
  transaction_type: string;
  /** Payment method */
  payment_method: string;
  /** Buyer ID */
  buyer_id: string;
  /** Payment method transaction ID */
  method_trans_id: string;
  /** Total amount */
  total: number;
  /** Merchant discount */
  merchant_discount: number;
  /** Authorization amount */
  auth_amount: number;
  /** Fee */
  fee: number;
  /** Net amount */
  net: number;
  /** Tip amount */
  tip: number;
  /** Login code */
  login_code: string | null;
  /** Settlement time */
  time_settled: string | null;
  /** Original merchant English name */
  original_merchant_name_english: string | null;
  /** Currency */
  currency: string;
}

/**
 * Reserve record
 */
export interface DailyDetailReserve {
  /** Transaction ID */
  transaction_id: string;
  /** Reference */
  reference: string | null;
  /** Creation time */
  time_created: string | null;
  /** Transaction type */
  transaction_type: string;
  /** Status */
  status: string;
  /** Amount */
  amount: number;
  /** Settlement time */
  time_settled: string | null;
  /** Currency */
  currency: string;
}

/**
 * Itemized Fee record
 */
export interface DailyDetailItemizedFee {
  /** Transaction ID */
  transaction_id: string;
  /** Reference */
  reference: string | null;
  /** Fee name */
  fee_name: string;
  /** Creation time */
  time_created: string | null;
  /** Status */
  status: string;
  /** Gross amount */
  gross: number;
  /** Settlement time */
  time_settled: string | null;
  /** Currency */
  currency: string;
}

/**
 * Misc Fee (Apex Fee) record
 */
export interface DailyDetailApexFee {
  /** Transaction ID */
  item_transaction_id: string;
  /** Transaction type (used to display Fee Name) */
  transaction_type: string;
  /** Local creation time */
  time_created_local: string | null;
  /** Total amount */
  total: number;
  /** Settlement time */
  time_settled: string | null;
  /** Currency */
  currency: string;
}

/**
 * Transaction summary sub-item
 */
export interface TransactionInfoSub {
  /** Transaction count */
  total_transactions: number;
  /** Gross amount */
  gross: number;
  /** Tip total */
  tip_total: number;
  /** Fees */
  fees: number;
  /** Net amount */
  net: number;
  /** Payment method/vendor */
  vendor: string;
  /** VAT fee */
  vat_fee: number;
  /** Refund fee */
  refund_fee: number;
  /** Captured amount */
  captured?: number;
  /** Same day refund */
  same_day_refund_pv?: number;
  /** Cross-day refund */
  x_day_refund_pv?: number;
}

/**
 * Transaction summary information
 */
export interface TransactionInfo {
  /** Total transaction count */
  total_transactions: number;
  /** Itemized transaction count */
  item_transactions: number;
  /** Gross amount */
  gross: number;
  /** Tip total */
  tip_total: number;
  /** Fees */
  fees: number;
  /** Net amount */
  net: number;
  /** VAT fee */
  vat_fee: number;
  /** Refund fee */
  refund_fee: number;
  /** Sub-summary (grouped by payment method) */
  subs: TransactionInfoSub[];
  /** Reserve amount */
  reserve?: number;
  /** Itemized Fee amount */
  itemized_fee?: number;
  /** Apex Fee (Misc Fee) amount */
  apex_fee?: number;
  /** Captured amount */
  captured?: number;
  /** Same day refund */
  same_day_refund_pv?: number;
  /** Cross-day refund */
  x_day_refund_pv?: number;
}

/**
 * Daily Detail Report response
 * Note: Monthly Detail Report also uses the same response structure
 */
export interface DailyDetailReportResponse {
  /** Whether is ISV */
  is_isv: boolean;
  /** Total records count */
  totalRecords: number;
  /** Merchant ID */
  merchant_id: string;
  /** Merchant name */
  merchant_name: string;
  /** Store name */
  store_name: string;
  /** From address information */
  from: string[];
  /** To (payee) */
  to: string;
  /** Timezone abbreviation */
  timezone_short: string;
  /** Merchant timezone (used for time conversion) */
  mttimezone: string;
  /** Settlement start time */
  settlement_begin: string | null;
  /** Settlement end time */
  settlement_end: string | null;
  /** Merchant rate */
  merchant_rate: string;
  /** Merchant fixed fee */
  merchant_fixed_fee: string;
  /** Agent rate */
  agent_rate: string;
  /** Agent fixed fee */
  agent_fixed_fee: string;
  /** Agent revenue share */
  agent_rev_share: string;
  /** Status */
  status: string;
  /** Currency type */
  currency: string;
  /** Transaction records list */
  transactions: DailyDetailTransaction[];
  /** Dispute records list */
  disputes: DailyDetailDispute[];
  /** Monthly Fee records list */
  monthlyFee: DailyDetailMonthlyFee[];
  /** Settlement Fee records list */
  settlementFee: DailyDetailSettlementFee[];
  /** Reserve records list */
  reserve: DailyDetailReserve[];
  /** Itemized Fee records list */
  itemizedFee: DailyDetailItemizedFee[];
  /** Apex Fee (Misc Fee) records list */
  apexFee: DailyDetailApexFee[];
  /** Pending transactions summary (Daily only) */
  pending_transactions_info?: TransactionInfo;
  /** Settled transactions summary (Daily only) */
  settled_transactions_info?: TransactionInfo;
  /** Transaction summary (Monthly only) */
  transactions_info?: TransactionInfo;
  /** Daily/monthly total net amount */
  total_net: number;
}

/**
 * Gateway payment methods list that need to display VAT
 */
export const VAT_DISPLAY_GATEWAYS = [
  'kcp',
  'sbps',
  'toss',
  'xendit',
  'aps',
  'cil',
];

/**
 * Determine whether to display VAT based on gateway
 * @param gateway Gateway string
 * @returns Whether to display VAT
 */
export const shouldShowVAT = (gateway: string): boolean => {
  if (!gateway) return false;
  const lowerGateway = gateway.toLowerCase();
  return VAT_DISPLAY_GATEWAYS.some((g) => lowerGateway.includes(g));
};

/**
 * Get tips messages based on gateway and currency
 * @param gateway Gateway string
 * @param currency Currency type
 * @returns Tips messages array
 */
export const getTipsMessages = (
  gateway: string,
  currency: string,
): string[] => {
  const tips: string[] = [];
  const lowerGateway = gateway?.toLowerCase() || '';

  // Tip 1: Based on gateway type
  if (lowerGateway.includes('sbps')) {
    tips.push(
      'Please wait between 6-10 business days for payment to clear. Some payment methods could take a long time for payment to clear.',
    );
  } else if (lowerGateway.includes('kcp')) {
    tips.push(
      'Please be advised that Korean payment methods are typically settled twice a month.',
    );
  } else if (lowerGateway.includes('toss')) {
    tips.push(
      'Please be advised that Korean payment methods are typically settled once a month.',
    );
  } else if (lowerGateway.includes('xendit') && currency === 'IDR') {
    tips.push(
      'Please be advised that Indonesian payment methods are typically settled within 9 business days.',
    );
  } else if (lowerGateway.includes('xendit') && currency === 'PHP') {
    tips.push(
      'Please be advised that Philippine payment methods are typically settled within 9 business days.',
    );
  } else {
    tips.push(
      'Please wait between 3-4 business days for payment to clear. Some payment methods could take a long time for payment to clear.',
    );
  }

  // Tip 2: If contains ebanx
  if (lowerGateway.includes('ebanx')) {
    tips.push(
      'Transactions in Latin America can take from 5-30 business days to settle due to regional settlement practices.',
    );
  }

  // Tip 3: Fixed tip
  tips.push(
    'Transaction ID*: Transaction ID indicates Citcon ID<br/>Fee*: Service fee will be collected by Citcon later',
  );

  return tips;
};

// ============================================================
// Transaction Action related types (Refund/Capture/Cancel)
// ============================================================

/**
 * Refund request parameters
 */
export interface RefundRequest {
  /** Merchant ID */
  merchantId: string;
  /** Transaction ID */
  transactionId: string;
  /** Refund amount (string format) */
  amount: string;
  /** Currency code */
  currency: string;
  /** Refund reason */
  reason: string;
  /** Transaction database */
  transactionDb: string;
  /** Session ID */
  sessionId: string;
  /** Transaction type */
  type: string;
  /** Original reference */
  originReference: string;
  /** Payment vendor */
  vendor: string;
  /** Source */
  source: string | null;
  /** Gateway */
  gateway: string;
  /** Whether is pre-authorization */
  pre_auth: boolean;
}

/**
 * Transaction Action response
 */
export interface TransactionActionResponse {
  /** Response status code, 200 means success */
  code: number;
  /** Response message */
  message: string;
}

/**
 * Capture request parameters
 */
export interface CaptureRequest {
  /** Merchant ID */
  merchantId: string;
  /** Transaction ID */
  transactionId: string;
  /** Capture amount (string format) */
  amount: string;
  /** Currency code */
  currency: string;
  /** Transaction database */
  transactionDb: string;
  /** Session ID */
  sessionId: string;
  /** Whether is multi-capture */
  multi_capture: boolean;
  /** Whether is last capture */
  last_capture: boolean;
  /** Source */
  source: string | null;
  /** Whether is pre-authorization */
  pre_auth: boolean;
}

/**
 * Cancel request parameters
 */
export interface CancelRequest {
  /** Merchant ID */
  merchantId: string;
  /** Transaction ID */
  transactionId: string;
  /** Transaction database */
  transactionDb: string;
  /** Session ID */
  sessionId: string;
  /** Source */
  source: string | null;
  /** Whether is pre-authorization */
  pre_auth: boolean;
}
