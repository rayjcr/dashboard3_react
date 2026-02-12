# Tasks: Dashboard 模块

**Input**: Design documents from `/spec/dashboard/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root
- Paths follow constitution.md structure

---

## Phase 1: Types & Utils (Shared Infrastructure)

**Purpose**: 创建类型定义和工具函数

- [x] T001 [P] 创建 `src/types/dashboard.ts`：定义 Dashboard 相关类型

  - `SummarySearchType` 类型
  - `SummaryRequest` 接口
  - `HierarchyUserData` 接口
  - `TransactionRecord` 接口
  - `SummaryResponse` 接口
  - `DashboardState` 接口
  - `UserConfig` 接口
  - `DailySummaryTableRow` 接口
  - `MonthlySummaryTableRow` 接口

- [x] T002 [P] 创建 `src/utils/currency.ts`：货币格式化工具

  - `CURRENCY_SYMBOLS` 常量
  - `formatCurrency(amount: number, currency: string): string` 函数

- [x] T003 [P] 创建 `src/utils/dashboard.ts`：Dashboard 工具函数
  - `parseUserConfig(configString: string): UserConfig` 函数
  - `isDailyDetailClickable(config: UserConfig, merchantId?: string): boolean` 函数
  - `isMonthlyDetailClickable(config: UserConfig, merchantId?: string): boolean` 函数
  - `getStatusDisplay(status, settleDate, umfEnabled, hasJkoPay, isElavonSite): string` 函数

**Checkpoint**: 基础类型和工具就绪 ✅

---

## Phase 2: API Service & Store

**Purpose**: 创建 API 服务和状态管理

- [x] T004 创建 `src/services/api/summaryApi.ts`：

  - 实现 `fetchSummary(params: SummaryRequest): Promise<SummaryResponse>`
  - POST `/tranx/summary`
  - Content-Type: application/json

- [x] T005 创建 `src/stores/dashboardStore.ts`：

  - `dailySummary`, `dailySummaryLoading`, `dailySummaryError`
  - `dailyPage`, `dailyPageSize`
  - `monthlySummary`, `monthlySummaryLoading`, `monthlySummaryError`
  - `monthlyPage`, `monthlyPageSize`
  - Actions: `fetchDailySummary`, `fetchMonthlySummary`, `setDailyPage`, `setMonthlyPage`, `clearDashboard`

- [x] T006 更新 `src/stores/index.ts`：导出 `useDashboardStore`

**Checkpoint**: API 和 Store 就绪 ✅

---

## Phase 3: User Story 2 - Daily Summary (Priority: P1)

**Goal**: 实现 Daily Summary 表格组件

**Independent Test**: 访问 Dashboard 页面，Daily Summary 表格正确显示数据

### Implementation for User Story 2

- [x] T007 [US2] 创建 `src/components/dashboard/DailySummaryTable.tsx`：
  - 使用 Ant Design `Table` 组件
  - 表头：Date (Creation Time), Total Tranx, Gross, Net, Payout, Status, Payment Methods
  - Elavon 商户时 Status 列标题显示 `Status*`
  - 金额使用 `formatCurrency` 格式化
  - Date 列点击判断（使用 `isDailyDetailClickable`）
  - Status 显示逻辑（使用 `getStatusDisplay`）
  - 支持分页
  - Loading 和 Empty 状态

**Checkpoint**: US2 完成，Daily Summary 表格可独立测试 ✅

---

## Phase 4: User Story 3 - Monthly Summary (Priority: P1)

**Goal**: 实现 Monthly Summary 表格组件

**Independent Test**: 访问 Dashboard 页面，Monthly Summary 表格正确显示数据

### Implementation for User Story 3

- [x] T008 [US3] 创建 `src/components/dashboard/MonthlySummaryTable.tsx`：

  - 使用 Ant Design `Table` 组件
  - 表头：Month, Total Tranx, Gross, Net\*, Payment Methods
  - 金额使用 `formatCurrency` 格式化
  - Month 列点击判断（使用 `isMonthlyDetailClickable`）
  - 支持分页
  - Loading 和 Empty 状态

- [x] T009 创建 `src/components/dashboard/index.ts`：
  - 导出 `DailySummaryTable`, `MonthlySummaryTable`

**Checkpoint**: US3 完成，Monthly Summary 表格可独立测试 ✅

---

## Phase 5: Dashboard Page Integration

**Purpose**: 整合所有组件到 Dashboard 页面

- [x] T010 [US2+US3] 更新 `src/pages/DashboardPage.tsx`：

  - 导入 `useDashboardStore`, `useAuthStore`, `useUIStore`
  - 根据 `selectedNode` 构建请求参数（包含 `session_id`）
  - 判断是叶子节点（无 children）还是父节点（有 children）
  - 按需加载策略：默认只加载 Daily Summary
  - Tab 切换时加载对应数据（Monthly Summary）
  - 渲染节点信息卡片
  - 渲染 `DailySummaryTable` 组件
  - 渲染 `MonthlySummaryTable` 组件
  - 处理 Loading 和 Error 状态
  - 空节点时显示提示信息

- [x] T011 代码清理和 ESLint 检查

**Checkpoint**: Dashboard 页面整合完成 ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Types & Utils)**: No dependencies - can start immediately
- **Phase 2 (API & Store)**: Depends on Phase 1 (需要类型定义)
- **Phase 3 (Daily Summary)**: Depends on Phase 1 & 2
- **Phase 4 (Monthly Summary)**: Depends on Phase 1 & 2
- **Phase 5 (Integration)**: Depends on all previous phases

### Parallel Opportunities

- T001, T002, T003 can run in parallel (different files, no dependencies)
- T007 (Daily Summary) and T008 (Monthly Summary) can run in parallel after Phase 2

### Recommended Order

1. T001, T002, T003 (Types & Utils) - 可并行
2. T004, T005, T006 (API & Store)
3. T007 | T008 (Summary Tables) - 可并行
4. T009 (Export)
5. T010, T011 (Integration & Cleanup)

---

## Summary

- **Total Tasks**: 27 (T001-T027)
- **Phase 1 (Types & Utils)**: 3 tasks (T001-T003)
- **Phase 2 (API & Store)**: 3 tasks (T004-T006)
- **Phase 3 (US2 - Daily Summary)**: 1 task (T007)
- **Phase 4 (US3 - Monthly Summary)**: 2 tasks (T008-T009)
- **Phase 5 (Integration)**: 2 tasks (T010-T011)
- **Phase 6 (UI Optimization)**: 5 tasks (T012-T016)
- **Phase 7 (Multi Fundings)**: 3 tasks (T017-T019)
- **Phase 8 (Reserve Summary)**: 3 tasks (T020-T022)
- **Phase 9 (Tab Visibility & Routing)**: 5 tasks (T023-T027)
- **Parallel Opportunities**: T001-T003, T007-T008

---

## Notes

- ✅ 已实现：Daily Summary, Monthly Summary, Transaction Lookup, Daily Settle Summary, Dispute Summary, Alipay Direct Settlement, Multi Fundings, Reserve Summary
- 🔜 未实现：Smart Gateway（暂时隐藏）
- 详情点击功能的目标页面暂未定义，当前仅实现点击判断逻辑

---

## 已完成的 UI 优化

### T012 UI 间距与布局优化

- [x] Layout Content padding 从 `24px` 改为 `8px 4px`（上下 8px，左右 4px）
- [x] Dashboard 页面 padding：桌面端 4px，平板端 2px，移动端 0
- [x] Card 内部 padding 设为 16px（表格和 Card 边框的间距）
- [x] 移除 Dashboard 标题，采用紧凑布局
- [x] 商户信息栏改为单行显示

### T013 表格样式优化

- [x] 所有列数据和表头左对齐
- [x] 表头背景色设为 `#e6e6e6`
- [x] 表头字重设为 `600`
- [x] 移除外层滚动条，仅保留表格内部滚动（避免双滚动条）

