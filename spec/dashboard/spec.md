# Dashboard 功能规格说明书

## 概述

Dashboard 页面是用户点击左侧 TreeMenu 后展示的主要内容区域。根据用户选择的节点类型（父节点或子节点），展示不同的数据汇总信息。

---

## 用户故事

### US1: 节点数据展示

**作为**用户，**我希望**点击左侧菜单时，Dashboard 能根据我选择的节点展示相应的数据，**以便**我可以查看商户或商户组的统计信息。

**验收标准**：

1. 点击叶子节点（最终子节点）时，展示当前商户的数据
2. 点击父节点时，展示该节点下所有商户的汇总信息
3. 选中的节点信息保存到 store 中，供 Dashboard 页面使用

### US2: Daily Summary 数据展示

**作为**用户，**我希望**在 Dashboard 中查看 Daily Summary 表格，**以便**了解每日交易统计数据。

**验收标准**：

1. 表头显示：`Date (Creation Time)`, `Total Tranx`, `Gross`, `Net`, `Payout`, `Status`, `Payment Methods`
2. 如果是 Elavon 商户，`Status` 列标题变更为 `Status*`
3. 金额根据 currency 显示货币符号，无小数部分（cent）
4. 点击 `Date (Creation Time)` 可查看详情（除非被禁用）
5. 特殊状态显示：如果 `umfEnabled` 或 `hasJkoPay` 或 `isElavonSite` 为 true，`Status` 显示 `Cleared` + `{settle_date}`

### US3: Monthly Summary 数据展示

**作为**用户，**我希望**在 Dashboard 中查看 Monthly Summary 表格，**以便**了解每月交易统计数据。

**验收标准**：

1. 表头显示：`Month`, `Total Tranx`, `Gross`, `Net*`, `Payment Methods`
2. 金额根据 currency 显示货币符号，无小数部分（cent）
3. 点击 `Month` 可查看详情（除非被禁用）

---

## 功能模块分类

Dashboard 页面信息分为 9 类：

| 模块                     | Tab Key         | API 接口                | 实现状态       | Store 文件                  |
| ------------------------ | --------------- | ----------------------- | -------------- | --------------------------- |
| **Daily Summary**        | `daily`         | `/tranx/summary`        | ✅ 已实现      | `dashboardStore.ts`         |
| **Monthly Summary**      | `monthly`       | `/tranx/summary`        | ✅ 已实现      | `dashboardStore.ts`         |
| **Transaction Lookup**   | `transaction`   | `/transactions_lookup`  | ✅ 已实现      | `transactionLookupStore.ts` |
| **Daily Settle Summary** | `settle`        | `/tranx/summary`        | ✅ 已实现      | `dashboardStore.ts`         |
| **Dispute Summary**      | `dispute`       | `/dispute/list`         | ✅ 已实现      | `disputeStore.ts`           |
| **Alipay Direct**        | `alipay`        | `/tranx/ali_direct`     | ✅ 已实现      | `aliDirectStore.ts`         |
| **Multi Fundings**       | `multiFundings` | `/tranx/multi_fundings` | ✅ 已实现      | `multiFundingsStore.ts`     |
| **Reserve Summary**      | `reserve`       | `/tranx/summary`        | ✅ 已实现      | `reserveSummaryStore.ts`    |
| Smart Gateway            | `smartGateway`  | -                       | 🔜 Coming Soon | -                           |

### 独立页面模块

| 模块                        | 路由               | API 接口                   | 实现状态  | Store 文件                |
| --------------------------- | ------------------ | -------------------------- | --------- | ------------------------- |
| **All Transactions Search** | `/alltransactions` | `/all_transactions_search` | ✅ 已实现 | `allTransactionsStore.ts` |

### 未实现模块占位

Smart Gateway 模块暂未实现，在页面上隐藏显示。

---

## 已实现的核心模块

### Store 层实现

所有 Store 使用 Zustand 实现，支持以下特性：

| Store 名称                  | 文件                        | 主要功能                     | 持久化    |
| --------------------------- | --------------------------- | ---------------------------- | --------- |
| `useAuthStore`              | `authStore.ts`              | 用户认证、登录状态管理       | ✅        |
| `useDashboardStore`         | `dashboardStore.ts`         | Daily/Monthly/Settle Summary | ✅ 部分   |
| `useTransactionLookupStore` | `transactionLookupStore.ts` | 交易查询、列配置             | ✅ 列配置 |
| `useDisputeStore`           | `disputeStore.ts`           | 争议列表管理                 | ❌        |
| `useAliDirectStore`         | `aliDirectStore.ts`         | 支付宝直连结算               | ❌        |
| `useMultiFundingsStore`     | `multiFundingsStore.ts`     | 多渠道资金结算               | ❌        |
| `useReserveSummaryStore`    | `reserveSummaryStore.ts`    | 储备金汇总                   | ❌        |
| `useAllTransactionsStore`   | `allTransactionsStore.ts`   | 全局交易搜索                 | ❌        |
| `useHierarchyStore`         | `hierarchyStore.ts`         | 层级树子节点缓存             | ✅        |
| `useUIStore`                | `uiStore.ts`                | 侧边栏状态、选中节点         | ✅        |
| `useThemeStore`             | `themeStore.ts`             | 主题切换                     | ✅        |

### API 层实现

| API 模块               | 文件                      | 主要接口                   |
| ---------------------- | ------------------------- | -------------------------- |
| `summaryApi`           | `summaryApi.ts`           | 获取汇总数据、下载 CSV/PDF |
| `transactionLookupApi` | `transactionLookupApi.ts` | 交易查询、下载             |
| `reserveSummaryApi`    | `reserveSummaryApi.ts`    | 储备金汇总查询             |
| `aliDirectApi`         | `aliDirectApi.ts`         | 支付宝直连结算查询         |
| `multiFundingsApi`     | `multiFundingsApi.ts`     | 多渠道资金查询             |
| `disputeApi`           | `disputeApi.ts`           | 争议列表查询               |
| `allTransactionsApi`   | `allTransactionsApi.ts`   | 全局交易搜索               |
| `hierarchyApi`         | `hierarchyApi.ts`         | 层级树子节点加载           |
| `authApi`              | `authApi.ts`              | 登录认证                   |

### 工具函数实现

| 工具模块            | 文件                   | 主要功能                    |
| ------------------- | ---------------------- | --------------------------- |
| `currency`          | `currency.ts`          | 货币格式化（支持 30+ 货币） |
| `dashboard`         | `dashboard.ts`         | 配置解析、详情可点击判断    |
| `download`          | `download.ts`          | CSV/PDF 下载、数据导出      |
| `transactionLookup` | `transactionLookup.ts` | Action 按钮显示逻辑         |

