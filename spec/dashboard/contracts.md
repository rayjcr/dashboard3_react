# Dashboard 模块接口契约

> **实现状态**: ✅ 已完成
> **最后更新**: 2026-02-03
> **相关文件**: `src/types/dashboard.ts`, `src/services/api/*.ts`, `src/stores/*.ts`

## 类型定义

```typescript
// ============================================================
// Summary API 相关类型
// ============================================================

/**
 * Summary 搜索类型
 */
export type SummarySearchType =
  | 'daily'
  | 'monthly'
  | 'settle'
  | 'reserve'
  | 'daily_settle';

/**
 * /summary 请求参数
 */
export interface SummaryRequest {
  /** 日期，初始加载传空字符串获取所有数据；分页时 daily/settle/reserve 格式: "2026-01-01"，monthly 格式: "202601" */
  date_month: string;
  /** 争议类型，暂时默认 "all" */
  disputeType: string;
  /** 商户节点的 ID */
  hierarchy_user_id: number;
  /** 商户 ID，叶子节点传实际值，父节点传空字符串 */
  merchantId: string;
  /** 当前页码，从 0 开始 */
  page_number: string;
  /** 每页最大记录条数 */
  row_count: number;
  /** 搜索类型 */
  search_type: SummarySearchType;
  session_id: string;
}

/**
 * 层级用户数据
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
 * 交易记录
 */
export interface TransactionRecord {
  /** 聚合类型 */
  aggr_type: string;
  /** 货币类型 */
  currency: string;
  /** 日期/月份（带时区显示） */
  date_month: string;
  /** 数据库存储的日期/月份 */
  db_year_month: string;
  /** 折扣金额 */
  discount: number;
  /** 固定费用 */
  fixed: number;
  /** 总额 */
  gross: number;
  /** 层级 ID */
  hierarchyId: number;
  /** 是否是 ISV */
  is_isv: number;
  /** 净额 */
  net: number;
  /** 交易数量 */
  num_tran: number;
  /** 支付金额 */
  payout: number;
  /** 结算日期 */
  settle_date: string;
  /** 状态 */
  status: string;
  /** 支付方式/供应商 */
  vendor: string;
}

/**
 * /summary 成功响应
 */
export interface SummaryResponse {
  /** 响应状态码，200 表示成功 */
  code: number;
  /** 错误消息 */
  message?: string;
  /** 是否支持争议管理 */
  disputeManage: boolean;
  /** 网关 */
  gateway: string;
  /** 是否有争议子项 */
  hasDisputeChild: boolean;
  /** 是否有 Elavon 子项 */
  hasElavonChild: boolean;
  /** 是否有明细费用 */
  hasItemizedFee: boolean;
  /** 是否是 Elavon 站点 */
  isElavonSite: boolean;
  /** 是否是多币种 - 用于控制内容显示 */
  isMultiCurrency: boolean;
  /** 是否有 JkoPay */
  hasJkoPay: boolean;
  /** 是否有预授权 */
  hasPreAuth: boolean;
  /** 是否有储备金 */
  hasReserve: boolean;
  /** 是否有 UPI */
  hasUPI: boolean;
  /** 层级用户数据 */
  hierarchy_user_data: HierarchyUserData;
  /** 总记录数 */
  total_records: number;
  /** 交易记录列表 */
  transactions: TransactionRecord[];
  /** UMF 是否启用 */
  umfEnabled: boolean;
}

// ============================================================
// Dashboard Store 相关类型
// ============================================================

/**
 * Dashboard 状态
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

  // Node shared info (从 API 响应提取，用于控制 Tab 显示)
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

/**
 * 节点共用信息（从 /summary 接口返回，需要持久化）
 */
export interface NodeSharedInfo {
  /** 是否支持争议管理 */
  disputeManage: boolean;
  /** 网关 */
  gateway: string;
  /** 是否有争议子项 */
  hasDisputeChild: boolean;
  /** 是否有 Elavon 子项 */
  hasElavonChild: boolean;
  /** 是否有明细费用 */
  hasItemizedFee: boolean;
  /** 是否有 JkoPay */
  hasJkoPay: boolean;
  /** 是否有预授权 */
  hasPreAuth: boolean;
  /** 是否有储备金 */
  hasReserve: boolean;
  /** 是否有 UPI */
  hasUPI: boolean;
  /** UMF 是否启用 */
  umfEnabled: boolean;
}

/**
 * 节点共用信息的默认值
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

// ============================================================
// Config 解析类型
// ============================================================

/**
 * 用户配置（从 authStore.config 解析）
 */
export interface UserConfig {
  MFA?: boolean;
  /** 禁用日报详情，空字符串或不存在表示禁用 */
  detail_daily_report_disable?: string;
  /** 禁用月报详情，空字符串或不存在表示禁用 */
  detail_monthly_report_disable?: string;
}

// ============================================================
// 表格列配置类型
// ============================================================

/**
 * Daily Summary 表格行数据
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
}

/**
 * Monthly Summary 表格行数据
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
```

---

## API 接口

### POST /tranx/summary

**描述**: 获取统计数据（Daily Summary, Monthly Summary, Daily Settle Summary, Reserve Summary）

**请求**:

```typescript
// Content-Type: application/json
{
  "date_month": "",                  // 初始加载传空字符串获取所有数据；分页时 Daily 格式: "2026-01-01", Monthly 格式: "202601"
  "disputeType": "all",              // 暂时默认 "all"
  "hierarchy_user_id": 111,          // 商户节点 ID
  "merchantId": "300000157",         // 叶子节点传值，父节点传空字符串
  "page_number": "0",                // 页码，从 0 开始
  "row_count": 10,                   // 每页条数
  "search_type": "daily"             // daily | monthly | settle | reserve
}
```

**成功响应** (code: 200):

```typescript
{
  "code": 200,
  "disputeManage": true,
  "gateway": "",
  "hasDisputeChild": false,
  "hasElavonChild": false,
  "hasItemizedFee": false,
  "isElavonSite": false,
  "hasJkoPay": false,
  "hasPreAuth": true,
  "hasReserve": false,
  "hasUPI": false,
  "hierarchy_user_data": {
    "description": null,
    "id": 1557,
    "label": null,
    "merchant_id": "30000000351000",
    "name": "paypalnew",
    "parent_id": 105
  },
  "total_records": 5,
  "transactions": [
    {
      "aggr_type": "daily",
      "currency": "USD",
      "date_month": "2022-10-17(America/Los_angeles)",
      "db_year_month": "2022-10-17",
      "discount": 7,
      "fixed": 69,
      "gross": 127,
      "hierarchyId": 1557,
      "is_isv": 0,
      "net": 51,
      "num_tran": 9,
      "payout": 0,
      "settle_date": "2023-04-27(PDT)",
      "status": "paid",
      "vendor": "PAYPAL"
    }
  ],
  "umfEnabled": false
}
```

