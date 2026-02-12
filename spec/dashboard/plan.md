# 实施计划 - Dashboard 模块

本计划概述了根据 `spec/dashboard/spec.md` 实现 Dashboard 功能的步骤。

---

## 用户故事 1：节点数据展示

### 1. 已完成的部分

- [x] TreeMenu 点击时调用 `setSelectedNode(node)` 保存到 uiStore
- [x] 导航到 `/dashboard` 页面
- [x] DashboardPage 读取 `selectedNode`

### 2. 待完成部分

无需额外修改，现有实现已满足需求。

---

## 用户故事 2 & 3：Summary 数据展示

### 1. 创建类型定义

- [ ] 创建 `src/types/dashboard.ts`：
  - [ ] 定义 `SummarySearchType` 类型
  - [ ] 定义 `SummaryRequest` 接口
  - [ ] 定义 `HierarchyUserData` 接口
  - [ ] 定义 `TransactionRecord` 接口
  - [ ] 定义 `SummaryResponse` 接口
  - [ ] 定义 `DashboardState` 接口
  - [ ] 定义 `UserConfig` 接口
  - [ ] 定义 `DailySummaryTableRow` 接口
  - [ ] 定义 `MonthlySummaryTableRow` 接口

### 2. 创建 API 服务

- [ ] 创建 `src/services/api/summaryApi.ts`：
  - [ ] 实现 `fetchSummary(params: SummaryRequest): Promise<SummaryResponse>`
  - [ ] POST `/tranx/summary`
  - [ ] Content-Type: application/json

### 3. 创建工具函数

- [ ] 创建 `src/utils/currency.ts`：

  - [ ] 定义 `CURRENCY_SYMBOLS` 常量
  - [ ] 实现 `formatCurrency(amount: number, currency: string): string`

- [ ] 创建 `src/utils/dashboard.ts`：
  - [ ] 实现 `isDailyDetailClickable(config, merchantId): boolean`
  - [ ] 实现 `isMonthlyDetailClickable(config, merchantId): boolean`
  - [ ] 实现 `getStatusDisplay(status, settleDate, flags): string`
  - [ ] 实现 `parseUserConfig(configString: string): UserConfig`

### 4. 创建 Dashboard Store

- [ ] 创建 `src/stores/dashboardStore.ts`：

  - [ ] `dailySummary: SummaryResponse | null`
  - [ ] `dailySummaryLoading: boolean`
  - [ ] `dailySummaryError: string | null`
  - [ ] `dailyPage: number`
  - [ ] `dailyPageSize: number`
  - [ ] `monthlySummary: SummaryResponse | null`
  - [ ] `monthlySummaryLoading: boolean`
  - [ ] `monthlySummaryError: string | null`
  - [ ] `monthlyPage: number`
  - [ ] `monthlyPageSize: number`
  - [ ] Action: `fetchDailySummary(params)`
  - [ ] Action: `fetchMonthlySummary(params)`
  - [ ] Action: `setDailyPage(page)`
  - [ ] Action: `setMonthlyPage(page)`
  - [ ] Action: `clearDashboard()`

- [ ] 更新 `src/stores/index.ts`：导出 `useDashboardStore`

### 5. 创建 Summary 表格组件

- [ ] 创建 `src/components/dashboard/DailySummaryTable.tsx`：

  - [ ] 使用 Ant Design `Table` 组件
  - [ ] 表头：Date (Creation Time), Total Tranx, Gross, Net, Payout, Status, Payment Methods
  - [ ] Elavon 商户时 Status 列标题显示 `Status*`
  - [ ] 金额使用 `formatCurrency` 格式化
  - [ ] Date 列点击判断（使用 `isDailyDetailClickable`）
  - [ ] Status 显示逻辑（使用 `getStatusDisplay`）
  - [ ] 支持分页

- [ ] 创建 `src/components/dashboard/MonthlySummaryTable.tsx`：

  - [ ] 使用 Ant Design `Table` 组件
  - [ ] 表头：Month, Total Tranx, Gross, Net\*, Payment Methods
  - [ ] 金额使用 `formatCurrency` 格式化
  - [ ] Month 列点击判断（使用 `isMonthlyDetailClickable`）
  - [ ] 支持分页

- [ ] 创建 `src/components/dashboard/index.ts`：
  - [ ] 导出 `DailySummaryTable`, `MonthlySummaryTable`

### 6. 更新 Dashboard 页面

- [ ] 更新 `src/pages/DashboardPage.tsx`：
  - [ ] 导入 `useDashboardStore`, `useAuthStore`
  - [ ] 根据 `selectedNode` 构建请求参数
  - [ ] 判断是叶子节点还是父节点
  - [ ] 默认只加载 Daily Summary（按需加载策略）
  - [ ] Tab 切换时加载对应数据
  - [ ] 渲染 `DailySummaryTable` 和 `MonthlySummaryTable`
  - [ ] 处理 Loading 和 Error 状态
  - [ ] 节点切换时清空并重新加载当前 Tab 数据

---

## 文件结构