### 请求取消机制

所有数据请求 Store 都实现了 AbortController 机制：

```typescript
// 示例：dashboardStore.ts
let dailyAbortController: AbortController | null = null;

// 取消前一个请求
if (dailyAbortController) {
  dailyAbortController.abort();
}
dailyAbortController = new AbortController();

// 发起请求时传入 signal
const response = await summaryApi.fetchSummary(
  params,
  dailyAbortController.signal,
);
```

每个 Store 都导出 `cancel*Requests()` 函数，用于在切换 Tab 或节点时取消未完成的请求。

---

## UI 组件规格

### Daily Summary 表格

#### 表头配置

| 列名                 | 字段映射     | 说明                                 |
| -------------------- | ------------ | ------------------------------------ |
| Date (Creation Time) | `date_month` | 可点击查看详情（条件限制）           |
| Total Tranx          | `num_tran`   | 交易总数                             |
| Gross                | `gross`      | 总额，显示货币符号                   |
| Net                  | `net`        | 净额，显示货币符号                   |
| Payout               | `payout`     | 支付额，仅特定商户显示（见下方列表） |
| Status / Status\*    | `status`     | Elavon 商户显示 `Status*`            |
| Payment Methods      | `vendor`     | 支付方式                             |

#### Payout 列显示条件

`Payout` 列仅在 `hierarchy_user_data.merchant_id` 属于以下列表时显示：

```typescript
MERCHANT_IDS_HAVE_PAYOUT = [
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
  '634201701641000',
  '634201701643000',
  '634201701642000',
  '634201701644000',
  '634201702942000',
  '634201701285000',
  '634201700370000',
];
```

#### 详情点击禁用条件

`Date (Creation Time)` **不可点击**的条件：

- `config.detail_daily_report_disable` 为空字符串，或
- `/summary` 返回的 `hierarchy_user_data.merchant_id` **不存在**（父节点）

**注意**：子商户（叶子节点，有 merchant_id）可以点击查看详情，父节点不可点击。

#### 特殊状态显示

当以下任一条件为 true 时，`Status` 列显示 `Cleared {settle_date}`：

- `umfEnabled === true`
- `hasJkoPay === true`
- `isElavonSite === true`

### Monthly Summary 表格

#### 表头配置

| 列名            | 字段映射     | 说明                       |
| --------------- | ------------ | -------------------------- |
| Month           | `date_month` | 可点击查看详情（条件限制） |
| Total Tranx     | `num_tran`   | 交易总数                   |
| Gross           | `gross`      | 总额，显示货币符号         |
| Net\*           | `net`        | 净额，显示货币符号         |
| Payment Methods | `vendor`     | 支付方式                   |

#### 详情点击禁用条件

`Month` **不可点击**的条件：

- `config.detail_monthly_report_disable` 为空字符串，或
- `/summary` 返回的 `hierarchy_user_data.merchant_id` **不存在**（父节点）

**注意**：子商户（叶子节点，有 merchant_id）可以点击查看详情，父节点不可点击。

---

### Transaction Lookup 表格

#### 功能概述

Transaction Lookup 提供交易查询功能，支持日期范围筛选和关键字搜索，显示详细的交易记录列表，并支持对特定交易执行 Capture、Refund、Cancel 等操作。

#### 筛选组件

| 组件        | 类型             | 说明                                             |
| ----------- | ---------------- | ------------------------------------------------ |
| Date Range  | RangePicker      | 选择开始和结束日期                               |
| Keyword     | Input            | 搜索关键字，placeholder: `UPT/Ref/Name/Card/OID` |
| Search 按钮 | Button (primary) | 点击后执行搜索                                   |

日期格式：`YYYY-MM-DD`（如 `2024-01-01`）

#### 表头配置（28 列）

| 序号 | 列名                      | 字段映射                         | 宽度  | 可配置 | 说明                                  |
| ---- | ------------------------- | -------------------------------- | ----- | ------ | ------------------------------------- |
| 1    | Location                  | `location`                       | 140px | 否     | 位置                                  |
| 2    | Store Name                | `store_name`                     | 150px | 否     | 店铺名称                              |
| 3    | Transaction ID            | `transaction_id`                 | 170px | 否     | 交易 ID                               |
| 4    | Parent Transaction ID     | `parent_transaction_id`          | 170px | 否     | 父交易 ID，格式化显示                 |
| 5    | Reference ID              | `reference`                      | 150px | 是     | 参考号                                |
| 6    | Reference2                | `reference2`                     | 150px | 是     | 参考号2                               |
| 7    | Extral Reference          | `extral_reference`               | 150px | 是     | 额外参考号                            |
| 8    | Date/Time                 | `time_created`                   | 110px | 否     | 创建时间                              |
| 9    | Transaction Type          | `transaction_type`               | 135px | 否     | 交易类型，格式化显示                  |
| 10   | Status                    | `tranx_status`                   | 80px  | 是     | 交易状态                              |
| 11   | Payment Method            | `payment_method`                 | 135px | 否     | 支付方式，格式化显示                  |
| 12   | Gateway                   | `payment_gateway`                | 100px | 是     | 支付网关                              |
| 13   | Card Number               | `buyer_id`                       | 150px | 否     | 卡号                                  |
| 14   | Vendor Reference          | `method_trans_id`                | 150px | 否     | 供应商参考号                          |
| 15   | Auth Currency             | `auth_currency`                  | 120px | 是     | 授权货币                              |
| 16   | Total                     | `total`                          | 120px | 否     | 总金额，货币格式化，0/null 显示 NA    |
| 17   | Auth Amount               | `auth_amount`                    | 130px | 是     | 授权金额，货币格式化                  |
| 18   | Action                    | -                                | 180px | 否     | 操作按钮（Capture/Refund/Cancel）     |
| 19   | Captured Amount           | `amount_captured`                | 140px | 是     | 捕获金额，货币格式化                  |
| 20   | Sales                     | `sales`                          | 120px | 否     | 销售额，货币格式化                    |
| 21   | Tip                       | `tip`                            | 100px | 否     | 小费，货币格式化                      |
| 22   | Score                     | `risk_score`                     | 80px  | 是     | 风控分数，带颜色标识                  |
| 23   | Reason Code               | `error_code`                     | 100px | 是     | 原因码                                |
| 24   | Login Code                | `login_code`                     | 100px | 否     | 登录码                                |
| 25   | Dispute Tag               | `dispute_tag`                    | 100px | 是     | 争议标签，通过 getDisputeTag 函数计算 |
| 26   | Transaction Tag           | `transaction_tag`                | 120px | 是     | 交易标签                              |
| 27   | Terminal ID               | `terminal_id`                    | 100px | 是     | 终端 ID                               |
| 28   | Store of Original Payment | `original_merchant_name_english` | 180px | 是     | 原始支付店铺名称                      |