**错误响应**:

```typescript
{
  "code": 500,
  "message": "Failed to fetch summary"
}
```

---

## 货币符号映射

```typescript
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  HKD: 'HK$',
  SGD: 'S$',
  TWD: 'NT$',
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',
  VND: '₫',
};

/**
 * 格式化金额
 * @param amount 金额数值
 * @param currency 货币代码
 * @returns 格式化后的金额字符串，如 "$1,234"
 */
export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  const formatted = Math.floor(amount).toLocaleString('en-US');
  return `${symbol}${formatted}`;
}
```

---

## 详情点击条件判断

```typescript
/**
 * 判断日报详情是否可点击
 * @param config 用户配置（从 authStore.config 解析）
 * @param hierarchyMerchantId 从 /summary 返回的 hierarchy_user_data.merchant_id
 * @returns true 表示可点击，false 表示禁用
 */
export function isDailyDetailClickable(
  config: UserConfig,
  hierarchyMerchantId: string | undefined,
): boolean {
  // 如果 detail_daily_report_disable 为空字符串，禁用
  if (config.detail_daily_report_disable === '') {
    return false;
  }
  // 子商户（有 merchant_id）可以点击，父节点（无 merchant_id）不可点击
  if (!hierarchyMerchantId) {
    return false;
  }
  return true;
}

/**
 * 判断月报详情是否可点击
 * @param config 用户配置（从 authStore.config 解析）
 * @param hierarchyMerchantId 从 /summary 返回的 hierarchy_user_data.merchant_id
 * @returns true 表示可点击，false 表示禁用
 */
export function isMonthlyDetailClickable(
  config: UserConfig,
  hierarchyMerchantId: string | undefined,
): boolean {
  // 如果 detail_monthly_report_disable 为空字符串，禁用
  if (config.detail_monthly_report_disable === '') {
    return false;
  }
  // 子商户（有 merchant_id）可以点击，父节点（无 merchant_id）不可点击
  if (!hierarchyMerchantId) {
    return false;
  }
  return true;
}
```

---

## Payout 列显示条件

```typescript
/**
 * 有 Payout 列的商户 ID 列表
 */
export const MERCHANT_IDS_HAVE_PAYOUT: string[] = [
  '634201701345000',
  '634201705214000',
  '634201705215000',
  '634201705211000',
  '634201702097000',
  '634201702096000',
  '634201702095000',
  '634201700184000',
  '634201700397000',
  '634201700395000',
  '634201700183000',
  '634201700112000',
  // added 3/5 MDB-153
  '634201701641000',
  '634201701643000',
  '634201701642000',
  '634201701644000',
  '634201702942000',
  // test
  '634201701285000',
  '634201700370000',
];

/**
 * 判断是否显示 Payout 列
 * @param merchantId 商户 ID
 * @returns true 表示显示 Payout 列
 */
export function shouldShowPayoutColumn(
  merchantId: string | undefined,
): boolean {
  if (!merchantId) return false;
  return MERCHANT_IDS_HAVE_PAYOUT.includes(merchantId);
}
```

---

## 状态显示逻辑

```typescript
/**
 * 获取状态显示文本
 * @param status 原始状态
 * @param settleDate 结算日期
 * @param umfEnabled UMF 是否启用
 * @param hasJkoPay 是否有 JkoPay
 * @param isElavonSite 是否是 Elavon 站点
 * @returns 显示的状态文本
 */
export function getStatusDisplay(
  status: string,
  settleDate: string,
  umfEnabled: boolean,
  hasJkoPay: boolean,
  isElavonSite: boolean,
): string {
  if (umfEnabled || hasJkoPay || isElavonSite) {
    return `Cleared ${settleDate}`;
  }
  return status;
}
```

---

## Transaction Lookup 类型定义

```typescript
// ============================================================
// Transaction Lookup API 相关类型
// ============================================================

/**
 * Transaction Lookup 请求参数
 */
export interface TransactionLookupRequest {
  /** 商户 ID */
  merchantId: string;
  /** 会话 ID */
  sessionId: string;
  /** 每页记录数 */
  rowCount: number;
  /** 页码，从 0 开始 */
  pageNumber: number;
  /** 开始日期，格式: YYYY-MM-DD */
  startDate?: string;
  /** 结束日期，格式: YYYY-MM-DD */
  endDate?: string;
  /** 搜索关键字 */
  searchKey?: string;
  /** 层级 */
  hierarchy?: string;
  /** 选中的 MID */
  selectedMid?: string;
}

/**
 * Transaction Lookup 单条记录
 */
export interface TransactionLookupRecord {
  /** 交易 ID */
  transaction_id: string;
  /** 交易参考号 */
  txn_ref_num: string;
  /** 订单 ID */
  oid: string;
  /** 支付信息 */
  payment_info: string;
  /** 交易类型 */
  transaction_type: string;
  /** 风控分数 */
  score: number | null;
  /** 卡类型名称 */
  card_type_name: string;
  /** 供应商 */
  vendor: string;
  /** 支付网关 */
  payment_gateway: string;
  /** 状态 */
  status: string;
  /** 卡号 */
  card_number: string;
  /** 持卡人姓名 */
  cardholder_name: string;
  /** 交易货币 */
  txn_currency: string;
  /** 交易金额 */
  txn_amt: number;
  /** 服务费 */
  scharge: number;
  /** 捕获金额 */
  capture_amt: number;
  /** 捕获服务费 */
  capture_sc_amt: number;
  /** 退款交易金额 */
  refund_txn_amt: number;
  /** 退款服务费 */
  refund_sc_amt: number;
  /** 授权码 */
  auth_code: string;
  /** 账单地址 */
  billing_address: string;
  /** 配送地址 */
  shipping_address: string;
  /** 电话 */
  phone: string;
  /** 客户邮箱 */
  customer_email: string;
  /** 创建时间 */
  creation_time: string;
  /** 修改时间 */
  modified_time: string;
  /** 交易数据库类型 */
  transaction_db: string;
}

/**
 * Transaction Lookup 响应
 */
export interface TransactionLookupResponse {
  /** 响应状态码 */
  code: number;
  /** 错误消息 */
  message?: string;
  /** 交易记录列表 */
  transactions: TransactionLookupRecord[];
  /** 总记录数 */
  total_records: number;
}

/**
 * Transaction Lookup Store 状态
 */
export interface TransactionLookupState {
  // 数据
  data: TransactionLookupResponse | null;
  loading: boolean;
  error: string | null;

  // 分页
  page: number;
  pageSize: number;

  // 筛选条件
  startDate: string;
  endDate: string;
  searchKey: string;

  // Actions
  fetchTransactions: (params: TransactionLookupRequest) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setFilters: (filters: {
    startDate?: string;
    endDate?: string;
    searchKey?: string;
  }) => void;
  resetFilters: () => void;
  clearData: () => void;
}

/**
 * Action 按钮显示结果
 */
export interface ActionButtonsVisibility {
  /** 显示 Capture 按钮 */
  showCapture: boolean;
  /** 显示 Refund 按钮 */
  showRefund: boolean;
  /** 显示 Cancel 按钮 */
  showCancel: boolean;
  /** 显示状态文本（替代按钮） */
  statusText: string | null;
}
```