```
src/
├── types/
│   └── dashboard.ts              # Dashboard 类型定义
├── services/api/
│   ├── summaryApi.ts             # Summary API 服务
│   ├── transactionLookupApi.ts   # Transaction Lookup API 服务
│   ├── disputeApi.ts             # Dispute API 服务
│   ├── aliDirectApi.ts           # Alipay Direct API 服务
│   ├── multiFundingsApi.ts       # Multi Fundings API 服务
│   └── reserveSummaryApi.ts      # Reserve Summary API 服务
├── stores/
│   ├── dashboardStore.ts         # Dashboard 状态管理
│   ├── transactionLookupStore.ts # Transaction Lookup 状态管理
│   ├── disputeStore.ts           # Dispute 状态管理
│   ├── aliDirectStore.ts         # Alipay Direct 状态管理
│   ├── multiFundingsStore.ts     # Multi Fundings 状态管理
│   ├── reserveSummaryStore.ts    # Reserve Summary 状态管理
│   └── index.ts                  # Store 导出
├── utils/
│   ├── currency.ts               # 货币格式化工具
│   └── dashboard.ts              # Dashboard 工具函数
├── components/dashboard/
│   ├── DailySummaryTable.tsx     # 日报表格组件
│   ├── MonthlySummaryTable.tsx   # 月报表格组件
│   ├── DailySettleSummaryTable.tsx # 日结表格组件
│   ├── TransactionLookup/        # Transaction Lookup 组件目录
│   ├── DisputeSummary/           # Dispute Summary 组件目录
│   ├── AliDirectSettlement/      # Alipay Direct 组件目录
│   ├── MultiFundings/            # Multi Fundings 组件目录
│   ├── ReserveSummary/           # Reserve Summary 组件目录
│   └── index.ts                  # 组件导出
├── router/
│   └── routes.tsx                # 路由配置（默认路由到 /dashboard）
└── pages/
    └── DashboardPage.tsx         # Dashboard 页面
```

---

## 依赖关系

```
types/dashboard.ts
    ↓
services/api/*.ts (summaryApi, transactionLookupApi, disputeApi, aliDirectApi, multiFundingsApi, reserveSummaryApi)
    ↓
utils/currency.ts + utils/dashboard.ts
    ↓
stores/*.ts (dashboardStore, transactionLookupStore, disputeStore, aliDirectStore, multiFundingsStore, reserveSummaryStore)
    ↓
components/dashboard/*
    ↓
pages/DashboardPage.tsx
```

---

## 实施顺序

1. **Phase 1**: 类型定义和工具函数

   - `types/dashboard.ts`
   - `utils/currency.ts`
   - `utils/dashboard.ts`

2. **Phase 2**: API 和 Store

   - `services/api/summaryApi.ts`
   - `stores/dashboardStore.ts`
   - `stores/index.ts`

3. **Phase 3**: 表格组件

   - `components/dashboard/DailySummaryTable.tsx`
   - `components/dashboard/MonthlySummaryTable.tsx`
   - `components/dashboard/index.ts`

4. **Phase 4**: 页面整合

   - `pages/DashboardPage.tsx`

5. **Phase 5**: Multi Fundings 模块 ✅

   - `services/api/multiFundingsApi.ts`
   - `stores/multiFundingsStore.ts`
   - `components/dashboard/MultiFundings/MultiFundingsTable.tsx`
   - `components/dashboard/MultiFundings/index.tsx`

6. **Phase 6**: Reserve Summary 模块 ✅

   - `services/api/reserveSummaryApi.ts`
   - `stores/reserveSummaryStore.ts`
   - `components/dashboard/ReserveSummary/FixedReserveTable.tsx`
   - `components/dashboard/ReserveSummary/RollingReserveTable.tsx`
   - `components/dashboard/ReserveSummary/RollingDetailsTable.tsx`
   - `components/dashboard/ReserveSummary/index.tsx`

7. **Phase 7**: Tab 显示条件与路由 ✅
   - 添加 `UserConfig` 类型定义和 `parseUserConfig` 函数
   - 实现 Tab 页签过滤逻辑
   - 修改默认路由重定向到 `/dashboard`
   - 实现自动选中顶级节点逻辑
   - 修复 `authStore.config` 持久化问题

---

## 测试与验证

- [x] **功能测试**：

  - [x] 点击叶子节点，Dashboard 显示该商户的数据
  - [x] 点击父节点，Dashboard 显示汇总数据
  - [x] Daily Summary 表格正确显示数据
  - [x] Monthly Summary 表格正确显示数据
  - [x] 金额格式化正确（货币符号、千分位、无小数）
  - [x] Elavon 商户 Status 列标题显示 `Status*`
  - [x] 特殊状态显示 `Cleared {settle_date}`
  - [x] 分页功能正常
  - [x] 详情点击条件判断正确（子商户可点击，父节点不可点击）
  - [x] Payout 列仅特定商户显示
  - [x] 加载状态显示正确
  - [x] 错误处理正确
  - [x] Multi Fundings Tab 正确显示
  - [x] Reserve Summary Tab 正确显示三个表格
  - [x] Tab 根据 userConfig 和节点属性正确显示/隐藏
  - [x] 默认路由重定向到 Dashboard
  - [x] 自动选中顶级节点但不加载数据
  - [x] config 在页面刷新后正确持久化

- [x] **UI/样式测试**：

  - [x] 表格数据和表头左对齐
  - [x] 表头背景色 `#e6e6e6`
  - [x] 页面间距紧凑（桌面端 4px，移动端 0）
  - [x] Card 内部间距适中（16px）
  - [x] 表格横向滚动正常（仅一个滚动条）

- [x] **响应式测试**：
  - [x] 桌面端显示正常
  - [ ] 平板端（≤768px）显示正常
  - [ ] 移动端（≤480px）显示正常，页面间距为 0
  - [ ] 移动端表格字体和间距缩小