**可配置列**：用户可通过列配置功能显示/隐藏标记为"是"的列。

表格总宽度：根据可见列动态计算，支持横向滚动。

#### Action 按钮显示逻辑

Action 列根据 `transaction_db`、交易状态、网关类型、用户权限等条件显示不同的操作按钮或状态文字。

---

##### 1. UPI 交易 (`transaction_db === 'upi'`)

**基础显示条件**

| 按钮/状态    | 显示条件                                                                                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Capture**  | `transaction_type === 'charge'` 且 `tranx_status === 'authorized'` 且 `amount_authorized_remaining > 0`                                                                                  |
| **Refund**   | `transaction_type` 在 `['charge','capture','capture_dashboard','capture_online']` 中 且 `tranx_status === 'success'` 且用户有 refund 权限(`can_refund === 1`) 且 `remaining_balance > 0` |
| **Cancel**   | `transaction_type === 'charge'` 且 `tranx_status` 在 `['authorized','pending']` 中 且 `amount_captured <= 0`                                                                             |
| **状态文字** | `tranx_status` 在 `['pending','cancelled']` 中时显示状态文字                                                                                                                             |

**特殊网关处理（覆盖基础逻辑）**

| 网关 (`payment_gateway`)                     | Capture 规则                                                                                 | Refund 规则                                                                                                                                                                                              | Cancel 规则                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `sbps`                                       | 满足基础条件 且 `payment_method` 不在 `['linepay','paypay','rakutenpay','alipay','upop']` 中 | 满足基础条件；如果 `payment_method` 在受限列表中，还需 `amount_refunded` 有值                                                                                                                            | 满足基础条件 且 `payment_method` 不在受限列表中                                      |
| `wechatpay`, `upop`, `alipay`, `fomo`, `aps` | 除非同时满足 `payment_gateway === 'upop'` 且 `payment_method === 'card'`，否则不显示         | 不变                                                                                                                                                                                                     | 除非同时满足 `payment_gateway === 'upop'` 且 `payment_method === 'card'`，否则不显示 |
| `flutterwave`, `ppro`                        | 不变                                                                                         | 不变                                                                                                                                                                                                     | 如果 `tranx_status === 'pending'`，不显示 Cancel                                     |
| `xendit`                                     | 满足基础条件 且 `payment_method === 'card'`                                                  | 满足基础条件 且 `payment_method` 在 `['card','shopeepay','gcash','paymaya','grabpay']` 中                                                                                                                | 满足基础条件 且 `payment_method === 'card'`                                          |
| `cil`                                        | 满足基础条件 且 `payment_method === 'card'`                                                  | 满足基础条件 且 `payment_method` 在 `['alipay_hk','kor_onlinebanking','payco','kakaopay','naverpay','toss','paypay','linepay','merpay','rakutenpay','au','softbank','ntt_docomo','card','wechatpay']` 中 | 满足基础条件 且 `payment_method === 'card'`                                          |
| `gmo`                                        | 不显示                                                                                       | 满足基础条件 且 `payment_method` 在 `['paypay','merpay','rakutenpay','au','ntt_docomo','amazon']` 中                                                                                                     | 不显示                                                                               |

---

##### 2. 非 UPI 交易 (`transaction_db !== 'upi'`)

**hasPreAuth 为 true 时的处理**

| 按钮        | 显示条件                                                                           |
| ----------- | ---------------------------------------------------------------------------------- |
| **Capture** | `transaction_type === 'pos_payment'` 且 `pre_auth === 1` 且 `amount_captured <= 0` |
| **Refund**  | `transaction_type === 'pos_capture'` 且 `remaining_balance > 0`                    |
| **Cancel**  | `transaction_type === 'pos_payment'` 且 `pre_auth === 1` 且 `amount_captured <= 0` |

**覆盖逻辑（非 hasPreAuth 的 else，而是覆盖）**

| 按钮/状态    | 显示条件                                                                                                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Refund**   | `transaction_type` 在 `['charge','pos_payment','pos_capture']` 中 且 Capture 不显示 且 `tranx_status !== 'cancelled'` 且用户有 refund 权限 且 `remaining_balance > 0` 且 (`payment_method` 包含 `cup`（大小写不敏感）或 `payment_method` 在 `['alipay_hk','dana','gcash','kakaopay']` 中) |
| **Cancel**   | 如果 `payment_gateway === 'upside'`，不显示 Cancel                                                                                                                                                                                                                                        |
| **状态文字** | `tranx_status` 在 `['pending','delayed','cancelled']` 中时显示状态文字，且此时不显示 Refund                                                                                                                                                                                               |

---

##### 权限控制

- **can_refund**：从 `authStore` 获取用户的退款权限（`can_refund === 1`）
- **hasPreAuth**：从 `/summary` 接口返回，存储在 `dashboardStore`
- **hasUPI**：从 `/summary` 接口返回，存储在 `dashboardStore`

---

### Transaction Action 功能

Transaction Lookup 中的 Action 按钮（Refund, Capture, Cancel）支持对交易执行相应操作。

#### Refund 功能

> **实现状态**: ✅ 已完成
> **相关文件**: `src/components/dashboard/TransactionLookup/RefundModal.tsx`

##### 弹窗表单字段

| 字段            | 类型     | 可编辑 | 数据来源                                       |
| --------------- | -------- | ------ | ---------------------------------------------- |
| Transaction ID  | Input    | ❌     | `record.transaction_id`                        |
| Reference       | Input    | ❌     | `record.reference`                             |
| Date/Time       | Input    | ❌     | `record.time_created`                          |
| Remain Balance  | Input    | ❌     | `record.remaining_balance`（经货币转换后显示） |
| Refund Currency | Input    | ❌     | `record.currency`                              |
| Refund Amount   | Input    | ✅     | 用户输入，需验证                               |
| Reason          | TextArea | ✅     | 用户输入，必填                                 |

##### 验证规则

1. **Reason**: 不能为空
2. **Refund Amount**:
   - 必须大于 0
   - 不能大于 Remain Balance
   - 根据货币类型验证小数位数：
     - `KRW`, `JPY`, `CLP`, `ISK`, `IDR`: 不允许小数
     - `KWD`: 最多 3 位小数
     - 其他货币: 最多 2 位小数

##### API 接口

