# 实施计划 - Dispute Summary 模块

> **最后更新**: 2026-02-12  
> **状态**: ✅ 已完成

本计划概述了根据 `spec/dispute/spec.md` 实现 Dispute Summary 功能的步骤。

---

## 用户故事 1 & 2：争议列表与筛选 ✅

### 1. 创建类型定义

- [x] 更新 `src/types/dashboard.ts`：
  - [x] 定义 `DisputeType` 类型（all, request_info, under_review, 等）
  - [x] 定义 `DisputeListRequest` 接口
  - [x] 定义 `DisputeListResponse` 接口
  - [x] 定义 `DisputeRecord` 接口
  - [x] 定义 `DisputeSummaryTableRow` 接口
  - [x] 定义 `DISPUTE_TYPE_OPTIONS` 常量
  - [x] 定义 `ACTION_BUTTON_VENDORS` 常量

### 2. 创建 API 服务

- [x] 创建 `src/services/api/disputeApi.ts`：
  - [x] 实现 `fetchDisputeList(params: DisputeListRequest): Promise<DisputeListResponse>`
  - [x] 实现 `downloadDisputes(params: DisputeDownloadRequest): Promise<DisputeListResponse>`
  - [x] 实现 `downloadDisputesPDF(params: DisputePDFDownloadRequest): Promise<Blob>`
  - [x] POST `/dispute/list`

### 3. 创建 Dispute Store

- [x] 创建 `src/stores/disputeStore.ts`：
  - [x] `disputeData: DisputeListResponse | null`
  - [x] `loading: boolean`
  - [x] `error: string | null`
  - [x] `page: number`, `pageSize: number`
  - [x] `startDate: string`, `endDate: string`
  - [x] `searchKey: string`, `disputeType: DisputeType`
  - [x] Actions: `fetchDisputes`, `setPage`, `setPageSize`, 等
  - [x] 支持 AbortController 取消请求
  - [x] 导出 `cancelDisputeRequests` 函数

### 4. 创建筛选组件

- [x] 创建 `src/components/dashboard/DisputeSummary/DisputeSummaryFilter.tsx`：
  - [x] 日期范围选择器 (RangePicker)
  - [x] 关键词搜索输入框
  - [x] Search 按钮

### 5. 创建表格组件

- [x] 创建 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] 使用 Ant Design `Table` 组件
  - [x] 表头配置（Operation, Case ID, Status, Amount, 等）
  - [x] 状态标签颜色映射
  - [x] Action 按钮显示逻辑
  - [x] 分页支持

### 6. 创建主组件

- [x] 创建 `src/components/dashboard/DisputeSummary/index.tsx`：
  - [x] Tab 页签切换争议类型
  - [x] 集成 DisputeSummaryFilter
  - [x] 集成 DisputeSummaryTable
  - [x] 集成 DownloadButtons
  - [x] 数据加载逻辑

---

## 用户故事 3：争议详情 ✅

### 1. 扩展 API 服务

- [x] 更新 `src/services/api/disputeApi.ts`：
  - [x] 实现 `getDisputeDetail(caseId: string): Promise<DisputeDetailResponse>`
  - [x] GET `/dispute/{caseId}`

### 2. 创建详情弹层

- [x] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] 详情弹层 (Modal)
  - [x] 基本信息展示 (Descriptions)
  - [x] 状态变更历史 (Timeline)
  - [x] 证据文件列表显示

---

## 用户故事 4：PPCP 证据提交 ✅

### 1. 扩展 API 服务

- [x] 更新 `src/services/api/disputeApi.ts`：
  - [x] 实现 `uploadDisputeFiles(id: number, files: File[]): Promise<DisputeUploadResponse>`
  - [x] 实现 `submitEvidence(caseId: string, files: File[], data: SubmitEvidenceData): Promise<SubmitEvidenceResponse>`
  - [x] PUT `/dispute/resource/{id}`
  - [x] POST `/dispute/{caseId}/ppcp/evidence`

### 2. 创建 Action 弹层

- [x] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] Action 弹层 (Modal)
  - [x] Description 区域 (HTML 渲染)
  - [x] Note 文本框 (字符限制 2000)
  - [x] 文件上传组件
  - [x] Provide Information 区域
  - [x] Submit 按钮
  - [x] Accept and Refund 按钮

### 3. 创建 Provide Information 弹层

- [x] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] Provide Information 弹层
  - [x] Tracking Number 输入框
  - [x] Carrier Name 输入框
  - [x] Refund ID 输入框
  - [x] Done 按钮

---

## 用户故事 5：Afterpay 证据提交 ✅

### 1. 扩展 API 服务

- [x] 更新 `src/services/api/disputeApi.ts`：
  - [x] 实现 `submitAfterPayEvidence(caseId: string, evidenceData: SubmitAfterPayEvidenceData, sessionId: string): Promise<SubmitAfterPayEvidenceResponse>`
  - [x] 实现 `uploadAfterPayFile(caseId: string, file: File): Promise<AfterPayUploadResponse>`
  - [x] POST `/dispute/{caseId}/afterpay/evidence`
  - [x] POST `/dispute/{caseId}/afterpay/file`