---

## POST /transactions_lookup

**描述**: 查询交易记录列表

**请求**:

```typescript
// Content-Type: application/json
{
  "merchantId": "300000157",         // 商户 ID
  "sessionId": "abc123",             // 会话 ID
  "rowCount": 10,                    // 每页条数
  "pageNumber": 0,                   // 页码，从 0 开始
  "startDate": "2024-01-01",         // 开始日期（可选）
  "endDate": "2024-01-31",           // 结束日期（可选）
  "searchKey": "order123",           // 搜索关键字（可选）
  "hierarchy": "",                   // 层级（可选）
  "selectedMid": ""                  // 选中的 MID（可选）
}
```

**成功响应** (code: 200):

```typescript
{
  "code": 200,
  "transactions": [
    {
      "transaction_id": "UPT123456789",
      "txn_ref_num": "REF001",
      "oid": "ORDER001",
      "payment_info": "Card ending 1234",
      "transaction_type": "PURCHASE",
      "score": 25,
      "card_type_name": "Visa",
      "vendor": "VISA",
      "payment_gateway": "stripe",
      "status": "CLEARED",
      "card_number": "****1234",
      "cardholder_name": "John Doe",
      "txn_currency": "USD",
      "txn_amt": 100.00,
      "scharge": 2.50,
      "capture_amt": 102.50,
      "capture_sc_amt": 2.50,
      "refund_txn_amt": 0,
      "refund_sc_amt": 0,
      "auth_code": "AUTH001",
      "billing_address": "123 Main St, City, State 12345",
      "shipping_address": "456 Oak Ave, City, State 67890",
      "phone": "+1-555-123-4567",
      "customer_email": "john@example.com",
      "creation_time": "2024-01-15 10:30:00",
      "modified_time": "2024-01-15 10:30:00",
      "transaction_db": "transaction"
    }
  ],
  "total_records": 100
}
```

**错误响应**:

```typescript
{
  "code": 500,
  "message": "Failed to fetch transactions"
}
```

---

## Action 按钮显示逻辑

```typescript
/**
 * Action 按钮显示结果
 */
export interface ActionButtonsVisibility {
  showCapture: boolean;
  showRefund: boolean;
  showCancel: boolean;
  showStatus: boolean;
  statusText: string;
}

/**
 * 检查值是否为有效数字且大于0
 */
const isPositiveNumber = (value: string | number | undefined): boolean => {
  if (value === undefined || value === null || value === '') return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * 检查值是否为有效数字且小于等于0
 */
const isZeroOrNegative = (value: string | number | undefined): boolean => {
  if (value === undefined || value === null || value === '') return true;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) || num <= 0;
};

/**
 * 检查 payment_method 是否在列表中（大小写不敏感）
 */
const paymentMethodIn = (paymentMethod: string, values: string[]): boolean => {
  const lowerMethod = (paymentMethod || '').toLowerCase();
  return values.some((v) => v.toLowerCase() === lowerMethod);
};

/**
 * 检查 payment_method 是否包含某个字符串（大小写不敏感）
 */
const paymentMethodContains = (
  paymentMethod: string,
  substring: string,
): boolean => {
  const lowerMethod = (paymentMethod || '').toLowerCase();
  return lowerMethod.includes(substring.toLowerCase());
};

/**
 * 获取 UPI 记录的 Action 按钮显示状态 (transaction_db === 'upi')
 */
const getUPIActionButtons = (
  record: TransactionLookupRecord,
  canRefund: boolean,
): ActionButtonsVisibility => {
  const {
    transaction_type,
    tranx_status,
    amount_authorized_remaining,
    remaining_balance,
    amount_captured,
    payment_gateway,
    payment_method,
    amount_refunded,
  } = record;

  const result: ActionButtonsVisibility = {
    showCapture: false,
    showRefund: false,
    showCancel: false,
    showStatus: false,
    statusText: '',
  };

  // 基础 Capture 条件
  let baseShowCapture =
    transaction_type === 'charge' &&
    tranx_status === 'authorized' &&
    isPositiveNumber(amount_authorized_remaining);

  // 基础 Refund 条件
  const refundTypes = [
    'charge',
    'capture',
    'capture_dashboard',
    'capture_online',
  ];
  let baseShowRefund =
    refundTypes.includes(transaction_type) &&
    tranx_status === 'success' &&
    canRefund &&
    isPositiveNumber(remaining_balance);

  // 基础 Cancel 条件
  let baseShowCancel =
    transaction_type === 'charge' &&
    ['authorized', 'pending'].includes(tranx_status) &&
    isZeroOrNegative(amount_captured);

  // 状态文字条件
  if (['pending', 'cancelled'].includes(tranx_status)) {
    result.showStatus = true;
    result.statusText = tranx_status;
  }

  // 特殊网关处理（覆盖基础逻辑）
  const gateway = (payment_gateway || '').toLowerCase();
  const method = (payment_method || '').toLowerCase();

  if (gateway === 'sbps') {
    const sbpsRestrictedMethods = [
      'linepay',
      'paypay',
      'rakutenpay',
      'alipay',
      'upop',
    ];
    const isRestrictedMethod = paymentMethodIn(method, sbpsRestrictedMethods);

    if (baseShowCapture && isRestrictedMethod) baseShowCapture = false;
    if (baseShowCancel && isRestrictedMethod) baseShowCancel = false;
    if (
      baseShowRefund &&
      isRestrictedMethod &&
      !isPositiveNumber(amount_refunded)
    ) {
      baseShowRefund = false;
    }
  } else if (['wechatpay', 'upop', 'alipay', 'fomo', 'aps'].includes(gateway)) {
    if (gateway !== 'upop' && method === 'card') {
      baseShowCapture = false;
      baseShowCancel = false;
    }
  } else if (['flutterwave', 'ppro'].includes(gateway)) {
    if (tranx_status === 'pending') baseShowCancel = false;
  } else if (gateway === 'xendit') {
    if (baseShowCapture && method !== 'card') baseShowCapture = false;
    if (baseShowCancel && method !== 'card') baseShowCancel = false;
    const xenditRefundMethods = [
      'card',
      'shopeepay',
      'gcash',
      'paymaya',
      'grabpay',
    ];
    if (baseShowRefund && !paymentMethodIn(method, xenditRefundMethods))
      baseShowRefund = false;
  } else if (gateway === 'cil') {
    if (baseShowCapture && method !== 'card') baseShowCapture = false;
    if (baseShowCancel && method !== 'card') baseShowCancel = false;
    const cilRefundMethods = [
      'alipay_hk',
      'kor_onlinebanking',
      'payco',
      'kakaopay',
      'naverpay',
      'toss',
      'paypay',
      'linepay',
      'merpay',
      'rakutenpay',
      'au',
      'softbank',
      'ntt_docomo',
      'card',
      'wechatpay',
    ];
    if (baseShowRefund && !paymentMethodIn(method, cilRefundMethods))
      baseShowRefund = false;
  } else if (gateway === 'gmo') {
    baseShowCapture = false;
    baseShowCancel = false;
    const gmoRefundMethods = [
      'paypay',
      'merpay',
      'rakutenpay',
      'au',
      'ntt_docomo',
      'amazon',
    ];
    if (baseShowRefund && !paymentMethodIn(method, gmoRefundMethods))
      baseShowRefund = false;
  }

  result.showCapture = baseShowCapture;
  result.showRefund = baseShowRefund;
  result.showCancel = baseShowCancel;

  return result;
};

/**
 * 获取非 UPI 记录的 Action 按钮显示状态 (transaction_db !== 'upi')
 */
const getNonUPIActionButtons = (
  record: TransactionLookupRecord,
  canRefund: boolean,
  hasPreAuth: boolean,
): ActionButtonsVisibility => {
  const {
    transaction_type,
    tranx_status,
    pre_auth,
    amount_captured,
    remaining_balance,
    payment_gateway,
    payment_method,
  } = record;

  const result: ActionButtonsVisibility = {
    showCapture: false,
    showRefund: false,
    showCancel: false,
    showStatus: false,
    statusText: '',
  };

  const gateway = (payment_gateway || '').toLowerCase();
  const method = (payment_method || '').toLowerCase();

  // hasPreAuth 为 true 时的处理
  if (hasPreAuth) {
    result.showCapture =
      transaction_type === 'pos_payment' &&
      pre_auth === 1 &&
      isZeroOrNegative(amount_captured);

    result.showRefund =
      transaction_type === 'pos_capture' && isPositiveNumber(remaining_balance);

    result.showCancel =
      transaction_type === 'pos_payment' &&
      pre_auth === 1 &&
      isZeroOrNegative(amount_captured);
  }

  // 覆盖逻辑（不是 else）
  const refundTypes = ['charge', 'pos_payment', 'pos_capture'];
  const specialRefundMethods = ['alipay_hk', 'dana', 'gcash', 'kakaopay'];
  const isCupMethod = paymentMethodContains(method, 'cup');
  const isSpecialMethod = paymentMethodIn(method, specialRefundMethods);

  if (
    refundTypes.includes(transaction_type) &&
    !result.showCapture &&
    tranx_status !== 'cancelled' &&
    canRefund &&
    isPositiveNumber(remaining_balance) &&
    (isCupMethod || isSpecialMethod)
  ) {
    result.showRefund = true;
  }

  // upside 网关不显示 Cancel
  if (gateway === 'upside') {
    result.showCancel = false;
  }

  // 状态为 pending/delayed/cancelled 时显示状态文字，不显示 Refund
  if (['pending', 'delayed', 'cancelled'].includes(tranx_status)) {
    result.showStatus = true;
    result.statusText = tranx_status;
    result.showRefund = false;
  }

  return result;
};

/**
 * 获取 Action 列按钮的显示状态
 * @param record 交易记录
 * @param canRefund 用户是否有 refund 权限 (can_refund === 1)
 * @param hasPreAuth 商户是否有 PreAuth
 */
export const getActionButtonsVisibility = (
  record: TransactionLookupRecord,
  canRefund: boolean,
  hasPreAuth: boolean,
): ActionButtonsVisibility => {
  const isUPI = record.transaction_db === 'upi';

  if (isUPI) {
    return getUPIActionButtons(record, canRefund);
  } else {
    return getNonUPIActionButtons(record, canRefund, hasPreAuth);
  }
};
```