**POST /transaction_action/refund**

请求参数：

```typescript
interface RefundRequest {
  merchantId: string; // 商户数据库
  transactionId: string; // 交易 ID
  amount: string; // 退款金额（字符串格式）
  currency: string; // 货币代码
  reason: string; // 退款原因
  transactionDb: string; // 交易数据库
  sessionId: string; // 会话 ID
  type: string; // 交易类型
  originReference: string; // 原始参考号
  vendor: string; // 供应商
  source: string | null; // 来源
  gateway: string; // 网关
  pre_auth: boolean; // 是否预授权
}
```

响应结构：

```typescript
interface TransactionActionResponse {
  code: number; // 200 表示成功
  message: string; // 响应消息
}
```

##### 交互逻辑

1. 点击 Refund 按钮打开弹窗
2. 弹窗显示交易信息（只读）和可编辑字段
3. 用户填写 Refund Amount 和 Reason
4. 点击 Confirm 前进行前端验证
5. 验证通过后调用 API
6. **成功**: 显示成功提示，关闭弹窗，刷新列表
7. **失败**: 在弹窗内显示错误信息，不关闭弹窗

#### Capture 功能

> **实现状态**: ✅ 已完成
> **相关文件**: `src/components/dashboard/TransactionLookup/CaptureModal.tsx`

##### 弹窗表单字段

| 字段            | 类型     | 可编辑 | 数据来源                                                 |
| --------------- | -------- | ------ | -------------------------------------------------------- |
| Transaction ID  | Input    | ❌     | `record.transaction_id`                                  |
| Reference       | Input    | ❌     | `record.reference`                                       |
| Date/Time       | Input    | ❌     | `record.time_created`                                    |
| Original Amount | Input    | ❌     | `record.amount_authorized_remaining`（经货币转换后显示） |
| Currency        | Input    | ❌     | `record.currency`                                        |
| Capture Amount  | Input    | ✅     | 用户输入，默认值为 Original Amount，需验证               |
| Multi-Capture   | Checkbox | ✅     | 用户勾选，默认不勾选                                     |
| Last Capture    | Checkbox | ✅     | 用户勾选，默认不勾选                                     |

##### 验证规则

1. **Capture Amount**:
   - 必填
   - 必须大于 0
   - 不能大于 Original Amount (remaining authorized amount)
   - 根据货币类型验证小数位数：
     - `KRW`, `JPY`, `CLP`, `ISK`, `IDR`: 不允许小数
     - `KWD`: 最多 3 位小数
     - 其他货币: 最多 2 位小数

##### Multi-Capture 和 Last Capture 说明

- **Multi-Capture**: 勾选时表示对单次授权执行多次 Capture 操作
- **Last Capture**: 勾选时表示这是最后一次 Capture，将释放剩余授权金额
- **提示文字**: "If a transaction is partially captured the remaining authorization amount will be released"

##### API 接口

**POST /transaction_action/capture**

请求参数：

```typescript
interface CaptureRequest {
  merchantId: string; // 商户 ID
  transactionId: string; // 交易 ID
  amount: string; // Capture 金额（字符串格式）
  currency: string; // 货币代码
  transactionDb: string; // 交易数据库
  sessionId: string; // 会话 ID
  multi_capture: boolean; // 是否多次 Capture
  last_capture: boolean; // 是否最后一次 Capture
  source: string | null; // 来源
  pre_auth: boolean; // 是否预授权
}
```

响应结构：

```typescript
interface TransactionActionResponse {
  code: number; // 200 表示成功
  message: string; // 响应消息
}
```

##### 交互逻辑

1. 点击 Capture 按钮打开弹窗
2. 弹窗显示交易信息（只读）和可编辑字段
3. Capture Amount 默认填入 Original Amount
4. 用户可修改 Capture Amount 和勾选 Multi-Capture / Last Capture
5. 点击 Confirm 前进行前端验证
6. 验证通过后调用 API
7. **成功**: 显示成功提示，关闭弹窗，刷新列表
8. **失败**: 在弹窗内显示错误信息，不关闭弹窗

#### Cancel 功能

> **实现状态**: ✅ 已完成
> **相关文件**: `src/components/dashboard/TransactionLookup/CancelConfirmModal.tsx`

##### 弹窗内容

Cancel 功能采用简单确认弹窗，无需填写额外信息。

弹窗显示内容：

- **提示文字**: "Do you want to cancel this transaction?"
- **按钮**: No（取消）/ Yes（确认）

##### API 接口

**POST /transaction_action/cancel**

请求参数：

```typescript
interface CancelRequest {
  merchantId: string; // 商户 ID
  transactionId: string; // 交易 ID
  transactionDb: string; // 交易数据库
  sessionId: string; // 会话 ID
  source: string | null; // 来源
  pre_auth: boolean; // 是否预授权
}
```

响应结构：

```typescript
interface TransactionActionResponse {
  code: number; // 200 表示成功
  message: string; // 响应消息
}
```

##### 交互逻辑

1. 点击 Cancel 按钮打开确认弹窗
2. 弹窗显示确认提示文字
3. 点击 No 关闭弹窗，不执行操作
4. 点击 Yes 调用 API
5. **成功**: 关闭弹窗，刷新列表
6. **失败**: 在弹窗内显示错误信息，不关闭弹窗

#### Score 颜色标识

| 分数范围 | 颜色 | 说明     |
| -------- | ---- | -------- |
| ≥ 75     | 红色 | 高风险   |
| 50-74    | 黄色 | 中等风险 |
| < 50     | 绿色 | 低风险   |
| 无分数   | 灰色 | 未评分   |

#### Transaction Type 字段格式化

> **实现文件**: `src/utils/transactionLookup.ts` - `formatTransactionType()`

| 原始值        | 显示值   |
| ------------- | -------- |
| `pos_payment` | `charge` |
| `pos_refund`  | `refund` |
| 其他          | 原始值   |

#### Payment Method 格式化

> **实现文件**: `src/utils/transactionLookup.ts` - `formatPaymentMethod()`

| 原始值      | 显示值 |
| ----------- | ------ |
| `wechatpay` | `WXP`  |
| `alipay`    | `ALP`  |
| 其他        | 原始值 |

---

## 金额显示规则

## 金额显示规则

### 统一金额格式化方法

所有金额显示使用 `formatCurrency(amount, currency)` 函数进行统一处理。

#### 货币类型处理规则

| 货币类型分类 | 货币代码           | 处理方式     | 小数位数 |
| ------------ | ------------------ | ------------ | -------- |
| 无小数位货币 | KRW, JPY, CLP, ISK | 金额保持原样 | 0 位     |
| 三位小数货币 | KWD                | 金额 ÷ 1000  | 3 位     |
| 其他货币     | USD, CNY, EUR 等   | 金额 ÷ 100   | 2 位     |

