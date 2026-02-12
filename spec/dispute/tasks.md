# Tasks: Dispute Summary 模块

> **最后更新**: 2026-02-12  
> **状态**: ✅ 已完成

**Input**: Design documents from `/spec/dispute/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root
- Paths follow constitution.md structure

---

## Phase 1: Types & Config (Shared Infrastructure)

**Purpose**: 创建类型定义和配置文件

- [x] T001 [P] 更新 `src/types/dashboard.ts`：添加 Dispute 相关类型
  - `DisputeType` 类型（'all' | 'request_info' | 'under_review' | ...）
  - `DisputeListRequest` 接口
  - `DisputeListResponse` 接口
  - `DisputeRecord` 接口
  - `DisputeDetailResponse` 接口
  - `DisputeNote` 接口
  - `DisputeNoteEvidence` 接口
  - `DisputeSummaryTableRow` 接口
  - `DISPUTE_TYPE_OPTIONS` 常量数组
  - `ACTION_BUTTON_VENDORS` 常量数组

- [x] T002 [P] 创建 `src/config/klarnaForm.ts`：Klarna 表单配置
  - `KlarnaFormOption` 接口
  - `KlarnaFormField` 接口
  - `KlarnaDisplayForm` 接口
  - `KlarnaShipmentData` 接口
  - `KlarnaProvideInfoData` 接口
  - 下拉选项常量（IsShippingCompanyContacted, YesOrNo, ShippingCarrier 等）
  - `parseKlarnaRequests(requestsStr: string)` 函数
  - `createInitialKlarnaProvideInfo(displayKlarnaForm: KlarnaDisplayForm[])` 函数
  - `KlarnaFormShipments` 配置常量

**Checkpoint**: 类型和配置就绪 ✅

---

## Phase 2: API Service

**Purpose**: 创建 Dispute API 服务

- [x] T003 创建 `src/services/api/disputeApi.ts`：
  - [x] 定义请求/响应类型接口
    - `DisputeDownloadRequest`
    - `DisputePDFDownloadRequest`
    - `UploadedFileInfo`
    - `DisputeUploadResponse`
    - `SubmitEvidenceData`
    - `SubmitEvidenceResponse`
    - `UpdateDisputeData`
    - `UpdateDisputeResponse`
    - `AfterPayFileInfo`
    - `AfterPayUploadResponse`
    - `SubmitAfterPayEvidenceData`
    - `SubmitAfterPayEvidenceResponse`
    - `KlarnaRequestItem`
    - `SubmitKlarnaEvidenceData`
    - `SubmitKlarnaEvidenceResponse`
    - `KlarnaUploadResponse`

  - [x] 实现 API 方法
    - `fetchDisputeList(params, signal?)` - POST `/dispute/list`
    - `downloadDisputes(params, signal?)` - POST `/dispute/list` (CSV)
    - `downloadDisputesPDF(params, signal?)` - POST `/dispute/list` (PDF)
    - `getDisputeDetail(caseId, signal?)` - GET `/dispute/{caseId}`
    - `uploadDisputeFiles(id, files, signal?)` - PUT `/dispute/resource/{id}`
    - `submitEvidence(caseId, files, data, signal?)` - POST `/dispute/{caseId}/ppcp/evidence`
    - `updateDispute(caseId, data, signal?)` - PUT `/dispute/{caseId}`
    - `submitAfterPayEvidence(caseId, evidenceData, sessionId, signal?)` - POST `/dispute/{caseId}/afterpay/evidence`
    - `uploadAfterPayFile(caseId, file, signal?)` - POST `/dispute/{caseId}/afterpay/file`
    - `submitKlarnaEvidence(caseId, data, signal?)` - PUT `/dispute/{caseId}`
    - `uploadKlarnaFiles(caseId, files, signal?)` - POST `/dispute/{caseId}/klarna/file`

**Checkpoint**: API 服务就绪 ✅

---

## Phase 3: State Management

**Purpose**: 创建 Dispute Store

- [x] T004 创建 `src/stores/disputeStore.ts`：
  - State: `disputeData`, `loading`, `error`
  - State: `page`, `pageSize`
  - State: `startDate`, `endDate`, `searchKey`, `disputeType`
  - Action: `fetchDisputes(params: DisputeListRequest)`
  - Action: `setPage`, `setPageSize`
  - Action: `setStartDate`, `setEndDate`, `setSearchKey`, `setDisputeType`
  - Action: `clearDispute`
  - AbortController 支持
  - 使用 `devtools` 中间件

- [x] T005 更新 `src/stores/index.ts`：导出 `useDisputeStore`, `cancelDisputeRequests`

**Checkpoint**: Store 就绪 ✅

---

## Phase 4: User Story 1 & 2 - 争议列表与筛选 (Priority: P1)

**Goal**: 实现争议列表展示和筛选功能

**Independent Test**: 访问 Dashboard，选择 Dispute Summary Tab，表格正确显示数据，支持筛选

### Implementation

- [x] T006 [P] [US2] 创建 `src/components/dashboard/DisputeSummary/DisputeSummaryFilter.tsx`：
  - 日期范围选择器 (RangePicker)
  - 关键词搜索输入框 (Input)
  - Search 按钮 (Button)
  - Props: startDate, endDate, searchKey, onChange handlers, onSearch, loading

- [x] T007 [US1] 创建 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - 使用 Ant Design `Table` 组件
  - 表格列配置：
    - Operation (Action 按钮)
    - Dispute case ID (可点击，支持复制)
    - Status (Tag 标签，颜色映射)
    - Dispute Amount (货币格式化)
    - Time Created
    - Last updated Time
    - Payment Transaction ID (支持复制)
    - Payment Method
    - Reason
    - Type
    - Case Expiration Time
  - 辅助函数：
    - `shouldShowActionButton(status, vendor)`
    - `getStatusTagColor(status)`
    - `getStatusDisplayText(status)`
  - 分页配置

- [x] T008 [US1+US2] 创建 `src/components/dashboard/DisputeSummary/index.tsx`：
  - Tab 页签 (Tabs) 切换争议类型
  - 集成 DisputeSummaryFilter
  - 集成 DisputeSummaryTable
  - 集成 DownloadButtons
  - 数据加载逻辑 (`loadDisputes`)
  - 节点切换时重置状态
  - 搜索防抖 (debounce 300ms)

**Checkpoint**: US1 & US2 完成 ✅

---

## Phase 5: User Story 3 - 争议详情 (Priority: P1)

**Goal**: 实现点击 Case ID 查看详情功能

**Independent Test**: 点击 Case ID，弹窗显示详情和历史记录

### Implementation

- [x] T009 [US3] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - 详情弹层状态：`modalVisible`, `modalLoading`, `selectedRecord`, `disputeNotes`
  - `handleCaseIdClick` - 点击 Case ID 触发
  - 调用 `disputeApi.getDisputeDetail(caseId)`
  - 弹层内容：
    - 基本信息 (Descriptions 组件)
    - Description 区域 (HTML 渲染，dangerouslySetInnerHTML)
    - Status Change History (Timeline 组件)
    - 每条记录：状态 Tag、时间、来源、备注、证据文件列表

**Checkpoint**: US3 完成 ✅

---

## Phase 6: User Story 4 - PPCP 证据提交 (Priority: P1)

**Goal**: 实现 PPCP 争议的证据提交功能

**Independent Test**: 点击 Action 按钮，填写表单，上传文件，点击 Submit 成功提交

### Implementation

- [x] T010 [US4] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - Action 弹层状态：`actionModalVisible`, `actionRecord`, `actionNote`
  - 文件上传状态：`uploadedFiles`, `uploading`, `pendingFilesRef`
  - Provide Info 弹层状态：`provideInfoModalVisible`, `provideInfoData`
  - 确认提交弹层状态：`confirmModalVisible`, `submitting`
  - `handleActionClick` - 打开 Action 弹层
  - `handleActionModalClose` - 关闭并清理状态
  - Action 弹层内容：
    - Description 区域 (HTML 渲染)
    - Note 文本框 (Input.TextArea，maxLength 2000，字符计数)
    - 已上传文件列表 (可删除)
    - Upload Files 按钮 (Upload 组件)
    - Provide Information 按钮（条件显示）
  - Provide Information 弹层内容：
    - 提示语
    - Proof of Fulfillment 区域（条件显示：reason 为 Unauthorized 或 merchandise...）
      - Tracking Number
      - Carrier Name
    - Proof of Refund 区域（始终显示）
      - Refund ID/Reference
    - Done 按钮
  - 文件上传逻辑：
    - 文件类型验证 (PNG/JPEG/PDF)
    - 单文件大小验证 (≤5MB)
    - 总大小验证 (≤20MB)
    - 批量上传 (debounce)
  - Submit 按钮逻辑：
    - 打开确认弹层
    - 调用 `disputeApi.submitEvidence`
    - 成功后刷新列表

- [x] T011 [US4] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - Accept and Refund 弹层状态：`acceptRefundModalVisible`, `acceptRefundLoading`
  - Accept and Refund 按钮逻辑：
    - 打开确认弹层
    - 调用 `disputeApi.updateDispute` (status: 'refund')
    - 成功后刷新列表

**Checkpoint**: US4 完成 ✅

---

## Phase 7: User Story 5 - Afterpay 证据提交 (Priority: P2)

**Goal**: 实现 Afterpay 争议的专用表单证据提交

**Independent Test**: 对 Afterpay 争议，点击 Provide Information，填写专用表单，Submit 成功

### Implementation

- [x] T012 [US5] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - Afterpay Provide Info 状态：`provideInfoAfterPayModalVisible`, `provideInfoAfterPay`
  - Afterpay 文件上传状态：`afterpayShippingDocUploading`, `afterpayRefundPolicyUploading`
  - `isAfterPayVendor` 判断函数
  - `handleOpenProvideInfoAfterPayModal` / `handleCloseProvideInfoAfterPayModal`
  - `handleProvideInfoAfterPayChange` - 字段变更处理
  - Afterpay Provide Information 弹层内容：
    - Product Description (TextArea)
    - Shipping Address (Input)
    - Shipping Date (DatePicker)
    - Shipping Carrier (Input)
    - Shipping Tracking Number (Input)
    - Shipping Document (Upload)
    - Refund Policy Disclosure (TextArea)
    - Refund Refusal Explanation (TextArea)
    - Refund Policy (Upload)
    - Done 按钮
  - 文件上传调用 `disputeApi.uploadAfterPayFile`
  - Submit 调用 `disputeApi.submitAfterPayEvidence`

**Checkpoint**: US5 完成 ✅

---

## Phase 8: User Story 6 - Klarna 证据提交 (Priority: P2)

**Goal**: 实现 Klarna 争议的动态表单证据提交

**Independent Test**: 对 Klarna 争议，点击 Provide Information，动态生成表单，Submit 成功

### Implementation

- [x] T013 [US6] 更新 `src/components/dashboard/DisputeSummary/DisputeSummaryTable.tsx`：
  - Klarna Provide Info 状态：
    - `provideInfoKlarnaModalVisible`
    - `klarnaDisplayForm` - 动态表单配置
    - `klarnaProvideInfo` - 表单数据
    - `klarnaIsMultiShipments` - 是否多条 Shipment
    - `klarnaHasShipments` - 是否有 Shipment 区域
    - `klarnaRequestIds` - 请求 ID 列表
  - `isKlarnaVendor` 判断函数
  - `handleOpenProvideInfoKlarnaModal` - 解析 requests，初始化表单
  - `handleCloseProvideInfoKlarnaModal`
  - `handleKlarnaFieldChange` - 普通字段变更
  - `handleKlarnaShipmentChange` - Shipment 字段变更
  - `handleAddKlarnaShipment` - 添加 Shipment
  - `handleRemoveKlarnaShipment` - 删除 Shipment
  - Klarna Provide Information 弹层内容：
    - 遍历 `klarnaDisplayForm` 渲染表单
    - 支持字段类型：Text, TextArea, DropDown, Date, UploadFile
    - Shipments 区域（可添加/删除）
    - Done 按钮
  - 文件上传调用 `disputeApi.uploadKlarnaFiles`
  - Submit 调用 `disputeApi.submitKlarnaEvidence`

**Checkpoint**: US6 完成 ✅

---

## Phase 9: User Story 8 - 下载功能 (Priority: P2)

**Goal**: 实现 CSV 和 PDF 下载功能

**Independent Test**: 点击下载按钮，成功下载文件

### Implementation

- [x] T014 [P] [US8] 更新 `src/utils/download.ts`：
  - 实现 `generateDisputeSummaryCSV(data: DisputeRecord[])` 函数
  - CSV 列：Case ID, Status, Amount, Currency, Time Created, Time Updated, Payment Transaction ID, Payment Method, Reason, Type, Expiration Time

- [x] T015 [US8] 更新 `src/components/dashboard/DisputeSummary/index.tsx`：
  - `handleDownloadCSV` - CSV 下载逻辑
    - 调用 `disputeApi.downloadDisputes`
    - 调用 `generateDisputeSummaryCSV`
    - 调用 `downloadCSV`
  - `handleDownloadPDF` - PDF 下载逻辑
    - 调用 `disputeApi.downloadDisputesPDF`
    - 调用 `downloadPDF`
  - 集成 DownloadButtons 组件

**Checkpoint**: US8 完成 ✅

---

## Phase 10: Integration & Cleanup

**Purpose**: 集成到 Dashboard 页面，代码清理

- [x] T016 更新 `src/components/dashboard/index.ts`：导出 `DisputeSummary`

- [x] T017 更新 `src/pages/DashboardPage.tsx`：
  - Tab 配置添加 Dispute Summary
  - Tab 显示条件判断
  - Tab 切换时取消请求 (`cancelDisputeRequests`)

- [x] T018 代码清理和 ESLint 检查

**Checkpoint**: 集成完成 ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Types & Config)**: No dependencies - can start immediately
- **Phase 2 (API Service)**: Depends on Phase 1 (需要类型定义)
- **Phase 3 (State Management)**: Depends on Phase 1 & 2
- **Phase 4 (US1 & US2)**: Depends on Phase 1, 2, 3
- **Phase 5 (US3)**: Depends on Phase 4
- **Phase 6 (US4)**: Depends on Phase 4
- **Phase 7 (US5)**: Depends on Phase 6
- **Phase 8 (US6)**: Depends on Phase 6
- **Phase 9 (US8)**: Depends on Phase 4
- **Phase 10 (Integration)**: Depends on all previous phases

### Parallel Opportunities

- T001, T002 can run in parallel (different files)
- T006 (Filter) and T007 (Table) can run in parallel
- T014 (Download utils) can run in parallel with Phase 5-8
- Phase 7 (Afterpay) and Phase 8 (Klarna) can run in parallel

### Recommended Order

1. T001, T002 (Types & Config) - 可并行
2. T003 (API Service)
3. T004, T005 (Store)
4. T006, T007 (Filter & Table) - 可并行
5. T008 (Main Component)
6. T009 (Detail Modal)
7. T010, T011 (PPCP Evidence)
8. T012 | T013 (Afterpay | Klarna) - 可并行
9. T014, T015 (Download)
10. T016, T017, T018 (Integration & Cleanup)

---

## Summary

| 阶段                      | 任务数 | 状态   |
| ------------------------- | ------ | ------ |
| Phase 1: Types & Config   | 2      | ✅     |
| Phase 2: API Service      | 1      | ✅     |
| Phase 3: State Management | 2      | ✅     |
| Phase 4: US1 & US2        | 3      | ✅     |
| Phase 5: US3              | 1      | ✅     |
| Phase 6: US4              | 2      | ✅     |
| Phase 7: US5              | 1      | ✅     |
| Phase 8: US6              | 1      | ✅     |
| Phase 9: US8              | 2      | ✅     |
| Phase 10: Integration     | 3      | ✅     |
| **总计**                  | **18** | **✅** |

---

## Notes

- ✅ 所有 Dispute Summary 功能已实现
- DisputeSummaryTable.tsx 文件较大（~3000行），包含多个弹层组件
- 未来可考虑将各弹层拆分为独立组件以提高可维护性
- Klarna 表单配置支持多种字段类型，具有较好的扩展性