---

## Multi Fundings API 类型定义

```typescript
// ============================================================
// Multi Fundings API 相关类型
// ============================================================

/**
 * Multi Fundings 请求参数
 */
export interface MultiFundingsRequest {
  /** 商户 ID */
  merchantId: string;
  /** 会话 ID */
  session_id: string;
  /** 日期筛选，格式: "YYYY-MM-DD" 或空字符串 */
  date_month: string;
  /** 当前页码，从 0 开始 */
  page_number: string;
  /** 每页记录数 */
  row_count: number;
}

/**
 * Multi Fundings 记录
 */
export interface MultiFundingsRecord {
  /** 支付方式 */
  funding: string;
  /** 交易数量 */
  count: number;
  /** Gross 金额 */
  sum: number;
  /** Payout 金额 */
  settled: number;
  /** 发生日期 */
  happenedDate: string;
  /** 时区 */
  timezone: string;
  /** 货币 */
  currency: string;
}

/**
 * Multi Fundings 响应
 */
export interface MultiFundingsResponse {
  /** 响应码 */
  code: string;
  /** 数据列表（使用 aliDirect 字段名） */
  aliDirect: MultiFundingsRecord[];
  /** 总记录数 */
  total_records: number;
}

/**
 * Multi Fundings Store 状态
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
```

---

## POST /tranx/multi_fundings

**描述**: 获取多渠道资金结算数据

**请求**:

```typescript
// Content-Type: application/json
{
  "merchantId": "300000157",         // 商户 ID
  "session_id": "abc123",            // 会话 ID
  "date_month": "",                  // 日期筛选，空字符串获取所有
  "page_number": "0",                // 页码，从 0 开始
  "row_count": 10                    // 每页条数
}
```

**成功响应**:

```typescript
{
  "code": "200",
  "aliDirect": [
    {
      "funding": "PAYPAL",
      "count": 15,
      "sum": 1500.00,
      "settled": 1450.00,
      "happenedDate": "2026-01-20(America/Los_Angeles)",
      "timezone": "America/Los_Angeles",
      "currency": "USD"
    }
  ],
  "total_records": 50
}
```

---

## Reserve Summary API 类型定义