#### 货币符号映射

| Currency | 符号 | 示例      |
| -------- | ---- | --------- |
| USD      | $    | $12.34    |
| CNY      | ¥    | ¥12.34    |
| EUR      | €    | €12.34    |
| GBP      | £    | £12.34    |
| JPY      | ¥    | ¥1,234    |
| KRW      | ₩    | ₩1,234    |
| KWD      | KD   | KD12.345  |
| AUD      | A$   | A$12.34   |
| CAD      | C$   | C$12.34   |
| HKD      | HK$  | HK$12.34  |
| SGD      | S$   | S$12.34   |
| 其他     | 代码 | XXX 12.34 |

#### 格式化规则

1. 根据 `currency` 字段显示对应的货币符号
2. 根据货币类型决定是否需要转换金额（除以 100 或 1000）
3. 使用千分位分隔符
4. 空值、null、undefined 显示 `-`

#### 应用范围

所有表格中的金额列都使用此格式化方法：

- Daily Summary: `Gross`, `Net`, `Payout`
- Monthly Summary: `Gross`, `Net`
- Transaction Lookup: `Total`, `Auth Amount`, `Captured Amount`, `Sales`, `Tip`

---

## 数据流

```
用户点击 TreeMenu
    ↓
TreeMenu 调用 setSelectedNode(node) 保存到 uiStore
    ↓
导航到 /dashboard
    ↓
DashboardPage 读取 selectedNode
    ↓
根据 selectedNode 判断：
    - 有 children → 父节点，传 merchantId 为空
    - 无 children → 叶子节点，传 merchantId
    ↓
默认加载 Daily Summary（按需加载）
    ↓
用户切换 Tab 时加载对应数据（Monthly Summary）
```

---

## 按需加载策略

- 默认 Tab 为 `Daily Summary`，初始化时只加载 Daily 数据
- 切换到其他 Tab 时才加载对应数据
- 每个 Tab 数据只加载一次，切换 Tab 不会重复加载
- **切换节点时**：重置加载状态，重新加载当前 Tab 数据
- **双击当前 Tab 时**：强制刷新当前 Tab 数据（清除筛选条件并重新加载）

### 双击刷新机制

> **实现文件**: `src/pages/DashboardPage.tsx`

通过 `isSameTab` 判断实现双击刷新：

```typescript
const isSameTab = key === activeTab;

if (isSameTab) {
  // 清除筛选条件
  setDailyDate(null);
  // 重新加载数据
  loadDailySummary(0);
}
```

各 Tab 刷新行为：

| Tab                  | 双击刷新行为                          |
| -------------------- | ------------------------------------- |
| Daily Summary        | 清除日期筛选，重新加载                |
| Monthly Summary      | 清除月份筛选，重新加载                |
| Daily Settle Summary | 清除日期筛选，重新加载                |
| Transaction Lookup   | 清除 store 数据，增加 refreshKey 触发 |
| Dispute Summary      | 清除 store 数据，增加 refreshKey 触发 |
| Alipay Direct        | 增加 refreshKey 触发组件重新加载      |
| Multi Fundings       | 增加 refreshKey 触发组件重新加载      |
| Reserve Summary      | 增加 refreshKey 触发组件重新加载      |

### 初始加载参数

- **初始加载**：`date_month` 参数为空字符串 `""`，获取所有数据，不指定日期
- **分页加载**：`date_month` 传入具体日期值
  - Daily Summary: 格式 `"2026-01-20"`
  - Monthly Summary: 格式 `"202601"`

---

## 日期筛选功能

### 功能描述

Daily Summary 和 Monthly Summary 表格上方提供日期选择器和查询按钮，用户可以按指定日期/月份筛选数据。

### UI 组件

- **日期选择器**：Ant Design DatePicker
  - Daily Summary: 日期选择器 (`DatePicker`)
  - Monthly Summary: 月份选择器 (`DatePicker picker="month"`)
- **查询按钮**：点击后触发 API 请求

### 日期格式

| 类型            | 格式示例     | 说明                         |
| --------------- | ------------ | ---------------------------- |
| Daily Summary   | `2026-01-21` | 格式为 `YYYY-MM-DD`          |
| Monthly Summary | `202601`     | 格式为 `YYYYMM`              |
| 空值            | `""`         | 清除选择后查询，返回所有数据 |

### 搜索区域样式

搜索区域采用卡片式设计，提供清晰的视觉分区：

- **背景色**：`#fafafa`
- **边框**：`1px solid #e8e8e8`
- **圆角**：`6px`
- **内边距**：`12px 16px`
- **下边距**：`16px`

### 交互逻辑

1. 用户选择日期（可选）
2. 点击 Search 按钮触发查询
3. 清除日期选择后点击 Search，传空字符串查询所有数据
4. 切换节点时重置日期筛选状态
5. 分页时保持当前筛选日期

### 参数传递

查询时修改 `/summary` 请求的 `date_month` 参数：

```typescript
// Daily Summary 查询
const dateMonth = dailyDate ? dailyDate.format('YYYY-MM-DD') : '';

// Monthly Summary 查询
const dateMonth = monthlyDate ? monthlyDate.format('YYYYMM') : '';
```

---

## 内容可见性规则

Dashboard 表格内容仅在满足以下**任一**条件时显示：

1. **`merchantId` 有值**：选中的是叶子节点（商户），传递了 `merchantId`
2. **`isMultiCurrency === false`**：API 返回的 `isMultiCurrency` 字段为 `false`

### 条件不满足时的显示

如果上述条件均不满足，表格区域显示提示信息：

```
* Please go to node page for transaction details
```

使用 Ant Design 的 `Alert` 组件，类型为 `info`，带图标显示。

### 判断逻辑

```typescript
const shouldShowContent = useMemo(() => {
  // 条件 1: merchantId 有值（叶子节点）
  if (merchantId) return true;
  // 条件 2: isMultiCurrency 为 false
  if (data && data.isMultiCurrency === false) return true;
  return false;
}, [data, merchantId]);
```

---

## 分页功能

### 基本配置

- 默认每页显示 10 条记录
- 支持分页控件
- 请求参数：`page_number`（从 0 开始）, `row_count`（每页条数）
- 响应：`total_records`（总记录数）

### 每页显示条数选择

用户可以在分页器中选择每页显示的记录数：

| 选项 | 说明   |
| ---- | ------ |
| 10   | 默认值 |
| 20   | -      |
| 30   | -      |
| 50   | -      |