### 2. 创建 Afterpay Provide Info 弹层

- [x] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] Afterpay 专用表单弹层
  - [x] Product Description 输入
  - [x] Shipping Address 输入
  - [x] Shipping Date 日期选择
  - [x] Shipping Carrier 输入
  - [x] Shipping Tracking Number 输入
  - [x] Shipping Document 文件上传
  - [x] Refund Policy Disclosure 输入
  - [x] Refund Refusal Explanation 输入
  - [x] Refund Policy 文件上传

---

## 用户故事 6：Klarna 证据提交 ✅

### 1. 创建 Klarna 表单配置

- [x] 创建 `src/config/klarnaForm.ts`：
  - [x] 定义 `KlarnaFormField` 接口
  - [x] 定义 `KlarnaDisplayForm` 接口
  - [x] 定义 `KlarnaShipmentData` 接口
  - [x] 定义 `KlarnaProvideInfoData` 接口
  - [x] 定义下拉选项常量
  - [x] 实现 `parseKlarnaRequests` 函数
  - [x] 实现 `createInitialKlarnaProvideInfo` 函数

### 2. 扩展 API 服务

- [x] 更新 `src/services/api/disputeApi.ts`：
  - [x] 实现 `submitKlarnaEvidence(caseId: string, data: SubmitKlarnaEvidenceData): Promise<SubmitKlarnaEvidenceResponse>`
  - [x] 实现 `uploadKlarnaFiles(caseId: string, files: File[]): Promise<KlarnaUploadResponse>`
  - [x] PUT `/dispute/{caseId}` (Klarna)
  - [x] POST `/dispute/{caseId}/klarna/file`

### 3. 创建 Klarna Provide Info 弹层

- [x] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] Klarna 动态表单弹层
  - [x] 支持多种字段类型 (Text, TextArea, DropDown, Date, UploadFile)
  - [x] Shipments 区域（添加/删除）
  - [x] 动态解析 requests 生成表单

---

## 用户故事 7：接受退款 ✅

### 1. 扩展 API 服务

- [x] 更新 `src/services/api/disputeApi.ts`：
  - [x] 实现 `updateDispute(caseId: string, data: UpdateDisputeData): Promise<UpdateDisputeResponse>`
  - [x] PUT `/dispute/{caseId}`

### 2. 创建接受退款功能

- [x] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - [x] Accept and Refund 确认弹层
  - [x] 调用更新状态接口
  - [x] 成功后刷新列表

---

## 用户故事 8：下载功能 ✅

### 1. 实现下载功能

- [x] 更新 `src/utils/download.ts`：
  - [x] 实现 `generateDisputeSummaryCSV` 函数
  - [x] 支持 CSV 格式导出

### 2. 集成下载按钮

- [x] 更新 `src/components/dashboard/DisputeSummary/index.tsx`：
  - [x] 集成 DownloadButtons 组件
  - [x] CSV 下载逻辑
  - [x] PDF 下载逻辑

---

## 文件结构

```
src/
├── components/dashboard/DisputeSummary/
│   ├── index.tsx                 # 主组件
│   ├── DisputeSummaryTable.tsx   # 表格组件（含详情、Action、证据提交）
│   └── DisputeSummaryFilter.tsx  # 筛选组件
├── services/api/
│   └── disputeApi.ts             # Dispute API 服务
├── stores/
│   └── disputeStore.ts           # Dispute 状态管理
├── config/
│   └── klarnaForm.ts             # Klarna 表单配置
├── types/
│   └── dashboard.ts              # 类型定义
└── utils/
    └── download.ts               # 下载工具函数
```

---

## 依赖关系

```
types/dashboard.ts
    ↓
config/klarnaForm.ts
    ↓
services/api/disputeApi.ts
    ↓
stores/disputeStore.ts
    ↓
components/dashboard/DisputeSummary/*
    ↓
pages/DashboardPage.tsx
```

---

## 实施顺序

1. **Phase 1**: 类型定义和配置
   - `types/dashboard.ts` - Dispute 类型
   - `config/klarnaForm.ts` - Klarna 表单配置

2. **Phase 2**: API 服务
   - `services/api/disputeApi.ts` - 所有 API 接口

3. **Phase 3**: 状态管理
   - `stores/disputeStore.ts` - Store 实现

4. **Phase 4**: 基础组件
   - `DisputeSummaryFilter.tsx` - 筛选组件
   - `DisputeSummaryTable.tsx` - 表格组件（基础）

5. **Phase 5**: 详情功能
   - 详情弹层实现

6. **Phase 6**: 证据提交
   - PPCP 证据提交
   - Afterpay 证据提交
   - Klarna 证据提交

7. **Phase 7**: 下载功能
   - CSV/PDF 下载

8. **Phase 8**: 集成
   - 主组件 `index.tsx`
   - Dashboard 页面集成