```typescript
// ============================================================
// Reserve Summary API 相关类型
// ============================================================

/**
 * Reserve Summary 请求参数
 */
export interface ReserveSummaryRequest {
  /** 商户节点的 ID */
  hierarchy_user_id: number;
  /** 商户 ID */
  merchantId: string;
  /** 会话 ID */
  session_id: string;
  /** 搜索类型，固定为 "reserve" */
  search_type: 'reserve';
  /** 日期筛选，空字符串 */
  date_month: string;
  /** 争议类型，固定为 "all" */
  disputeType: string;
  /** 当前页码，从 0 开始 */
  page_number: string;
  /** 每页记录数 */
  row_count: number;
}

/**
 * Fixed Reserve 记录
 */
export interface FixedReserveRecord {
  /** 记录 ID */
  id: string;
  /** 商户 ID */
  merchant_id: string;
  /** 类型 */
  type: 'fixed';
  /** 总金额 */
  total_amount: number | null;
  /** 状态 */
  status: string;
  /** 内容 JSON，包含 term 等信息 */
  content: string;
  /** 开始日期 */
  start_date: string;
  /** 结束日期 */
  end_date: string | null;
  /** 支付时间 */
  time_paid: string | null;
  /** 释放时间 */
  time_released: string | null;
  /** 创建时间 */
  time_created: string;
  /** 更新时间 */
  time_updated: string;
}

/**
 * Rolling Reserve 记录
 */
export interface RollingReserveRecord {
  /** 记录 ID */
  id: string;
  /** 商户 ID */
  merchant_id: string;
  /** 类型 */
  type: 'rolling';
  /** 总金额 */
  total_amount: number | null;
  /** 状态 */
  status: string;
  /** 内容 JSON，包含 percent, start_date, rolling_period */
  content: string;
  /** 开始日期 */
  start_date: string;
  /** 结束日期 */
  end_date: string | null;
  /** 支付时间 */
  time_paid: string | null;
  /** 释放时间 */
  time_released: string | null;
  /** 创建时间 */
  time_created: string;
  /** 更新时间 */
  time_updated: string;
}

/**
 * Rolling Detail 交易记录
 */
export interface RollingDetailRecord {
  /** 预扣金额 */
  withheld: number;
  /** 释放金额 */
  released: number;
  /** 净额 */
  net: number;
  /** 日期 */
  date: string;
}

/**
 * Rolling Detail
 */
export interface RollingDetail {
  /** 交易记录 */
  transactions: RollingDetailRecord[];
  /** 总记录数 */
  total_records: number;
}

/**
 * Reserve Summary 响应
 */
export interface ReserveSummaryResponse {
  /** 响应码 */
  code: number;
  /** 商户信息 */
  merchant_info: {
    currency: string;
  };
  /** Fixed Reserves */
  fixed_reserves: FixedReserveRecord[];
  /** Rolling Reserves */
  rolling_reserves: RollingReserveRecord[];
  /** Rolling Detail */
  rolling_detail: RollingDetail;
  /** 是否有 UPI */
  hasUPI: boolean;
  /** 是否有争议子项 */
  hasDisputeChild: boolean;
  /** 是否有 JkoPay */
  hasJkoPay: boolean;
  /** 网关 */
  gateway: string;
  /** 是否有预授权 */
  hasPreAuth: boolean;
  /** 是否支持争议管理 */
  disputeManage: boolean;
  /** 是否有 Reserve */
  hasReserve: boolean;
  /** 是否有分项费用 */
  hasItemizedFee: boolean;
  /** 层级用户数据 */
  hierarchy_user_data: HierarchyUserData;
}

/**
 * Reserve Summary Store 状态
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
```

---

## POST /tranx/summary (search_type: reserve)

**描述**: 获取储备金汇总数据

**请求**:

```typescript
// Content-Type: application/json
{
  "hierarchy_user_id": 111,
  "merchantId": "300000157",
  "session_id": "abc123",
  "search_type": "reserve",
  "date_month": "",
  "disputeType": "all",
  "page_number": "0",
  "row_count": 10
}
```

**成功响应**:

```typescript
{
  "code": 200,
  "merchant_info": {
    "currency": "USD"
  },
  "fixed_reserves": [
    {
      "id": "1",
      "merchant_id": "300000157",
      "type": "fixed",
      "total_amount": 5000,
      "status": "active",
      "content": "{\"term\": \"6 months\"}",
      "start_date": "2025-01-01",
      "end_date": "2025-07-01",
      "time_paid": null,
      "time_released": null,
      "time_created": "2025-01-01 00:00:00",
      "time_updated": "2025-01-01 00:00:00"
    }
  ],
  "rolling_reserves": [
    {
      "id": "2",
      "merchant_id": "300000157",
      "type": "rolling",
      "total_amount": null,
      "status": "active",
      "content": "{\"percent\": 10, \"start_date\": \"2025-01-01\", \"rolling_period\": \"6 months\"}",
      "start_date": "2025-01-01",
      "end_date": null,
      "time_paid": null,
      "time_released": null,
      "time_created": "2025-01-01 00:00:00",
      "time_updated": "2025-01-01 00:00:00"
    }
  ],
  "rolling_detail": {
    "transactions": [
      {
        "withheld": 100,
        "released": 50,
        "net": 50,
        "date": "2026-01-20"
      }
    ],
    "total_records": 30
  },
  "hasUPI": false,
  "hasDisputeChild": false,
  "hasJkoPay": false,
  "gateway": "",
  "hasPreAuth": true,
  "disputeManage": false,
  "hasReserve": true,
  "hasItemizedFee": false,
  "hierarchy_user_data": {
    "description": null,
    "id": 1557,
    "label": null,
    "merchant_id": "300000157",
    "name": "Test Merchant",
    "parent_id": 105
  }
}
```

---

## UserConfig 类型定义

```typescript
/**
 * 用户配置（从 authStore.config 解析）
 */
export interface UserConfig {
  MFA?: boolean;
  /** 禁用日报详情 */
  detail_daily_report_disable?: string;
  /** 禁用月报详情 */
  detail_monthly_report_disable?: string;
  /** 禁用 Daily Summary */
  daily_summary_disable?: boolean;
  /** 禁用 Monthly Summary */
  monthly_summary_disable?: boolean;
  /** 禁用 Transaction Lookup */
  transactions_lookup_disable?: boolean;
  /** 禁用 Daily Dispute Summary */
  daily_dispute_summary_disable?: boolean;
  /** 启用 Dispute Manage */
  dispute_manage?: boolean;
  /** 禁用 Reserve Summary */
  reserve_summary_disable?: boolean;
}

/**
 * 解析 config 字符串为 UserConfig 对象
 */
export const parseUserConfig = (config: string): UserConfig => {
  if (!config) return {};
  try {
    return JSON.parse(config) as UserConfig;
  } catch {
    return {};
  }
};
```

---

## Daily Detail Report API 类型定义

> **实现状态**: ✅ 已完成
> **相关文件**: `src/types/dashboard.ts`, `src/services/api/summaryApi.ts`