### 交互逻辑

1. 切换每页显示条数时：
   - 自动重置到第一页（`page_number = 0`）
   - 使用新的 `row_count` 值请求数据
   - 保持当前日期筛选条件

2. 切换页码时：
   - 保持当前的 `row_count` 值
   - 保持当前日期筛选条件

---

## UI 布局与样式

### 页面结构

Dashboard 页面采用紧凑布局，包含以下部分：

1. **商户信息栏**：单行显示，包含图标、商户名称、MID、类型
2. **数据表格区**：Card 包装的 Tabs，包含 Daily/Monthly Summary

### 间距规格

| 区域              | 桌面端 (>768px) | 平板端 (≤768px) | 移动端 (≤480px) |
| ----------------- | --------------- | --------------- | --------------- |
| Layout Content    | 8px 4px         | 8px 4px         | 8px 4px         |
| Dashboard Page    | 4px             | 2px             | 0               |
| Card Body Padding | 16px            | 16px            | 16px            |

### 表格样式

- **表头背景色**: `#f0f0f0`
- **表头字重**: `600`
- **表头底部分割线**: `2px solid #d9d9d9`（与内容区域明显分割）
- **表头列分割线**: `1px solid #d9d9d9`
- **对齐方式**: 左对齐（表头和数据）
- **文字换行**: `white-space: nowrap`
- **斑马纹**: 奇数行 `#ffffff`，偶数行 `#fafafa`
- **行悬停背景**: 使用 CSS 变量 `var(--primary-color-light)` 跟随主题
- **链接文字颜色**: 使用主题主色（亮色蓝色，暗色紫色）
- **滚动方式**: 表格内部横向滚动（`scroll={{ x: 'max-content' }}`）

### 响应式设计

#### 移动端优化 (≤480px)

- 页面 padding 设为 0，最大化内容展示空间
- 表格单元格 padding 减小：`6px 4px`
- 字体大小减小：`11px`
- 仅保留表格内部滚动条，避免双滚动条

#### 平板端优化 (≤768px)

- 页面 padding 设为 2px
- 表格单元格 padding：`8px 6px`
- 字体大小：`12px`

---

## 错误处理

1. API 调用失败时显示错误提示
2. 无数据时显示空状态
3. 加载中显示 Loading 状态

---

## 主题配色规格

Dashboard 页面支持亮色和暗色两种主题，主题切换时以下元素需要跟随变化。

### 主题色定义

| 主题     | 主色调    | 浅色变体  | 说明                     |
| -------- | --------- | --------- | ------------------------ |
| 亮色主题 | `#1890ff` | `#e6f4ff` | Ant Design 默认蓝色      |
| 暗色主题 | `#7c3aed` | `#f3e8ff` | 紫色（仅侧边栏为深色底） |

### 需要跟随主题变化的元素

#### 1. Header 区域

| 元素        | 亮色主题  | 暗色主题  |
| ----------- | --------- | --------- |
| Citcon Logo | `#1890ff` | `#7c3aed` |
| 背景色      | `#ffffff` | `#ffffff` |

#### 2. 侧边栏

| 元素           | 亮色主题  | 暗色主题                |
| -------------- | --------- | ----------------------- |
| 背景色         | `#ffffff` | `#1e1b4b`               |
| 菜单选中项背景 | `#e6f7ff` | `#7c3aed`               |
| 菜单选中项文字 | `#1890ff` | `#ffffff`               |
| 菜单悬停背景   | `#e6f7ff` | `rgba(124,58,237,0.15)` |

#### 3. Dashboard 内容区域

| 元素             | 亮色主题  | 暗色主题  |
| ---------------- | --------- | --------- |
| Tab 选中背景     | `#1890ff` | `#7c3aed` |
| Tab 悬停背景     | `#e6f4ff` | `#f3e8ff` |
| 按钮主色         | `#1890ff` | `#7c3aed` |
| 日期图标颜色     | `#1890ff` | `#7c3aed` |
| 商店图标颜色     | `#1890ff` | `#7c3aed` |
| 表格链接文字颜色 | `#1890ff` | `#7c3aed` |
| 表格行悬停背景   | `#e6f4ff` | `#f3e8ff` |
| 分页器主色       | `#1890ff` | `#7c3aed` |

#### 4. 表格样式

| 元素           | 值                              |
| -------------- | ------------------------------- |
| 表头背景色     | `#f0f0f0`（固定，不随主题变化） |
| 表头底部分割线 | `2px solid #d9d9d9`             |
| 表头列分割线   | `1px solid #d9d9d9`             |
| 表头文字颜色   | `rgba(0, 0, 0, 0.85)`           |
| 斑马纹奇数行   | `#ffffff`                       |
| 斑马纹偶数行   | `#fafafa`                       |

### CSS 变量定义

主题颜色通过 CSS 变量实现，定义在 `src/styles/theme.css`：

```css
:root {
  --primary-color: #1890ff;
  --primary-color-light: #e6f4ff;
}

[data-theme='dark'] {
  --primary-color: #7c3aed;
  --primary-color-light: #f3e8ff;
}
```

### 主题切换实现方式

1. **全局 ConfigProvider**: `App.tsx` 中根据主题设置 `colorPrimary`
2. **CSS data-theme 属性**: 设置在 `document.documentElement` 上
3. **侧边栏独立 ConfigProvider**: `Sidebar.tsx` 中使用独立的 ConfigProvider 确保侧边栏主色正确
4. **组件内主题感知**: 需要跟随主题的组件通过 `useThemeStore` 获取当前主题并计算对应颜色

### 注意事项

1. 主内容区域（Header、Dashboard）背景始终保持白色/浅色，不随主题变化
2. 只有侧边栏在暗色主题时显示深色背景
3. 表格表头背景色保持固定灰色（`#f0f0f0`），提供稳定的视觉层级
4. 表头与内容区域通过 `2px` 的底部边框进行明显分割

---

## Tab 页签显示条件

Dashboard 页面的 Tab 页签根据用户配置（`userConfig`）和当前选中节点的属性动态显示或隐藏。

### 显示条件汇总