### T014 响应式设计

- [x] 移动端（≤480px）页面 padding 为 0，最大化内容空间
- [x] 移动端表格字体缩小至 11px，单元格 padding 为 `6px 4px`
- [x] 平板端（≤768px）表格字体 12px，单元格 padding 为 `8px 6px`

### T015 Payout 列条件显示

- [x] 添加 `MERCHANT_IDS_HAVE_PAYOUT` 常量（19 个商户 ID）
- [x] 添加 `shouldShowPayoutColumn(merchantId)` 函数
- [x] Daily Summary 表格根据 merchant_id 动态显示 Payout 列

### T016 详情点击逻辑修正

- [x] 修正逻辑：子商户（有 merchant_id）可点击，父节点（无 merchant_id）不可点击
- [x] 更新 `isDailyDetailClickable` 和 `isMonthlyDetailClickable` 函数

---

## Phase 7: Multi Fundings 模块

**Purpose**: 实现 Multi Fundings Tab 功能

### T017 创建 Multi Fundings API 服务

- [x] 创建 `src/services/api/multiFundingsApi.ts`：
  - 实现 `fetchMultiFundings(params: MultiFundingsRequest): Promise<MultiFundingsResponse>`
  - POST `/tranx/multi_fundings`
  - Content-Type: application/json

### T018 创建 Multi Fundings Store

- [x] 创建 `src/stores/multiFundingsStore.ts`：
  - `multiFundingsData: MultiFundingsResponse | null`
  - `loading: boolean`
  - `error: string | null`
  - `page: number`
  - `pageSize: number`
  - Actions: `fetchMultiFundings`, `setPage`, `setPageSize`, `clearMultiFundings`
  - 支持 AbortController 取消请求