```typescript
// ============================================================
// Daily Detail Report API 相关类型
// ============================================================

/**
 * Daily Detail Report 请求参数
 */
export interface DailyDetailReportRequest {
  /** 商户 ID */
  merchantId: string;
  /** 日期，格式 "YYYY-MM-DD" */
  date: string;
  /** 会话 ID */
  sessionId: string;
  /** 是否是 ISV，记录中的 0 就是 false */
  isIsv: boolean;
  /** 报告类型：daily 或 settle */
  type?: 'daily' | 'settle';
}

/**
 * Monthly Detail Report 请求参数
 */
export interface MonthlyDetailReportRequest {
  /** 商户 ID */
  merchantId: string;
  /** 月份，格式 "Jul 2024" */
  month: string;
  /** 会话 ID */
  sessionId: string;
  /** 是否是 ISV */
  isIsv: boolean;
}

/**
 * Daily Detail Report 交易记录
 */
export interface DailyDetailTransaction {
  /** 交易 ID */
  transaction_id: string;
  /** 引用 ID */
  reference: string | null;
  /** 货币类型 */
  currency: string;
  /** 交易类型 */
  transaction_type: string;
  /** 支付方式 */
  payment_method: string;
  /** 买家 ID */
  buyer_id: string;
  /** 创建时间 */
  time_created: string | null;
  /** 本地创建时间 */
  time_created_local: string | null;
  /** 总额 */
  total: number;
  /** 商户固定费用 */
  merchant_fixed: number;
  /** 净额 */
  net: number;
  /** 小费 */
  tip: number;
  /** 状态 */
  status: string | null;
  /** 结算时间 */
  time_settled: string | null;
  /** 商户折扣 */
  merchant_discount: number;
  /** VAT 费用 */
  vat_fee: number;
  /** 退款费用 */
  refund_fee: number | null;
}

/**
 * 交易汇总信息
 */
export interface TransactionInfo {
  /** 总交易数量 */
  total_transactions: number;
  /** 分项交易数量 */
  item_transactions: number;
  /** 总额 */
  gross: number;
  /** 小费合计 */
  tip_total: number;
  /** 费用 */
  fees: number;
  /** 净额 */
  net: number;
  /** VAT 费用 */
  vat_fee: number;
  /** 退款费用 */
  refund_fee: number;
  /** 子汇总（按支付方式分组） */
  subs: TransactionInfoSub[];
  /** Reserve 金额 */
  reserve?: number;
  /** Itemized Fee 金额 */
  itemized_fee?: number;
  /** Apex Fee (Misc Fee) 金额 */
  apex_fee?: number;
}

/**
 * Daily Detail Report 响应
 */
export interface DailyDetailReportResponse {
  /** 是否是 ISV */
  is_isv: boolean;
  /** 总记录数 */
  totalRecords: number;
  /** 商户 ID */
  merchant_id: string;
  /** 商户名称 */
  merchant_name: string;
  /** 店铺名称 */
  store_name: string;
  /** 时区缩写 */
  timezone_short: string;
  /** 商户时区 */
  mttimezone: string;
  /** 结算开始时间 */
  settlement_begin: string | null;
  /** 结算结束时间 */
  settlement_end: string | null;
  /** 商户费率 */
  merchant_rate: string;
  /** 商户固定费用 */
  merchant_fixed_fee: string;
  /** 状态 */
  status: string;
  /** 货币类型 */
  currency: string;
  /** 交易记录列表 */
  transactions: DailyDetailTransaction[];
  /** Dispute 记录列表 */
  disputes: DailyDetailDispute[];
  /** Monthly Fee 记录列表 */
  monthlyFee: DailyDetailMonthlyFee[];
  /** Settlement Fee 记录列表 */
  settlementFee: DailyDetailSettlementFee[];
  /** Reserve 记录列表 */
  reserve: DailyDetailReserve[];
  /** Itemized Fee 记录列表 */
  itemizedFee: DailyDetailItemizedFee[];
  /** Apex Fee (Misc Fee) 记录列表 */
  apexFee: DailyDetailApexFee[];
  /** Pending 交易汇总 (Daily only) */
  pending_transactions_info?: TransactionInfo;
  /** Settled 交易汇总 (Daily only) */
  settled_transactions_info?: TransactionInfo;
  /** 交易汇总 (Monthly only) */
  transactions_info?: TransactionInfo;
  /** 当天/当月净额合计 */
  total_net: number;
}
```

---

## VAT 显示规则

> **实现状态**: ✅ 已完成
> **相关文件**: `src/types/dashboard.ts`

```typescript
/**
 * 需要显示 VAT 的 gateway 支付方式列表
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
 * 根据 gateway 判断是否显示 VAT
 * @param gateway 网关字符串
 * @returns 是否显示 VAT
 */
export const shouldShowVAT = (gateway: string): boolean => {
  if (!gateway) return false;
  const lowerGateway = gateway.toLowerCase();
  return VAT_DISPLAY_GATEWAYS.some((g) => lowerGateway.includes(g));
};
```

---

## 货币格式化工具

> **实现状态**: ✅ 已完成
> **相关文件**: `src/utils/currency.ts`

```typescript
/**
 * 货币符号映射（支持 30+ 种货币）
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CNY: '¥',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  HKD: 'HK$',
  SGD: 'S$',
  TWD: 'NT$',
  KRW: '₩',
  THB: '฿',
  MYR: 'RM',
  PHP: '₱',
  IDR: 'Rp',
  VND: '₫',
  KWD: 'KD',
  CLP: 'CLP$',
  ISK: 'kr',
  INR: '₹',
  BRL: 'R$',
  MXN: 'MX$',
  NZD: 'NZ$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  ZAR: 'R',
  AED: 'AED',
  SAR: 'SAR',
};

/**
 * 无小数位的货币类型
 */
const NO_DECIMAL_CURRENCIES = ['KRW', 'JPY', 'CLP', 'ISK'];

/**
 * 三位小数的货币类型
 */
const THREE_DECIMAL_CURRENCIES = ['KWD'];

/**
 * 格式化金额
 * @param amount 金额数值（数据库中的值，通常是最小单位）
 * @param currency 货币代码
 * @param options 可选配置
 * @returns 格式化后的金额字符串
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string,
  options?: FormatCurrencyOptions,
): string;
```

---

## 下载工具函数

> **实现状态**: ✅ 已完成
> **相关文件**: `src/utils/download.ts`

支持以下下载功能：

| 函数名                          | 用途                          |
| ------------------------------- | ----------------------------- |
| `downloadCSV`                   | 通用 CSV 文件下载             |
| `downloadPDF`                   | PDF Blob 文件下载             |
| `generateDailySummaryCSV`       | 生成 Daily Summary CSV        |
| `generateMonthlySummaryCSV`     | 生成 Monthly Summary CSV      |
| `generateTransactionLookupCSV`  | 生成 Transaction Lookup CSV   |
| `generateDisputeSummaryCSV`     | 生成 Dispute Summary CSV      |
| `generateDailySettleSummaryCSV` | 生成 Daily Settle Summary CSV |
| `generateDetailReportCSV`       | 生成 Detail Report CSV        |