| Tab 页签             | 显示条件                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Daily Summary        | 默认显示，除非 `userConfig.daily_summary_disable === true`                                                                                          |
| Monthly Summary      | 默认显示，除非 `userConfig.monthly_summary_disable === true`                                                                                        |
| Transaction Lookup   | `merchantId` 存在 且 `userConfig.transactions_lookup_disable !== true`                                                                              |
| Daily Settle Summary | `merchantId` 存在                                                                                                                                   |
| Dispute Summary      | `merchantId` 存在 且 (`userConfig.dispute_manage === true` 或 (`userConfig.daily_dispute_summary_disable === false` 且 `hasDisputeChild === true`)) |
| Alipay Direct        | `selectedNode.hasAliDirect` 不为空且不为 0                                                                                                          |
| Multi Fundings       | `selectedNode.hasMultiFundings` 不为空且不为 0                                                                                                      |
| Reserve Summary      | `userConfig.reserve_summary_disable === false` 且 `hasReserve === true`                                                                             |
| Smart Gateway        | 暂时全部隐藏                                                                                                                                        |

### 配置来源

- **userConfig**: 从 `authStore.config` 字段解析而来（JSON 字符串）
- **hasDisputeChild / hasReserve**: 从 `/tranx/summary` API 响应中获取
- **selectedNode.hasAliDirect / hasMultiFundings / merchantId**: 从层级树节点数据中获取

---

## Multi Fundings 模块规格

### 功能概述

Multi Fundings 模块展示商户的多渠道资金结算数据，按日期、支付方式分组显示交易统计信息。

### API 接口

- **接口地址**: `POST /tranx/multi_fundings`
- **Content-Type**: `application/json`

### 请求参数

| 参数        | 类型   | 说明                              |
| ----------- | ------ | --------------------------------- |
| merchantId  | string | 商户 ID                           |
| session_id  | string | 会话 ID                           |
| date_month  | string | 日期筛选，格式 "YYYY-MM-DD" 或 "" |
| page_number | string | 页码，从 0 开始                   |
| row_count   | number | 每页记录数                        |

### 响应字段

| 字段          | 类型   | 说明         |
| ------------- | ------ | ------------ |
| code          | string | 响应码       |
| aliDirect     | array  | 数据记录列表 |
| total_records | number | 总记录数     |

### 表格列配置

| 列名        | 字段映射     | 说明                 |
| ----------- | ------------ | -------------------- |
| Date        | happenedDate | 发生日期（带时区）   |
| Method      | funding      | 支付方式             |
| Total Tranx | count        | 交易数量             |
| Gross       | sum          | 总额，显示货币符号   |
| Payout      | settled      | 支付额，显示货币符号 |

### 显示条件

仅当 `selectedNode.hasMultiFundings` 不为空且不为 0 时显示该 Tab。

---

## Reserve Summary 模块规格

### 功能概述

Reserve Summary 模块展示商户的储备金信息，包含三个数据表格：

1. **Fixed Reserve**: 固定储备金
2. **Rolling Reserve**: 滚动储备金配置
3. **Rolling Details**: 滚动储备金明细交易

### API 接口

- **接口地址**: `POST /tranx/summary`
- **Content-Type**: `application/json`
- **search_type**: `"reserve"`

### 请求参数

| 参数              | 类型   | 说明                               |
| ----------------- | ------ | ---------------------------------- |
| hierarchy_user_id | number | 商户节点 ID                        |
| merchantId        | string | 商户 ID                            |
| session_id        | string | 会话 ID                            |
| search_type       | string | 固定为 "reserve"                   |
| date_month        | string | 空字符串                           |
| disputeType       | string | 固定为 "all"                       |
| page_number       | string | 页码，从 0 开始                    |
| row_count         | number | 每页记录数（用于 Rolling Details） |

### 响应字段

| 字段             | 类型   | 说明                  |
| ---------------- | ------ | --------------------- |
| code             | number | 响应码                |
| merchant_info    | object | 商户信息，含 currency |
| fixed_reserves   | array  | 固定储备金列表        |
| rolling_reserves | array  | 滚动储备金列表        |
| rolling_detail   | object | 滚动储备金明细        |

### Fixed Reserve 表格

| 列名       | 字段映射     | 说明                                |
| ---------- | ------------ | ----------------------------------- |
| Type       | type         | 固定为 "Fixed"                      |
| Amount     | total_amount | 金额，显示货币符号                  |
| Term       | -            | 从 content JSON 解析，如 "6 months" |
| Start Date | start_date   | 开始日期                            |
| End Date   | end_date     | 结束日期                            |
| Status     | status       | 状态（active/released 等）          |

### Rolling Reserve 表格

| 列名       | 字段映射   | 说明                                |
| ---------- | ---------- | ----------------------------------- |
| Type       | type       | 固定为 "Rolling"                    |
| Percent    | -          | 从 content JSON 解析，如 "10%"      |
| Term       | -          | 从 content JSON 解析 rolling_period |
| Start Date | start_date | 开始日期                            |
| End Date   | end_date   | 结束日期                            |
| Status     | status     | 状态                                |

### Rolling Details 表格

| 列名     | 字段映射 | 说明                   |
| -------- | -------- | ---------------------- |
| Date     | date     | 日期                   |
| Withheld | withheld | 预扣金额，显示货币符号 |
| Released | released | 释放金额，显示货币符号 |
| Net      | net      | 净额，显示货币符号     |

### 分页说明

- Fixed Reserve 和 Rolling Reserve 表格无分页（数据量较少）
- Rolling Details 表格支持分页，不显示 "Total records" 文字

### 显示条件

仅当 `userConfig.reserve_summary_disable === false` 且 `/tranx/summary` 响应的 `hasReserve === true` 时显示该 Tab。

---

## 页面加载与路由

### 默认路由

应用首次加载时，默认路由重定向到 `/dashboard` 页面，而非 `UserListPage`。

```typescript
// src/router/routes.tsx
{
  path: '/',
  element: <Navigate to="/dashboard" replace />
}
```

### 自动选中顶级节点

当用户进入 Dashboard 页面时，如果没有选中任何节点：

1. 自动选中层级树的第一个顶级节点
2. 展开该节点
3. **自动选中 `Daily Summary` 作为默认 Tab**
4. **自动加载 Daily Summary 数据**

### 实现逻辑

> **实现文件**: `src/pages/DashboardPage.tsx`

```typescript
// 使用 ref 追踪自动选中的节点 ID
const autoSelectedNodeIdRef = useRef<number | null>(null);

// 自动选中顶级节点
useEffect(() => {
  if (!selectedNode && hierarchyTree && hierarchyTree.length > 0) {
    const topNode = hierarchyTree[0];
    autoSelectedNodeIdRef.current = topNode.id; // 标记自动选中的节点
    setSelectedNode(topNode);
    setExpandedKeys([`node-${topNode.id}`]);
  }
}, [selectedNode, hierarchyTree]);

// 节点变化时的处理
useEffect(() => {
  if (!selectedNode) return;

  // 重置自动选中标记
  if (autoSelectedNodeIdRef.current === selectedNode?.id) {
    autoSelectedNodeIdRef.current = null;
  }

  // 切换节点时始终重置到 'daily' Tab 并加载数据
  const targetTab = 'daily';
  setActiveTab(targetTab);
  loadDailySummary(0);
}, [selectedNode]);
```