### T019 创建 Multi Fundings 组件

- [x] 创建 `src/components/dashboard/MultiFundings/MultiFundingsTable.tsx`：

  - 表格列：Date, Method, Total Tranx, Gross, Payout
  - 样式与 Transaction Lookup 表格一致
  - 支持分页

- [x] 创建 `src/components/dashboard/MultiFundings/index.tsx`：

  - 整合表格组件和数据加载逻辑
  - 支持 refreshKey 刷新

- [x] 更新 `src/components/dashboard/index.ts`：
  - 导出 `MultiFundings` 组件

**Checkpoint**: Multi Fundings 模块完成 ✅

---

## Phase 8: Reserve Summary 模块

**Purpose**: 实现 Reserve Summary Tab 功能

### T020 创建 Reserve Summary API 服务

- [x] 创建 `src/services/api/reserveSummaryApi.ts`：
  - 实现 `fetchReserveSummary(params: ReserveSummaryRequest): Promise<ReserveSummaryResponse>`
  - POST `/tranx/summary` with search_type: 'reserve'
  - Content-Type: application/json

### T021 创建 Reserve Summary Store

- [x] 创建 `src/stores/reserveSummaryStore.ts`：
  - `reserveSummaryData: ReserveSummaryResponse | null`
  - `loading: boolean`
  - `error: string | null`
  - `currency: string`
  - `page: number`, `pageSize: number`（用于 Rolling Details）
  - Actions: `fetchReserveSummary`, `setPage`, `setPageSize`, `clearReserveSummary`
  - 支持 AbortController 取消请求

### T022 创建 Reserve Summary 组件

- [x] 创建 `src/components/dashboard/ReserveSummary/FixedReserveTable.tsx`：

  - 表格列：Type, Amount, Term, Start Date, End Date, Status
  - 解析 content JSON 获取 term

- [x] 创建 `src/components/dashboard/ReserveSummary/RollingReserveTable.tsx`：

  - 表格列：Type, Percent, Term, Start Date, End Date, Status
  - 解析 content JSON 获取 percent, rolling_period

- [x] 创建 `src/components/dashboard/ReserveSummary/RollingDetailsTable.tsx`：

  - 表格列：Date, Withheld, Released, Net
  - 支持分页，不显示 "Total records" 文字

- [x] 创建 `src/components/dashboard/ReserveSummary/index.tsx`：

  - 整合三个表格组件
  - 支持 refreshKey 刷新

- [x] 更新 `src/components/dashboard/index.ts`：
  - 导出 `ReserveSummary` 组件

**Checkpoint**: Reserve Summary 模块完成 ✅

---

## Phase 9: Tab 显示条件与路由

**Purpose**: 实现 Tab 页签动态显示和默认路由

### T023 添加 UserConfig 类型定义

- [x] 更新 `src/types/dashboard.ts`：
  - 添加 `UserConfig` 接口（包含各种 disable/enable 配置）
  - 添加 `parseUserConfig(config: string): UserConfig` 函数

### T024 实现 Tab 显示条件逻辑

- [x] 更新 `src/pages/DashboardPage.tsx`：
  - 解析 `authStore.config` 为 `UserConfig`
  - 实现 `tabItems` 过滤逻辑：
    - Daily Summary: `daily_summary_disable !== true`
    - Monthly Summary: `monthly_summary_disable !== true`
    - Transaction Lookup: `merchantId` 存在 且 `transactions_lookup_disable !== true`
    - Daily Settle Summary: `merchantId` 存在
    - Dispute Summary: `merchantId` 存在 且 (`dispute_manage === true` 或 (`daily_dispute_summary_disable === false` 且 `hasDisputeChild`))
    - Alipay Direct: `hasAliDirect !== 0`
    - Multi Fundings: `hasMultiFundings !== 0`
    - Reserve Summary: `reserve_summary_disable === false` 且 `hasReserve === true`
    - Smart Gateway: 暂时全部隐藏

### T025 修改默认路由

- [x] 更新 `src/router/routes.tsx`：
  - 默认路由从 `UserListPage` 改为重定向到 `/dashboard`
  - `<Navigate to="/dashboard" replace />`

### T026 实现自动选中顶级节点

- [x] 更新 `src/pages/DashboardPage.tsx`：
  - 当无选中节点时，自动选中 `hierarchyTree[0]`
  - 使用 `wasAutoSelectedRef` 标记是否为自动选中
  - 自动选中时不选择任何 Tab，不加载数据
  - 用户手动选择节点时，选中 Daily Summary Tab 并加载数据

### T027 修复 config 持久化问题

- [x] 更新 `src/stores/authStore.ts`：
  - 在 `partialize` 中添加 `config: state.config`
  - 确保用户配置在页面刷新后保持

**Checkpoint**: Tab 显示条件与路由完成 ✅
