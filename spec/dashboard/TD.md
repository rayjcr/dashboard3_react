# Dashboard 模块 - 技术设计文档

> 版本: 1.0  
> 最后更新: 2026-02-10  
> 状态: ✅ 已实现

---

## 目录

1. [概述](#1-概述)
2. [架构设计](#2-架构设计)
3. [功能模块](#3-功能模块)
4. [状态管理](#4-状态管理)
5. [API 契约](#5-api-契约)
6. [组件设计](#6-组件设计)
7. [数据处理](#7-数据处理)
8. [用户交互流程](#8-用户交互流程)
9. [性能优化](#9-性能优化)
10. [主题与样式](#10-主题与样式)
11. [测试策略](#11-测试策略)

---

## 1. 概述

### 1.1 模块简介

Dashboard 模块是应用的核心数据展示模块，用户通过点击左侧 TreeMenu 选择商户节点后，在 Dashboard 页面查看该商户或商户组的统计数据。模块包含 8 个功能 Tab，支持多种数据视图和交易操作。

### 1.2 核心功能

| 功能模块             | Tab Key         | 实现状态 | 说明           |
| -------------------- | --------------- | -------- | -------------- |
| Daily Summary        | `daily`         | ✅       | 每日交易汇总   |
| Monthly Summary      | `monthly`       | ✅       | 每月交易汇总   |
| Transaction Lookup   | `transaction`   | ✅       | 交易查询与操作 |
| Daily Settle Summary | `settle`        | ✅       | 每日结算汇总   |
| Dispute Summary      | `dispute`       | ✅       | 争议列表       |
| Alipay Direct        | `alipay`        | ✅       | 支付宝直连结算 |
| Multi Fundings       | `multiFundings` | ✅       | 多渠道资金结算 |
| Reserve Summary      | `reserve`       | ✅       | 储备金汇总     |
| Smart Gateway        | `smartGateway`  | 🔜       | Coming Soon    |

### 1.3 独立页面

| 页面                    | 路由               | 实现状态 | 说明                                  |
| ----------------------- | ------------------ | -------- | ------------------------------------- |
| All Transactions Search | `/alltransactions` | ✅       | 全局交易搜索                          |
| Detail Report           | `/detail`          | ✅       | 详情报表（支持 Daily/Monthly/Settle） |

### 1.4 设计原则

- **按需加载**: 默认只加载 Daily Summary，切换 Tab 时加载对应数据
- **请求取消**: 切换节点或 Tab 时取消未完成的请求
- **状态持久化**: Tab 状态通过 URL 参数持久化，支持浏览器后退
- **缓存策略**: 已加载的 Tab 数据缓存在 Store，避免重复请求

---

## 2. 架构设计

### 2.1 模块结构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DashboardPage                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      商户信息栏                                     │  │
│  │  🏪 Merchant Name | MID: 634201701345000 | Type: Leaf              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         Tabs                                       │  │
│  │  ┌─────────┬──────────┬─────────────────┬──────────────┬────────┐ │  │
│  │  │  Daily  │ Monthly  │ Transaction     │ Daily Settle │ ...    │ │  │
│  │  │ Summary │ Summary  │ Lookup          │ Summary      │        │ │  │
│  │  └─────────┴──────────┴─────────────────┴──────────────┴────────┘ │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                    DateFilter                                │  │  │
│  │  │  📅 Date Picker  [Search]                                    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Data Table                                │  │  │
│  │  │  ┌──────────┬────────────┬───────┬───────┬────────────────┐ │  │  │
│  │  │  │ Date     │ Total Tranx│ Gross │ Net   │ Payment Methods│ │  │  │
│  │  │  ├──────────┼────────────┼───────┼───────┼────────────────┤ │  │  │
│  │  │  │ 2026-01  │ 1,234      │ $5,000│ $4,500│ Alipay, WeChat │ │  │  │
│  │  │  └──────────┴────────────┴───────┴───────┴────────────────┘ │  │  │
│  │  │                      Pagination                              │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │                  Download Buttons                            │  │  │
│  │  │            [Download CSV]  [Download PDF]                    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 文件结构

```
src/
├── pages/
│   ├── DashboardPage.tsx           # Dashboard 主页面
│   ├── AllTransactionsPage.tsx     # 全局交易搜索页面
│   └── DailyDetailReportPage.tsx   # 详情报表页面 (/detail，支持 Daily/Monthly/Settle)
├── components/dashboard/
│   ├── DailySummaryTable.tsx       # 日报表格
│   ├── MonthlySummaryTable.tsx     # 月报表格
│   ├── DailySettleSummaryTable.tsx # 日结表格
│   ├── DateFilter.tsx              # 日期筛选组件
│   ├── DownloadButtons.tsx         # 下载按钮组件
│   ├── EmptyData.tsx               # 空数据提示
│   ├── dashboard.css               # Dashboard 样式
│   ├── TransactionLookup/          # 交易查询模块
│   │   ├── TransactionLookupTable.tsx
│   │   ├── RefundModal.tsx
│   │   ├── CaptureModal.tsx
│   │   └── CancelConfirmModal.tsx
│   ├── DisputeSummary/             # 争议模块
│   ├── AliDirectSettlement/        # 支付宝直连模块
│   ├── MultiFundings/              # 多渠道资金模块
│   ├── ReserveSummary/             # 储备金模块
│   └── AllTransactionsSearch/      # 全局搜索模块
├── stores/
│   ├── dashboardStore.ts           # Dashboard 状态
│   ├── transactionLookupStore.ts   # 交易查询状态
│   ├── disputeStore.ts             # 争议状态
│   ├── aliDirectStore.ts           # 支付宝直连状态
│   ├── multiFundingsStore.ts       # 多渠道资金状态
│   ├── reserveSummaryStore.ts      # 储备金状态
│   └── allTransactionsStore.ts     # 全局搜索状态
├── services/api/
│   ├── summaryApi.ts               # Summary API
│   ├── transactionLookupApi.ts     # 交易查询 API
│   ├── disputeApi.ts               # 争议 API
│   ├── aliDirectApi.ts             # 支付宝直连 API
│   ├── multiFundingsApi.ts         # 多渠道资金 API
│   ├── reserveSummaryApi.ts        # 储备金 API
│   └── allTransactionsApi.ts       # 全局搜索 API
├── utils/
│   ├── currency.ts                 # 货币格式化
│   ├── dashboard.ts                # Dashboard 工具函数
│   ├── download.ts                 # 下载功能
│   └── transactionLookup.ts        # Action 按钮逻辑
└── types/
    └── dashboard.ts                # 类型定义
```

### 2.3 技术栈

| 技术           | 用途      |
| -------------- | --------- |
| React 18       | UI 框架   |
| Ant Design 5.x | UI 组件库 |
| Zustand        | 状态管理  |
| React Router 6 | 路由管理  |
| Axios          | HTTP 请求 |
| Day.js         | 日期处理  |
| Lodash         | 工具函数  |

---

## 3. 功能模块

### 3.1 Daily Summary

**功能**: 展示每日交易汇总数据

**表格列**:

| 列名                 | 字段         | 说明                          |
| -------------------- | ------------ | ----------------------------- |
| Date (Creation Time) | `date_month` | 可点击查看详情（子商户）      |
| Total Tranx          | `num_tran`   | 交易总数                      |
| Gross                | `gross`      | 总额，显示货币符号            |
| Net                  | `net`        | 净额，显示货币符号            |
| Payout               | `payout`     | 仅特定商户显示（19 个白名单） |
| Status               | `status`     | Elavon 商户显示 `Status*`     |
| Payment Methods      | `vendor`     | 支付方式                      |

**特殊逻辑**:

- Payout 列仅对特定 19 个商户 ID 显示
- 详情点击：子商户（有 merchantId）可点击，父节点不可点击
- 特殊状态显示：`umfEnabled` 或 `hasJkoPay` 或 `isElavonSite` 为 true 时，Status 显示 `Cleared {settle_date}`

### 3.2 Monthly Summary

**功能**: 展示每月交易汇总数据

**表格列**:

| 列名            | 字段         | 说明                     |
| --------------- | ------------ | ------------------------ |
| Month           | `date_month` | 可点击查看详情（子商户） |
| Total Tranx     | `num_tran`   | 交易总数                 |
| Gross           | `gross`      | 总额，显示货币符号       |
| Net\*           | `net`        | 净额，显示货币符号       |
| Payment Methods | `vendor`     | 支付方式                 |

### 3.3 Transaction Lookup

**功能**: 交易查询与操作（Refund/Capture/Cancel）

**筛选组件**:

- Date Range: 选择开始和结束日期
- Keyword: 搜索关键字（UPT/Ref/Name/Card/OID）
- Search 按钮

**表格列**: 28 列，总宽度 3000px，支持横向滚动

**Action 按钮逻辑**:

- 根据 `transaction_db`（UPI/非 UPI）执行不同逻辑
- 根据 `payment_gateway` 执行特殊网关处理
- 根据用户权限（`can_refund`）控制 Refund 按钮

### 3.4 Transaction Actions

#### Refund 功能 ✅

**弹窗字段**:
| 字段 | 可编辑 | 验证规则 |
| --------------- | ------ | ---------------------------- |
| Transaction ID | ❌ | - |
| Reference | ❌ | - |
| Date/Time | ❌ | - |
| Remain Balance | ❌ | - |
| Refund Currency | ❌ | - |
| Refund Amount | ✅ | 必填，> 0，≤ Remain Balance |
| Reason | ✅ | 必填 |

**金额验证**:

- KRW, JPY, CLP, ISK, IDR: 不允许小数
- KWD: 最多 3 位小数
- 其他货币: 最多 2 位小数

#### Capture 功能 ✅

**弹窗字段**: 类似 Refund，验证 Capture Amount

#### Cancel 功能 ✅

**确认弹窗**: 显示交易信息，确认后取消交易

### 3.5 Multi Fundings

**功能**: 展示多渠道资金结算数据

**表格列**:
| 列名 | 字段 | 说明 |
| ----------- | -------------- | -------------------- |
| Date | `happenedDate` | 发生日期 |
| Method | `funding` | 支付方式 |
| Total Tranx | `count` | 交易数量 |
| Gross | `sum` | 总额 |
| Payout | `settled` | 支付额 |

**显示条件**: `selectedNode.hasMultiFundings` 不为空且不为 0

### 3.6 Reserve Summary

**功能**: 展示储备金信息，包含三个表格

**Fixed Reserve 表格**:
| 列名 | 说明 |
| ---------- | ------------------------ |
| Type | 固定为 "Fixed" |
| Amount | 金额 |
| Term | 从 content JSON 解析 |
| Start Date | 开始日期 |
| End Date | 结束日期 |
| Status | 状态 |

**Rolling Reserve 表格**:
| 列名 | 说明 |
| ---------- | ------------------------ |
| Type | 固定为 "Rolling" |
| Percent | 从 content JSON 解析 |
| Term | rolling_period |
| Start Date | 开始日期 |
| End Date | 结束日期 |
| Status | 状态 |

**Rolling Details 表格**:
| 列名 | 说明 |
| -------- | -------------- |
| Date | 日期 |
| Withheld | 预扣金额 |
| Released | 释放金额 |
| Net | 净额 |

**显示条件**: `reserve_summary_disable === false` 且 `hasReserve === true`

---

## 4. 状态管理

### 4.1 Store 概览

| Store 名称                  | 文件                        | 职责                 | 持久化 (localStorage)                           | 内存缓存 |
| --------------------------- | --------------------------- | -------------------- | ----------------------------------------------- | -------- |
| `useDashboardStore`         | `dashboardStore.ts`         | Daily/Monthly/Settle | ✅ nodeSharedInfo                               | ✅       |
| `useTransactionLookupStore` | `transactionLookupStore.ts` | 交易查询             | ❌                                              | ✅       |
| `useDisputeStore`           | `disputeStore.ts`           | 争议列表             | ❌                                              | ✅       |
| `useAliDirectStore`         | `aliDirectStore.ts`         | 支付宝直连           | ❌                                              | ✅       |
| `useMultiFundingsStore`     | `multiFundingsStore.ts`     | 多渠道资金           | ❌                                              | ✅       |
| `useReserveSummaryStore`    | `reserveSummaryStore.ts`    | 储备金汇总           | ❌                                              | ✅       |
| `useAllTransactionsStore`   | `allTransactionsStore.ts`   | 全局交易搜索         | ❌                                              | ✅       |
| `useHierarchyStore`         | `hierarchyStore.ts`         | 层级树子节点缓存     | ✅ childrenCache                                | ✅       |
| `useUIStore`                | `uiStore.ts`                | 侧边栏状态、选中节点 | ✅ sidebarCollapsed, selectedNode, expandedKeys | ✅       |
| `useThemeStore`             | `themeStore.ts`             | 主题切换             | ✅ currentTheme                                 | ✅       |
| `useAuthStore`              | `authStore.ts`              | 用户认证、登录状态   | ✅ 完整用户信息                                 | ✅       |

**说明**：

- **持久化 (localStorage)**: 数据保存到浏览器存储，刷新页面后仍然存在
- **内存缓存**: 数据保存在 Store 内存中，切换 Tab 时数据保留，避免重复请求；刷新页面会重置

### 4.2 Dashboard Store

```typescript
interface DashboardState {
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

  // Node shared info (从 API 响应提取)
  nodeSharedInfo: NodeSharedInfo;

  // Actions
  fetchDailySummary: (params) => Promise<void>;
  fetchMonthlySummary: (params) => Promise<void>;
  fetchDailySettleSummary: (params) => Promise<void>;
  setDailyPage: (page: number) => void;
  setMonthlyPage: (page: number) => void;
  clearDashboard: () => void;
  updateNodeSharedInfo: (info: Partial<NodeSharedInfo>) => void;
}
```

### 4.3 请求取消机制

所有 Store 实现 AbortController 机制：

```typescript
let dailyAbortController: AbortController | null = null;

const fetchDailySummary = async (params) => {
  // 取消前一个请求
  if (dailyAbortController) {
    dailyAbortController.abort();
  }
  dailyAbortController = new AbortController();

  try {
    const response = await summaryApi.fetchSummary(
      params,
      dailyAbortController.signal,
    );
    // ...
  } catch (error) {
    if (error.name === 'CanceledError') return; // 忽略取消错误
    // ...
  }
};

// 导出取消函数
export const cancelAllDashboardRequests = () => {
  dailyAbortController?.abort();
  monthlyAbortController?.abort();
  dailySettleAbortController?.abort();
};
```

### 4.4 NodeSharedInfo

从 `/summary` API 响应中提取，用于控制 Tab 显示：

```typescript
interface NodeSharedInfo {
  disputeManage: boolean;
  gateway: string;
  hasDisputeChild: boolean;
  hasElavonChild: boolean;
  hasItemizedFee: boolean;
  hasJkoPay: boolean;
  hasPreAuth: boolean;
  hasReserve: boolean;
  hasUPI: boolean;
  umfEnabled: boolean;
}
```

---

## 5. API 契约

### 5.1 Summary API

**端点**: `POST /tranx/summary`

**请求参数**:

```typescript
interface SummaryRequest {
  date_month: string; // 日期，初始加载传空字符串
  disputeType: string; // 默认 "all"
  hierarchy_user_id: number; // 商户节点 ID
  merchantId: string; // 商户 ID，父节点传空
  page_number: string; // 页码，从 0 开始
  row_count: number; // 每页条数
  search_type: SummarySearchType; // 'daily' | 'monthly' | 'settle' | 'reserve'
  session_id: string;
}
```

**响应结构**:

```typescript
interface SummaryResponse {
  code: number; // 200 表示成功
  message?: string;
  transactions: TransactionRecord[];
  total_records: number;
  hierarchy_user_data: HierarchyUserData;
  // Tab 显示控制字段
  disputeManage: boolean;
  hasDisputeChild: boolean;
  hasElavonChild: boolean;
  hasReserve: boolean;
  hasPreAuth: boolean;
  hasUPI: boolean;
  hasJkoPay: boolean;
  umfEnabled: boolean;
  isElavonSite: boolean;
  isMultiCurrency: boolean;
}
```

### 5.2 Transaction Lookup API

**端点**: `POST /transactions_lookup`

**请求参数**:

```typescript
interface TransactionLookupRequest {
  merchantId: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string; // "YYYY-MM-DD"
  keyword: string;
  page_number: string;
  row_count: number;
  session_id: string;
}
```

**响应结构**:

```typescript
interface TransactionLookupResponse {
  totalRecords: string; // 总记录数
  merchant_id: string; // 商户 ID
  merchant_name: string; // 商户名称
  currency: string; // 货币
  transactions: TransactionLookupRecord[]; // 交易记录列表
}

interface TransactionLookupRecord {
  transaction_id: string; // 交易 ID
  txn_ref_num: string; // 交易参考号
  oid: string; // 订单 ID
  transaction_type: string; // 交易类型
  tranx_status: string; // 交易状态
  txn_currency: string; // 交易货币
  txn_amt: string; // 交易金额
  scharge: string; // 服务费
  capture_amt: string; // 捕获金额
  refund_txn_amt: string; // 退款金额
  remaining_balance: string | number; // 剩余余额
  creation_time: string; // 创建时间
  payment_method: string; // 支付方式
  payment_gateway: string; // 支付网关
  card_type_name: string; // 卡类型
  card_number: string; // 卡号
  cardholder_name: string; // 持卡人姓名
  customer_email: string; // 客户邮箱
  transaction_db: string; // 交易数据库 (upi/非upi)
  amount_authorized_remaining: number; // 剩余授权金额
  amount_refunded: number; // 已退款金额
  pre_auth?: number; // 是否预授权
  // ... 更多字段见 types/dashboard.ts
}
```

### 5.3 Transaction Action APIs

交易操作 API 用于对交易执行退款、捕获和取消操作。所有接口返回统一的响应结构。

> 详细接口契约见 `/spec/dashboard/contracts.md`

#### 5.3.1 Refund 退款

**接口**: `POST /transaction_action/refund`

**用途**: 对已成功的交易执行全额或部分退款

**请求参数**:

| 字段            | 类型    | 必填 | 说明                      |
| --------------- | ------- | ---- | ------------------------- |
| merchantId      | string  | ✅   | 商户 ID                   |
| transactionId   | string  | ✅   | 交易 ID                   |
| amount          | string  | ✅   | 退款金额（字符串格式）    |
| currency        | string  | ✅   | 货币代码                  |
| reason          | string  | ✅   | 退款原因                  |
| transactionDb   | string  | ✅   | 交易数据库 (`upi` 或其他) |
| sessionId       | string  | ✅   | 会话 ID                   |
| type            | string  | ✅   | 交易类型                  |
| originReference | string  | ✅   | 原始参考号                |
| vendor          | string  | ✅   | 支付供应商                |
| source          | string  | ❌   | 来源                      |
| gateway         | string  | ✅   | 支付网关                  |
| pre_auth        | boolean | ✅   | 是否预授权交易            |

#### 5.3.2 Capture 捕获

**接口**: `POST /transaction_action/capture`

**用途**: 对已授权的交易执行捕获操作，将授权金额转为实际扣款

**请求参数**:

| 字段          | 类型    | 必填 | 说明                      |
| ------------- | ------- | ---- | ------------------------- |
| merchantId    | string  | ✅   | 商户 ID                   |
| transactionId | string  | ✅   | 交易 ID                   |
| amount        | string  | ✅   | 捕获金额（字符串格式）    |
| currency      | string  | ✅   | 货币代码                  |
| transactionDb | string  | ✅   | 交易数据库 (`upi` 或其他) |
| sessionId     | string  | ✅   | 会话 ID                   |
| multi_capture | boolean | ✅   | 是否多次捕获              |
| last_capture  | boolean | ✅   | 是否最后一次捕获          |
| source        | string  | ❌   | 来源                      |
| pre_auth      | boolean | ✅   | 是否预授权交易            |

**Multi-Capture 说明**:

- `multi_capture = true`: 允许对同一授权执行多次捕获
- `last_capture = true`: 表示这是最后一次捕获，剩余授权金额将被释放

#### 5.3.3 Cancel 取消

**接口**: `POST /transaction_action/cancel`

**用途**: 取消已授权但未捕获的交易

**请求参数**:

| 字段          | 类型    | 必填 | 说明                      |
| ------------- | ------- | ---- | ------------------------- |
| merchantId    | string  | ✅   | 商户 ID                   |
| transactionId | string  | ✅   | 交易 ID                   |
| transactionDb | string  | ✅   | 交易数据库 (`upi` 或其他) |
| sessionId     | string  | ✅   | 会话 ID                   |
| source        | string  | ❌   | 来源                      |
| pre_auth      | boolean | ✅   | 是否预授权交易            |

#### 5.3.4 通用响应结构

```typescript
interface TransactionActionResponse {
  code: number; // 200 表示成功
  message: string; // 响应消息
}
```

---

## 6. 组件设计

### 6.1 DashboardPage

**职责**: Dashboard 主页面，整合所有 Tab 和数据加载

**核心逻辑**:

1. 读取 `selectedNode` 获取当前商户
2. 解析 `userConfig` 控制 Tab 显示
3. 按需加载数据（默认只加载 Daily Summary）
4. 通过 URL 参数 `?tab=xxx` 持久化 Tab 状态
5. 切换节点时取消未完成请求并重置状态

**自动选中顶级节点**:

```typescript
const autoSelectedNodeIdRef = useRef<number | null>(null);

useEffect(() => {
  if (!selectedNode && hierarchyTree?.length > 0) {
    const topNode = hierarchyTree[0];
    autoSelectedNodeIdRef.current = topNode.id; // 标记为自动选中
    setSelectedNode(topNode);
    setExpandedKeys([`node-${topNode.id}`]);
  }
}, [selectedNode, hierarchyTree]);
```

### 6.2 DateFilter

**职责**: 日期筛选组件

**Props**:

```typescript
interface DateFilterProps {
  date: Dayjs | null;
  onDateChange: (date: Dayjs | null) => void;
  onSearch: () => void;
  loading?: boolean;
  picker?: 'date' | 'month';
  placeholder?: string;
}
```

### 6.3 DownloadButtons

**职责**: CSV/PDF 下载按钮

**下载逻辑**:

1. CSV: 调用 `downloadCSV(url)` 触发浏览器下载
2. PDF: 调用 `downloadPDF(url)` 触发浏览器下载

### 6.4 Transaction Action Modals

Transaction Lookup 模块提供三个操作弹窗，用于对交易执行不同的操作。

#### 6.4.1 RefundModal 退款弹窗

> 文件: `src/components/dashboard/TransactionLookup/RefundModal.tsx`

**功能**: 对已成功的交易执行全额或部分退款

**表单字段**:

| 字段           | 类型   | 可编辑 | 说明                   |
| -------------- | ------ | ------ | ---------------------- |
| Transaction ID | string | 否     | 交易 ID（只读）        |
| Reference      | string | 否     | 参考号（只读）         |
| Date/Time      | string | 否     | 交易时间（只读）       |
| Remain Balance | string | 否     | 剩余可退金额（只读）   |
| Currency       | string | 否     | 货币代码（只读）       |
| Refund Amount  | string | ✅     | 退款金额（默认为全额） |
| Reason         | string | ✅     | 退款原因（必填）       |

**验证规则**:

1. **Reason 必填**: 退款原因不能为空
2. **金额验证**:
   - 必须 > 0
   - 不能超过 Remain Balance
   - 小数位数必须符合货币规则
3. **货币规则**: 根据 `getCurrencyDecimalPlaces()` 验证

**操作流程**:

```
用户点击 Refund 按钮 → 打开 RefundModal
    ↓
填写 Refund Amount 和 Reason
    ↓
点击 Confirm → 前端验证
    ↓
验证通过 → 调用 /transaction_action/refund
    ↓
成功 → 关闭弹窗，刷新列表，显示成功消息
失败 → 弹窗内显示错误信息
```

#### 6.4.2 CaptureModal 捕获弹窗

> 文件: `src/components/dashboard/TransactionLookup/CaptureModal.tsx`

**功能**: 对已授权的交易执行捕获操作

**表单字段**:

| 字段            | 类型     | 可编辑 | 说明                           |
| --------------- | -------- | ------ | ------------------------------ |
| Transaction ID  | string   | 否     | 交易 ID（只读）                |
| Reference       | string   | 否     | 参考号（只读）                 |
| Date/Time       | string   | 否     | 交易时间（只读）               |
| Original Amount | string   | 否     | 剩余授权金额（只读）           |
| Currency        | string   | 否     | 货币代码（只读）               |
| Capture Amount  | string   | ✅     | 捕获金额（默认为剩余授权金额） |
| Multi-Capture   | checkbox | ✅     | 是否多次捕获                   |
| Last Capture    | checkbox | ✅     | 是否最后一次捕获               |

**复选框说明**:

- **Multi-Capture**: 选中时允许对同一授权执行多次捕获
- **Last Capture**: 选中时表示这是最后一次捕获，剩余授权金额将被释放

**提示信息**:

```
* If a transaction is partially captured the remaining authorization amount will be released
```

**验证规则**:

1. **金额验证**:
   - 必须 > 0
   - 不能超过剩余授权金额
   - 小数位数必须符合货币规则

#### 6.4.3 CancelConfirmModal 取消确认弹窗

> 文件: `src/components/dashboard/TransactionLookup/CancelConfirmModal.tsx`

**功能**: 取消已授权但未捕获的交易

**UI 设计**:

- 无标题的确认弹窗
- 显示内容: `Do you want to cancel this transaction?`
- 按钮: `No`（关闭弹窗）/ `Yes`（执行取消）

**特点**:

1. **无表单**: 只是简单的确认操作
2. **错误处理**: 取消失败时错误信息显示在弹窗内，不关闭弹窗
3. **成功处理**: 显示成功消息，关闭弹窗，刷新列表

---

## 7. 数据处理

### 7.1 货币格式化

> 文件: `src/utils/currency.ts`

**处理规则**:
| 货币类型 | 货币代码 | 处理方式 | 小数位数 |
| ------------ | ------------------ | ------------ | -------- |
| 无小数位货币 | KRW, JPY, CLP, ISK | 金额保持原样 | 0 位 |
| 三位小数货币 | KWD | 金额 ÷ 1000 | 3 位 |
| 其他货币 | USD, CNY, EUR 等 | 金额 ÷ 100 | 2 位 |

**货币符号映射**:
| Currency | 符号 |
| -------- | ---- |
| USD | $ |
| CNY | ¥ |
| EUR | € |
| GBP | £ |
| JPY | ¥ |
| KRW | ₩ |
| HKD | HK$ |
| SGD | S$ |

### 7.2 Action 按钮显示逻辑

> 文件: `src/utils/transactionLookup.ts`

Action 按钮的显示逻辑分为 **UPI 交易** 和 **非 UPI 交易** 两套规则。

#### 7.2.1 核心判断函数

```typescript
function getActionButtonsVisibility(
  record: TransactionLookupRecord,
  canRefund: boolean,
  hasPreAuth: boolean,
): ActionButtonsVisibility {
  const isUPI = record.transaction_db === 'upi';
  if (isUPI) {
    return getUPIActionButtons(record, canRefund);
  } else {
    return getNonUPIActionButtons(record, canRefund, hasPreAuth);
  }
}
```

#### 7.2.2 UPI 交易按钮规则

| 按钮    | 基础条件                                                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capture | `transaction_type === 'charge'` && `tranx_status === 'authorized'` && `amount_authorized_remaining > 0`                                                    |
| Refund  | `transaction_type` ∈ `['charge','capture','capture_dashboard','capture_online']` && `tranx_status === 'success'` && `canRefund` && `remaining_balance > 0` |
| Cancel  | `transaction_type === 'charge'` && `tranx_status` ∈ `['authorized','pending']` && `amount_captured <= 0`                                                   |

**特殊网关覆盖规则**:

| 网关                              | Capture                  | Refund                   | Cancel    |
| --------------------------------- | ------------------------ | ------------------------ | --------- |
| `sbps` (受限方法\*)               | ❌ 禁用                  | 需 `amount_refunded > 0` | ❌ 禁用   |
| `wechatpay/upop/alipay/fomo/aps`  | ❌ 禁用 (除非 upop+card) | 保持基础规则             | ❌ 禁用   |
| `xendit`                          | 仅 `card`                | 仅指定方法\*\*           | 仅 `card` |
| `cil`                             | 仅 `card`                | 仅指定方法\*\*\*         | 仅 `card` |
| `gmo`                             | ❌ 禁用                  | 仅指定方法\*\*\*\*       | ❌ 禁用   |
| `flutterwave/ppro` (pending 状态) | 保持基础规则             | 保持基础规则             | ❌ 禁用   |

\*受限方法: `linepay, paypay, rakutenpay, alipay, upop`  
**xendit 支持: `card, shopeepay, gcash, paymaya, grabpay`  
\***cil 支持: `alipay_hk, kor_onlinebanking, payco, kakaopay, naverpay, toss, paypay, linepay, merpay, rakutenpay, au, softbank, ntt_docomo, card, wechatpay`  
\*\*\*\*gmo 支持: `paypay, merpay, rakutenpay, au, ntt_docomo, amazon`

#### 7.2.3 非 UPI 交易按钮规则

| 条件                                                                                                                                                                                                                                | Capture | Refund | Cancel |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | ------ |
| `hasPreAuth = true` && `transaction_type === 'pos_payment'` && `pre_auth === 1` && `amount_captured <= 0`                                                                                                                           | ✅      | -      | ✅     |
| `hasPreAuth = true` && `transaction_type === 'pos_capture'` && `remaining_balance > 0`                                                                                                                                              | -       | ✅     | -      |
| `transaction_type` ∈ `['charge','pos_payment','pos_capture']` && `!showCapture` && `tranx_status !== 'cancelled'` && `canRefund` && `remaining_balance > 0` && (`method` 包含 `cup` 或 ∈ `['alipay_hk','dana','gcash','kakaopay']`) | -       | ✅     | -      |

**状态覆盖规则**:

- 如果 `tranx_status` ∈ `['pending','delayed','cancelled']`：显示状态文字，隐藏 Refund
- 如果 `payment_gateway === 'upside'`：隐藏 Cancel

#### 7.2.4 Action 列标题逻辑

```typescript
function getActionColumnTitle(hasUPI: boolean, hasPreAuth: boolean): string {
  if (hasUPI || hasPreAuth) {
    return 'Action'; // 可能有多种操作
  }
  return 'Refund'; // 只有退款操作
}
```

### 7.3 UserConfig 解析

> 文件: `src/types/dashboard.ts`

```typescript
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

## 8. 用户交互流程

### 8.1 节点选择与数据加载

```
用户点击 TreeMenu 节点
        │
        ▼
┌───────────────────────────────┐
│ setSelectedNode(node)         │
│ navigate('/dashboard')        │
└───────────────────────────────┘
        │
        ▼
DashboardPage 检测 selectedNode 变化
        │
        ├── 判断是否自动选中（顶级节点）
        │       │
        │       └── 是 → 不加载数据，不选中 Tab
        │
        └── 手动选中
                │
                ▼
┌───────────────────────────────┐
│ 取消所有未完成请求             │
│ clearDashboard()              │
│ setActiveTab('daily')         │
│ fetchDailySummary(params)     │
└───────────────────────────────┘
```

### 8.2 Tab 切换与数据加载

```
用户点击 Tab (如 Monthly Summary)
        │
        ▼
┌───────────────────────────────┐
│ setActiveTab('monthly')       │
│ setSearchParams({ tab: ... }) │
└───────────────────────────────┘
        │
        ▼
检查该 Tab 数据是否已加载
        │
        ├── 已加载 → 直接显示缓存数据
        │
        └── 未加载
                │
                ▼
┌───────────────────────────────┐
│ fetchMonthlySummary(params)   │
└───────────────────────────────┘
```

### 8.3 Refund 操作流程

```
用户点击 Refund 按钮
        │
        ▼
打开 RefundModal，显示交易信息
        │
        ▼
用户填写 Refund Amount 和 Reason
        │
        ▼
点击 Confirm
        │
        ▼
┌───────────────────────────────┐
│ 前端验证                       │
│ - Amount > 0                  │
│ - Amount ≤ Remain Balance     │
│ - Reason 非空                  │
│ - 小数位数符合货币规则         │
└───────────────────────────────┘
        │
        ├── 验证失败 → 显示错误，不关闭弹窗
        │
        └── 验证成功
                │
                ▼
┌───────────────────────────────┐
│ POST /transaction_action/refund│
└───────────────────────────────┘
        │
        ├── 失败 → 在弹窗内显示错误
        │
        └── 成功
                │
                ▼
关闭弹窗，显示成功提示，刷新列表
```

---

## 9. 性能优化

### 9.1 请求优化

| 优化策略 | 实现方式                                  |
| -------- | ----------------------------------------- |
| 按需加载 | 默认只加载 Daily，切换 Tab 时加载其他数据 |
| 请求取消 | AbortController 取消未完成请求            |
| 数据缓存 | 已加载的 Tab 数据缓存在 Store             |
| 防抖搜索 | 使用 lodash/debounce 防止频繁请求         |

### 9.2 渲染优化

| 优化策略    | 实现方式                               |
| ----------- | -------------------------------------- |
| useMemo     | 缓存 tabItems、userConfig 等计算结果   |
| useCallback | 缓存事件处理函数                       |
| 虚拟滚动    | 长列表使用 Ant Design Table 的虚拟滚动 |
| 懒加载组件  | Tab 内容组件按需渲染                   |

### 9.3 代码分割

```typescript
// 子模块懒加载
const TransactionLookup = lazy(() => import('./TransactionLookup'));
const DisputeSummary = lazy(() => import('./DisputeSummary'));
```

---

## 10. 主题与样式

### 10.1 主题色定义

| 主题     | 主色调    | 浅色变体  |
| -------- | --------- | --------- |
| 亮色主题 | `#1890ff` | `#e6f4ff` |
| 暗色主题 | `#7c3aed` | `#f3e8ff` |

### 10.2 表格样式

| 属性           | 值                  |
| -------------- | ------------------- |
| 表头背景色     | `#f0f0f0`           |
| 表头字重       | `600`               |
| 表头底部分割线 | `2px solid #d9d9d9` |
| 斑马纹奇数行   | `#ffffff`           |
| 斑马纹偶数行   | `#fafafa`           |
| 链接文字颜色   | 主题主色            |
| 行悬停背景     | 主题浅色变体        |

### 10.3 响应式设计

| 区域         | 桌面端 (>768px) | 移动端 (≤480px) |
| ------------ | --------------- | --------------- |
| Page Padding | 4px             | 0               |
| Cell Padding | 8px 12px        | 6px 4px         |
| 字体大小     | 14px            | 11px            |

---

## 11. 测试策略

### 11.1 单元测试

| 文件                     | 测试内容                |
| ------------------------ | ----------------------- |
| `currency.test.ts`       | 货币格式化、符号映射    |
| `dashboard.test.ts`      | 配置解析、点击判断逻辑  |
| `dashboardStore.test.ts` | Store actions、请求取消 |

### 11.2 组件测试

| 组件              | 测试场景                 |
| ----------------- | ------------------------ |
| DailySummaryTable | 数据渲染、分页、点击事件 |
| DateFilter        | 日期选择、搜索触发       |
| RefundModal       | 表单验证、提交、错误处理 |

### 11.3 集成测试

| 场景                | 验证点                         |
| ------------------- | ------------------------------ |
| 节点选择 → 数据加载 | API 调用、数据显示             |
| Tab 切换            | 按需加载、数据缓存             |
| Refund 操作         | 弹窗显示、验证、API 调用、刷新 |

---

## 附录 A: Tab 显示条件

| Tab                  | 显示条件                                                     |
| -------------------- | ------------------------------------------------------------ |
| Daily Summary        | 默认显示，除非 `daily_summary_disable === true`              |
| Monthly Summary      | 默认显示，除非 `monthly_summary_disable === true`            |
| Transaction Lookup   | `merchantId` 存在 且 `transactions_lookup_disable !== true`  |
| Daily Settle Summary | `merchantId` 存在                                            |
| Dispute Summary      | `merchantId` 存在 且 (`dispute_manage` 或 `hasDisputeChild`) |
| Alipay Direct        | `hasAliDirect` 不为空且不为 0                                |
| Multi Fundings       | `hasMultiFundings` 不为空且不为 0                            |
| Reserve Summary      | `reserve_summary_disable === false` 且 `hasReserve === true` |

---

## 附录 B: 任务完成状态

| Phase                     | 任务数 | 状态   |
| ------------------------- | ------ | ------ |
| Phase 1 (Types & Utils)   | 3      | ✅     |
| Phase 2 (API & Store)     | 3      | ✅     |
| Phase 3 (Daily Summary)   | 1      | ✅     |
| Phase 4 (Monthly Summary) | 2      | ✅     |
| Phase 5 (Integration)     | 2      | ✅     |
| Phase 6 (UI Optimization) | 5      | ✅     |
| Phase 7 (Multi Fundings)  | 3      | ✅     |
| Phase 8 (Reserve Summary) | 3      | ✅     |
| Phase 9 (Tab & Routing)   | 5      | ✅     |
| **总计**                  | **27** | **✅** |

---

## 附录 C: 相关文档

- [功能规格说明书 (spec.md)](./spec.md)
- [API 契约 (contracts.md)](./contracts.md)
- [实施计划 (plan.md)](./plan.md)
- [任务清单 (tasks.md)](./tasks.md)
- [详情报表规格 (daily-detail-report.md)](./daily-detail-report.md)