---

## 用户配置持久化

### 问题描述

用户配置（`config`）存储在 `authStore` 中，需要在页面刷新后保持。

### 解决方案

在 `authStore` 的 Zustand persist 配置中，确保 `config` 字段被包含在 `partialize` 中：

```typescript
// src/stores/authStore.ts
persist(
  (set, get) => ({
    /* store definition */
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      token: state.token,
      sessionId: state.sessionId,
      username: state.username,
      hierarchyTree: state.hierarchyTree,
      can_refund: state.can_refund,
      config: state.config, // 确保 config 被持久化
    }),
  },
);
```

### 配置解析

使用 `parseUserConfig` 函数将 JSON 字符串解析为 `UserConfig` 对象：

```typescript
export const parseUserConfig = (config: string): UserConfig => {
  if (!config) return {};
  try {
    return JSON.parse(config) as UserConfig;
```

---

## All Transactions Search 页面

### 功能概述

All Transactions Search 是一个独立页面（路由：`/alltransactions`），提供全局交易搜索功能。用户可以通过日期范围和关键字搜索所有交易记录，无需先选择商户节点。

### 用户故事

**作为**用户，**我希望**能够在一个独立页面搜索所有交易记录，**以便**快速查找特定交易而无需逐个选择商户。

**验收标准**：

1. 页面通过左侧静态菜单 "All Transactions" 进入
2. 点击静态菜单时，动态菜单（TreeMenu）的选中状态被清除
3. 支持日期范围筛选
4. 支持关键字搜索
5. 页面加载时自动调用 API 获取数据
6. 支持分页功能

### 筛选组件

| 组件        | 类型             | 说明                                   |
| ----------- | ---------------- | -------------------------------------- |
| Date Range  | RangePicker      | 选择开始和结束日期，格式：`YYYY-MM-DD` |
| Search      | Input            | 搜索关键字输入框                       |
| Search 按钮 | Button (primary) | 点击后执行搜索                         |

默认日期范围（测试用）：`2022-01-01` 到 `2023-03-01`

### 表头配置（22 列）

| 序号 | 列名                      | 字段映射                         | 宽度  | 说明                       |
| ---- | ------------------------- | -------------------------------- | ----- | -------------------------- |
| 1    | Location                  | `location`                       | 150px | 位置                       |
| 2    | Store Name                | `store_name`                     | 150px | 店铺名称                   |
| 3    | Transaction ID            | `transaction_id`                 | 220px | 交易 ID，支持复制          |
| 4    | Parent Transaction ID     | `parent_transaction_id`          | 220px | 父交易 ID，支持复制        |
| 5    | Reference                 | `reference1`                     | 150px | 参考号1                    |
| 6    | Reference2                | `reference2`                     | 150px | 参考号2                    |
| 7    | Extral Reference          | `extral_reference`               | 150px | 额外参考号                 |
| 8    | Date/Time                 | `time_created` + `mttimezone`    | 180px | 时间和时区分两行显示       |
| 9    | Transaction Type          | `transaction_type`               | 130px | 交易类型（需转换，见下方） |
| 10   | Payment Method            | `payment_method`                 | 130px | 支付方式（需转换，见下方） |
| 11   | Card Number               | `buyer_id`                       | 150px | 买家 ID                    |
| 12   | Vendor Reference          | `method_trans_id`                | 150px | 供应商参考号               |
| 13   | Auth Currency             | `auth_currency`                  | 110px | 授权货币                   |
| 14   | Total                     | `total`                          | 120px | 总金额（金额类型）         |
| 15   | Auth Amount               | `auth_amount`                    | 120px | 授权金额（金额类型）       |
| 16   | Captured Amount           | `amount_captured`                | 130px | 已捕获金额（金额类型）     |
| 17   | Sales                     | `sales`                          | 120px | 销售额（金额类型）         |
| 18   | Tip                       | `tip`                            | 100px | 小费（金额类型）           |
| 19   | Login Code                | `login_code`                     | 120px | 登录代码                   |
| 20   | Transaction Tag           | `transaction_tag`                | 130px | 交易标签                   |
| 21   | Terminal ID               | `terminal_id`                    | 120px | 终端 ID                    |
| 22   | Store of Original Payment | `original_merchant_name_english` | 180px | 原始支付店铺               |

表格总宽度：`3200px`，支持横向滚动。

### 字段转换规则

#### Transaction Type 转换

| 原始值        | 显示值   |
| ------------- | -------- |
| `pos_payment` | `charge` |
| `pos_refund`  | `refund` |
| 其他          | 原值     |

#### Payment Method 转换

| 原始值      | 显示值 |
| ----------- | ------ |
| `wechatpay` | `WXP`  |
| `alipay`    | `ALP`  |
| 其他        | 原值   |

#### Date/Time 显示格式

时间和时区分两行显示：

```
2022-03-01 12:31:55
(America/Los_Angeles)
```

第二行时区以较小字体（11px）和灰色（#888）显示。

### 分页配置

| 配置项       | 值                               |
| ------------ | -------------------------------- |
| 默认每页条数 | 10                               |
| 可选每页条数 | 10, 20, 50, 100                  |
| 显示总数格式 | `{start}-{end} of {total} items` |

### 样式规格

1. 页面内边距：`16px`
2. 筛选区域使用与 Dashboard 相同的 `date-filter-container` 样式
3. 表格使用 `dashboard-table` 样式类，与 Dashboard 表头样式统一
4. 图标颜色跟随主题：浅色主题 `#1890ff`，深色主题 `#7c3aed`

### 技术实现

#### 文件结构

```
src/
├── components/dashboard/AllTransactionsSearch/
│   ├── AllTransactionsSearch.tsx   # 主组件
│   └── index.ts                    # 导出文件
├── services/api/
│   └── allTransactionsApi.ts       # API 服务
├── stores/
│   └── allTransactionsStore.ts     # Zustand Store
└── pages/
    └── AllTransactionsPage.tsx     # 页面组件
```

#### 路由配置

```typescript
// src/router/routes.tsx
{
  path: 'alltransactions',
  element: <AllTransactionsPage />,
}
```

#### 菜单配置

点击静态菜单 "All Transactions" 时：

1. 清除 TreeMenu 的选中状态（`setSelectedNode(null)`）
2. 导航到 `/alltransactions` 路由

```

```