---

## All Transactions Search API 类型定义

> **实现状态**: ✅ 已完成
> **相关文件**: `src/services/api/allTransactionsApi.ts`, `src/stores/allTransactionsStore.ts`

```typescript
/**
 * All Transactions Search 请求参数
 */
export interface AllTransactionsSearchRequest {
  sessionId: string;
  rowCount: number;
  pageNumber: number;
  startDate: string;
  endDate: string;
  searchKey: string;
  timezone: string;
  download: boolean;
}

/**
 * All Transactions Search 响应
 */
export interface AllTransactionsSearchResponse {
  totalRecords: string;
  transactions: TransactionRecord[];
}

/**
 * All Transactions Store 状态
 */
export interface AllTransactionsState {
  data: AllTransactionsSearchResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
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
```

---

## Transaction Lookup 列配置

> **实现状态**: ✅ 已完成
> **相关文件**: `src/types/dashboard.ts`, `src/stores/transactionLookupStore.ts`

```typescript
/**
 * 可配置显示/隐藏的列定义
 */
export interface ConfigurableColumn {
  key: string;
  title: string;
  defaultVisible: boolean;
}

/**
 * 可配置的列列表
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
 * Transaction Lookup Store 支持列配置持久化
 * 列配置按 merchantId 分别存储到 localStorage
 */
export interface TransactionLookupState {
  // ... 其他字段
  columnConfig: Record<string, string[]>;
  setColumnConfig: (merchantId: string, visibleColumns: string[]) => void;
  getVisibleColumns: (merchantId: string) => string[];
}
```

## Transaction Action API

> **实现状态**: ✅ Refund/Capture/Cancel 已完成
> **最后更新**: 2026-02-05
> **相关文件**: `src/services/api/transactionLookupApi.ts`, `src/components/dashboard/TransactionLookup/RefundModal.tsx`, `src/components/dashboard/TransactionLookup/CaptureModal.tsx`, `src/components/dashboard/TransactionLookup/CancelConfirmModal.tsx`

### Refund 接口

**POST /transaction_action/refund**

```typescript
/**
 * Refund 请求参数
 */
export interface RefundRequest {
  /** 商户 ID */
  merchantId: string;
  /** 交易 ID */
  transactionId: string;
  /** 退款金额（字符串格式） */
  amount: string;
  /** 货币代码 */
  currency: string;
  /** 退款原因 */
  reason: string;
  /** 交易数据库 */
  transactionDb: string;
  /** 会话 ID */
  sessionId: string;
  /** 交易类型 */
  type: string;
  /** 原始参考号 */
  originReference: string;
  /** 支付供应商 */
  vendor: string;
  /** 来源 */
  source: string | null;
  /** 网关 */
  gateway: string;
  /** 是否预授权 */
  pre_auth: boolean;
}

/**
 * Transaction Action 响应（Refund/Capture/Cancel 通用）
 */
export interface TransactionActionResponse {
  /** 响应状态码，200 表示成功 */
  code: number;
  /** 响应消息 */
  message: string;
}
```

**请求示例**：

```json
{
  "merchantId": "20220001",
  "transactionId": "4000260593396849164293",
  "amount": "2.99",
  "currency": "USD",
  "reason": "Customer requested refund",
  "transactionDb": "upi",
  "sessionId": "1a933ebc5315b2cc003b5b1d0f4a4c42",
  "type": "",
  "originReference": "811-372-8148",
  "vendor": "upop",
  "source": null,
  "gateway": "upop",
  "pre_auth": false
}
```

**成功响应**：

```json
{
  "code": 200,
  "message": "success"
}
```

**失败响应**：

```json
{
  "code": 500,
  "message": "Refund failed: insufficient balance"
}
```

### Capture 接口

**POST /transaction_action/capture**

```typescript
/**
 * Capture 请求参数
 */
export interface CaptureRequest {
  /** 商户 ID（来自列表接口响应根节点的 merchant_id） */
  merchantId: string;
  /** 交易 ID */
  transactionId: string;
  /** 捕获金额（字符串格式） */
  amount: string;
  /** 货币代码 */
  currency: string;
  /** 交易数据库 */
  transactionDb: string;
  /** 会话 ID */
  sessionId: string;
  /** 是否多次捕获 */
  multi_capture: boolean;
  /** 是否最后一次捕获 */
  last_capture: boolean;
  /** 来源 */
  source: string | null;
  /** 是否预授权 */
  pre_auth: boolean;
}
```

**请求示例**：

```json
{
  "merchantId": "20221011",
  "transactionId": "4000218305616214806533",
  "amount": "10.00",
  "currency": "USD",
  "transactionDb": "upi",
  "sessionId": "1a933ebc5315b2cc003b5b1d0f4a4c42",
  "multi_capture": false,
  "last_capture": false,
  "source": null,
  "pre_auth": true
}
```

**UI 组件说明**：

- 弹窗标题：`Capture`
- 只读字段：Transaction ID, Reference, Date/Time, Original Amount, Currency
- 可编辑字段：Capture Amount（默认为剩余授权金额）
- 复选框：
  - **Multi-Capture**: 选中时表示将在单次授权上执行多次捕获
  - **Last Capture**: 选中时表示这是最后一次捕获，将释放剩余授权金额
- 提示：`* If a transaction is partially captured the remaining authorization amount will be released`
- 验证规则：
  - Capture Amount 必须 > 0
  - Capture Amount 不能超过剩余授权金额
  - 金额小数位必须符合货币规则

### Cancel 接口

**POST /transaction_action/cancel**

```typescript
/**
 * Cancel 请求参数
 */
export interface CancelRequest {
  /** 商户 ID（来自列表接口响应根节点的 merchant_id） */
  merchantId: string;
  /** 交易 ID */
  transactionId: string;
  /** 交易数据库 */
  transactionDb: string;
  /** 会话 ID */
  sessionId: string;
  /** 来源 */
  source: string | null;
  /** 是否预授权 */
  pre_auth: boolean;
}
```

**请求示例**：

```json
{
  "merchantId": "20221011",
  "transactionId": "4000218305616214806533",
  "transactionDb": "upi",
  "sessionId": "1a933ebc5315b2cc003b5b1d0f4a4c42",
  "source": null,
  "pre_auth": false
}
```

**UI 组件说明**：

- 无标题确认弹窗
- 显示内容：`Do you want to cancel this transaction?`
- 按钮：`No`（关闭弹窗）/ `Yes`（执行取消操作）
- 错误处理：取消失败时错误信息显示在弹窗内，不关闭弹窗
- 成功处理：显示成功消息，关闭弹窗，刷新列表

## 货币金额验证工具

> **实现状态**: ✅ 已完成
> **相关文件**: `src/utils/currency.ts`

### 验证函数

```typescript
/**
 * 获取货币的小数位数
 */
export function getCurrencyDecimalPlaces(currency: string): number;

/**
 * 验证金额是否符合货币小数位规则
 */
export function validateCurrencyAmount(
  amount: string,
  currency: string,
): { valid: boolean; message?: string };

/**
 * 将数据库存储的金额转换为显示金额
 */
export function convertDbAmountToDisplay(
  amount: number | string,
  currency: string,
): number;

/**
 * 将显示金额转换为数据库存储的金额
 */
export function convertDisplayAmountToDb(
  amount: number | string,
  currency: string,
): number;
```

### 货币小数位规则

| 货币类型分类 | 货币代码                | 小数位数 |
| ------------ | ----------------------- | -------- |
| 无小数位货币 | KRW, JPY, CLP, ISK, IDR | 0 位     |
| 三位小数货币 | KWD                     | 3 位     |
| 其他货币     | USD, CNY, EUR 等        | 2 位     |

## Action 按钮显示规则

> **实现状态**: ✅ 已完成
> **最后更新**: 2026-02-11
> **相关文件**: `src/utils/transactionLookup.ts`

### 核心接口

```typescript
/**
 * Action 按钮显示结果
 */
export interface ActionButtonsVisibility {
  showCapture: boolean; // 是否显示 Capture 按钮
  showRefund: boolean; // 是否显示 Refund 按钮
  showCancel: boolean; // 是否显示 Cancel 按钮
  showStatus: boolean; // 是否显示状态文字（替代按钮）
  statusText: string; // 状态文字内容
}

/**
 * 获取 Action 列按钮的显示状态
 */
export function getActionButtonsVisibility(
  record: TransactionLookupRecord,
  canRefund: boolean,
  hasPreAuth: boolean,
): ActionButtonsVisibility;
```

### UPI 交易规则 (transaction_db === 'upi')

#### 基础条件

| 按钮    | 条件                                                                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capture | `transaction_type === 'charge'` AND `tranx_status === 'authorized'` AND `amount_authorized_remaining > 0`                                                              |
| Refund  | `transaction_type` ∈ `['charge','capture','capture_dashboard','capture_online']` AND `tranx_status === 'success'` AND `canRefund === true` AND `remaining_balance > 0` |
| Cancel  | `transaction_type === 'charge'` AND `tranx_status` ∈ `['authorized','pending']` AND `amount_captured <= 0`                                                             |
| Status  | `tranx_status` ∈ `['pending','cancelled']` → 显示状态文字                                                                                                              |

#### 网关特殊规则

基础条件满足后，根据 `payment_gateway` 应用以下覆盖规则：

**SBPS 网关** (`payment_gateway === 'sbps'`)

受限支付方法: `linepay`, `paypay`, `rakutenpay`, `alipay`, `upop`

| 操作    | 规则                                      |
| ------- | ----------------------------------------- |
| Capture | 受限方法 → 禁用                           |
| Cancel  | 受限方法 → 禁用                           |
| Refund  | 受限方法 且 `amount_refunded <= 0` → 禁用 |

**Wechatpay/UPOP/Alipay/Fomo/APS 网关**

| 操作    | 规则                                                     |
| ------- | -------------------------------------------------------- |
| Capture | 禁用（除非 `gateway === 'upop'` 且 `method === 'card'`） |
| Cancel  | 禁用（除非 `gateway === 'upop'` 且 `method === 'card'`） |
| Refund  | 保持基础规则                                             |

**Xendit 网关** (`payment_gateway === 'xendit'`)

| 操作    | 规则                                                                            |
| ------- | ------------------------------------------------------------------------------- |
| Capture | 仅 `payment_method === 'card'` 时显示                                           |
| Cancel  | 仅 `payment_method === 'card'` 时显示                                           |
| Refund  | 仅 `payment_method` ∈ `['card','shopeepay','gcash','paymaya','grabpay']` 时显示 |

**CIL 网关** (`payment_gateway === 'cil'`)

| 操作    | 规则                                  |
| ------- | ------------------------------------- |
| Capture | 仅 `payment_method === 'card'` 时显示 |
| Cancel  | 仅 `payment_method === 'card'` 时显示 |
| Refund  | 仅指定方法\*时显示                    |

\*CIL Refund 支持方法: `alipay_hk`, `kor_onlinebanking`, `payco`, `kakaopay`, `naverpay`, `toss`, `paypay`, `linepay`, `merpay`, `rakutenpay`, `au`, `softbank`, `ntt_docomo`, `card`, `wechatpay`

**GMO 网关** (`payment_gateway === 'gmo'`)

| 操作    | 规则                                                                                       |
| ------- | ------------------------------------------------------------------------------------------ |
| Capture | 禁用                                                                                       |
| Cancel  | 禁用                                                                                       |
| Refund  | 仅 `payment_method` ∈ `['paypay','merpay','rakutenpay','au','ntt_docomo','amazon']` 时显示 |

**Flutterwave/PPRO 网关**

| 操作   | 规则                                |
| ------ | ----------------------------------- |
| Cancel | `tranx_status === 'pending'` 时禁用 |

### 非 UPI 交易规则 (transaction_db !== 'upi')

#### PreAuth 模式 (hasPreAuth === true)

| 按钮    | 条件                                                                                 |
| ------- | ------------------------------------------------------------------------------------ |
| Capture | `transaction_type === 'pos_payment'` AND `pre_auth === 1` AND `amount_captured <= 0` |
| Cancel  | `transaction_type === 'pos_payment'` AND `pre_auth === 1` AND `amount_captured <= 0` |
| Refund  | `transaction_type === 'pos_capture'` AND `remaining_balance > 0`                     |

#### 特殊支付方法 Refund

当不满足 PreAuth 条件时，以下情况也可显示 Refund：

```
transaction_type ∈ ['charge','pos_payment','pos_capture']
AND showCapture === false
AND tranx_status !== 'cancelled'
AND canRefund === true
AND remaining_balance > 0
AND (payment_method 包含 'cup' OR payment_method ∈ ['alipay_hk','dana','gcash','kakaopay'])
```

#### 状态覆盖

| 条件                                                 | 效果                      |
| ---------------------------------------------------- | ------------------------- |
| `tranx_status` ∈ `['pending','delayed','cancelled']` | 显示状态文字，隐藏 Refund |
| `payment_gateway === 'upside'`                       | 隐藏 Cancel               |

### Action 列标题逻辑

```typescript
function getActionColumnTitle(hasUPI: boolean, hasPreAuth: boolean): string {
  // 如果有 UPI 交易或 PreAuth，列标题为 "Action"（可能有多种操作）
  // 否则列标题为 "Refund"（只有退款操作）
  return hasUPI || hasPreAuth ? 'Action' : 'Refund';
}
```
