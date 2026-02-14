# Dispute Summary 技术设计文档

> **版本**: 1.0  
> **实现状态**: ✅ 已完成  
> **最后更新**: 2026-02-13  
> **需求文档**: [spec.md](./spec.md)  
> **接口文档**: [contracts.md](./contracts.md)

---

## 1. 概述

### 1.1 功能简介

Dispute Summary 是用于管理和处理支付争议的功能模块，作为 Dashboard 页面的一个 Tab 页签展示。用户可以查看争议列表、筛选争议、查看争议详情，并针对不同支付渠道（PPCP、Afterpay、Klarna）提交证据。

### 1.2 技术架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DashboardPage.tsx                              │
│                         (Tab 容器，控制显示/销毁)                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DisputeSummary/index.tsx                         │
│               (主组件：筛选、Tab、下载按钮、数据协调)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │ DisputeSummaryFilter.tsx │  │     DisputeSummaryTable.tsx          │ │
│  │  (日期范围、搜索框)       │  │  (表格、详情弹窗、Action弹窗、       │ │
│  └──────────────────────────┘  │   PPCP/Afterpay/Klarna证据提交)      │ │
│                                └──────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          disputeStore.ts                                 │
│                     (Zustand 状态管理 + AbortController)                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          disputeApi.ts                                   │
│              (API 调用：列表、详情、上传、证据提交)                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            apiClient.ts                                  │
│                     (Axios 实例，统一请求配置)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 文件结构

```
src/
├── components/dashboard/DisputeSummary/
│   ├── index.tsx                 # 主组件（筛选、Tab、表格、下载）
│   ├── DisputeSummaryTable.tsx   # 表格组件（2960 行，包含所有弹窗和证据提交）
│   ├── DisputeSummaryFilter.tsx  # 筛选组件（日期范围、搜索框）
│   └── index.ts                  # 导出
├── services/api/
│   └── disputeApi.ts             # API 服务（466 行）
├── stores/
│   └── disputeStore.ts           # 状态管理（~120 行）
├── config/
│   └── klarnaForm.ts             # Klarna 表单配置解析
├── types/
│   └── dashboard.ts              # 类型定义（Dispute 相关）
└── utils/
    └── download.ts               # CSV/PDF 下载工具
```

---

## 2. 核心模块设计

### 2.1 Store 设计 (disputeStore.ts)

#### 状态结构

```typescript
export interface DisputeState {
  // 数据
  disputeData: DisputeListResponse | null;
  loading: boolean;
  error: string | null;

  // 缓存节点追踪
  loadedNodeId: string | null;

  // 分页
  page: number;
  pageSize: number;

  // 筛选条件
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
```

#### 请求取消机制

```typescript
// 模块级别的 AbortController
let disputeAbortController: AbortController | null = null;

// 在 fetchDisputes 中实现请求取消
fetchDisputes: async (params: DisputeListRequest, nodeId?: string) => {
  // 取消前一个请求
  if (disputeAbortController) {
    disputeAbortController.abort();
  }
  disputeAbortController = new AbortController();

  set({ loading: true, error: null });
  try {
    const response = await disputeApi.fetchDisputeList(
      params,
      disputeAbortController.signal,
    );
    // ... 处理响应
  } catch (error) {
    // 忽略取消错误
    if (error instanceof Error && error.name === 'CanceledError') {
      return;
    }
    // ... 处理其他错误
  }
};

// 导出取消函数供外部调用
export const cancelDisputeRequests = () => {
  if (disputeAbortController) {
    disputeAbortController.abort();
    disputeAbortController = null;
    useDisputeStore.setState({ loading: false });
  }
};
```

#### 数据缓存策略

- 使用 `loadedNodeId` 追踪当前加载的节点
- 切换 Tab 回来时，如果节点未变化则使用缓存数据
- 切换节点或双击 Tab 时清除缓存并重新加载

### 2.2 API 设计 (disputeApi.ts)

#### 接口列表

| 方法                     | 路径                                     | 说明                         |
| ------------------------ | ---------------------------------------- | ---------------------------- |
| `fetchDisputeList`       | POST /dispute/list                       | 获取争议列表                 |
| `downloadDisputes`       | POST /dispute/list                       | 下载 CSV（带 download 参数） |
| `downloadDisputesPDF`    | POST /dispute/list                       | 下载 PDF（返回 Blob）        |
| `getDisputeDetail`       | GET /dispute/{caseId}                    | 获取争议详情                 |
| `uploadDisputeFiles`     | PUT /dispute/resource/{id}               | 上传文件                     |
| `submitEvidence`         | POST /dispute/{caseId}/ppcp/evidence     | 提交 PPCP 证据               |
| `updateDispute`          | PUT /dispute/{caseId}                    | 更新争议状态                 |
| `submitAfterPayEvidence` | POST /dispute/{caseId}/afterpay/evidence | 提交 Afterpay 证据           |
| `uploadAfterPayFile`     | POST /dispute/{caseId}/afterpay/file     | 上传 Afterpay 文件           |
| `submitKlarnaEvidence`   | PUT /dispute/{caseId}                    | 提交 Klarna 证据             |
| `uploadKlarnaFiles`      | POST /dispute/{caseId}/klarna/file       | 上传 Klarna 文件             |

#### 文件上传处理

```typescript
// PPCP 文件上传 - 使用 data1, data2, data3... 作为参数名
async uploadDisputeFiles(id: number, files: File[]) {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`data${index + 1}`, file);
  });
  // PUT /dispute/resource/{id}
}

// PPCP 证据提交 - 使用 file0, file1, file2... 作为参数名
async submitEvidence(caseId: string, files: File[], data: SubmitEvidenceData) {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  formData.append('data', JSON.stringify(data));
  // POST /dispute/{caseId}/ppcp/evidence
}
```

### 2.3 组件设计

#### DisputeSummary/index.tsx - 主组件

**职责**：

- 组合 Filter、Tabs、Table、DownloadButtons
- 管理筛选状态（本地状态 vs Store 状态）
- 协调数据加载和刷新

**状态管理策略**：

- 本地状态：`localStartDate`, `localEndDate`, `localSearchKey`（输入状态）
- Store 状态：`storeStartDate`, `storeEndDate`, `storeSearchKey`（实际筛选条件）
- 点击 Search 按钮时：本地状态 → Store 状态 → 触发 API

**数据加载逻辑**：

```typescript
// 初始加载 - 使用 destroyInactiveTabPane 确保每次激活都重新挂载
useEffect(() => {
  if (!canLoad) return;

  const currentNodeId = selectedNode?.id || '';

  // 如果已加载当前节点数据，使用缓存
  if (loadedNodeId === currentNodeId && disputeData) {
    return;
  }

  // 清除并加载新数据
  clearDispute();
  fetchDisputes(params, currentNodeId);
}, [canLoad]);
```

#### DisputeSummaryTable.tsx - 表格组件

**职责**：

- 渲染争议列表表格
- 处理详情弹窗
- 处理 Action 弹窗
- 处理 PPCP/Afterpay/Klarna 证据提交
- 处理文件上传

**弹窗层级**：

```
DisputeSummaryTable
├── Detail Modal (查看详情)
│   └── Timeline 展示状态历史
├── Action Modal (操作)
│   ├── Description 显示区域
│   ├── Note 输入框
│   ├── File Upload 区域
│   ├── Provide Information 按钮
│   │   ├── PPCP Provide Info Modal (Card/Paze)
│   │   ├── Afterpay Provide Info Modal
│   │   └── Klarna Provide Info Modal
│   ├── Submit 按钮 → Confirm Modal
│   └── Accept and Refund 按钮 → Confirm Modal
```

**文件上传限制**：

```typescript
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 单文件
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB 总计
```

**批量上传优化**：

```typescript
// 使用 ref 和 timer 实现批量上传，避免多次 API 调用
const pendingFilesRef = useRef<File[]>([]);
const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// 在文件选择后，延迟 100ms 执行上传，合并多个文件
const handleFileChange = (file: File) => {
  pendingFilesRef.current.push(file);

  if (uploadTimerRef.current) {
    clearTimeout(uploadTimerRef.current);
  }

  uploadTimerRef.current = setTimeout(() => {
    uploadFiles(pendingFilesRef.current);
    pendingFilesRef.current = [];
  }, 100);
};
```

---

## 3. 数据流设计

### 3.1 争议列表加载流程

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              用户操作                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ 切换Tab页签 │  │ 点击Search  │  │ 切换分页    │  │ 双击Dispute Tab │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
└─────────│────────────────│────────────────│──────────────────│──────────┘
          │                │                │                  │
          ▼                ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         handleDisputeTypeChange                          │
│                         handleSearch                                     │
│                         handlePageChange                                 │
│                         (DashboardPage refreshKey++)                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          loadDisputes()                                  │
│                   构建 DisputeListRequest 参数                           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    disputeStore.fetchDisputes()                          │
│                  1. 取消前一个请求 (AbortController)                      │
│                  2. set({ loading: true })                               │
│                  3. await disputeApi.fetchDisputeList()                  │
│                  4. set({ disputeData, loadedNodeId })                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      DisputeSummaryTable 重新渲染                         │
│                         表格展示新数据                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 证据提交流程 (PPCP)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. 点击 Action 按钮                                                      │
│     → 打开 Action Modal                                                  │
│     → 初始化所有状态（note、files、provideInfo）                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. 填写信息                                                              │
│     ├─ 输入 Note（最多 2000 字符）                                        │
│     ├─ 上传文件（PNG/JPEG/PDF，单文件≤5MB，总计≤20MB）                    │
│     └─ 点击 Provide Information 填写物流/退款信息                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. 点击 Submit                                                           │
│     → 显示确认弹窗                                                        │
│     → 点击 Confirm                                                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. API 调用                                                              │
│     ├─ disputeApi.submitEvidence(caseId, files, data)                    │
│     │    POST /dispute/{caseId}/ppcp/evidence                            │
│     └─ disputeApi.updateDispute(caseId, updateData)                      │
│          PUT /dispute/{caseId}                                           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. 成功处理                                                              │
│     ├─ 显示成功消息                                                       │
│     ├─ 关闭所有弹窗                                                       │
│     └─ 调用 onEvidenceSubmitted() 刷新列表                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Klarna 动态表单渲染流程

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. 打开 Klarna Provide Information                                       │
│     → parseKlarnaRequests(record.requests)                               │
│     → 解析 JSON 获取 KlarnaDisplayForm[]                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. 根据 field.inputType 渲染对应控件                                     │
│     ├─ Text       → Input                                                │
│     ├─ TextArea   → TextArea                                             │
│     ├─ DropDown   → Select（使用 field.options）                          │
│     ├─ Date       → DatePicker                                           │
│     └─ UploadFile → Upload                                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. Shipments 区域（如果存在）                                            │
│     ├─ 初始显示一条空记录                                                 │
│     ├─ Add Shipment 按钮添加新记录                                        │
│     └─ Delete 按钮删除记录（至少保留一条）                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. 提交时组装数据                                                        │
│     {                                                                    │
│       requests: [{                                                       │
│         request_id: number,                                              │
│         comment: string,                                                 │
│         attachments: KlarnaUploadedFileInfo[],                          │
│         requested_fields: {                                              │
│           [key]: string,                                                 │
│           list_of_shipments: KlarnaShipmentFields[]                     │
│         }                                                                │
│       }]                                                                 │
│     }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 类型定义

### 4.1 核心类型

```typescript
// 争议类型筛选
export type DisputeType =
  | 'all'
  | 'request_info'
  | 'under_review'
  | 'lost_waiting_for_refund'
  | 'won/lost'
  | 'close'
  | 'other';

// 争议记录
export interface DisputeRecord {
  id: number;
  case_id: string;
  description: string | null;
  requests: string | null; // Klarna 使用，JSON 字符串
  status: string;
  vendor: string;
  amount: number;
  currency: string;
  time_created: string | null;
  time_updated: string | null;
  payment_transaction_id: string;
  reason_code: string;
  case_expiration_date: string | null;
  itme_transaction_type: string;
  merchant_id: string;
  merchant_db: string;
  // ... 其他字段
}

// 表格行数据（处理后的显示数据）
export interface DisputeSummaryTableRow {
  key: number;
  id: number;
  caseId: string;
  description: string;
  requests: string | null;
  status: string;
  disputeAmount: string;
  timeCreated: string;
  timeUpdated: string;
  paymentTransactionId: string;
  paymentMethod: string;
  reason: string;
  type: string;
  caseExpirationTime: string;
  record: DisputeRecord; // 原始记录，用于 Action 操作
}
```

### 4.2 API 类型

```typescript
// 请求参数
interface DisputeListRequest {
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily_dispute';
  date_month: string;
  disputeType: string;
  page_number: string;
  row_count: number;
  startDate: string;
  endDate: string;
  searchKey: string;
}

// 响应数据
interface DisputeListResponse {
  code: number;
  message?: string;
  transactions: DisputeRecord[];
  total_records: number;
}
```

### 4.3 Klarna 表单类型

```typescript
// 解析后的显示表单
interface KlarnaDisplayForm {
  label: string;
  inputType: 'Text' | 'TextArea' | 'DropDown' | 'Date' | 'UploadFile';
  key: string;
  options?: string[]; // 用于 DropDown
}

// 用户输入数据
interface KlarnaProvideInfoData {
  [key: string]: string | KlarnaUploadedFileInfo[];
}

// Shipment 字段
interface KlarnaShipmentData {
  capture_id: string;
  is_shipping_company_contacted: string;
  shipping_carrier: string;
  shipping_date: string;
  tracking_id: string;
}
```

---

## 5. 关键实现细节

### 5.1 Action 按钮显示逻辑

```typescript
// 特殊 Vendor 列表
const ACTION_BUTTON_VENDORS = [
  'PAYPAL',
  'VENMO',
  'CASHAPPPAY',
  'CARD',
  'AFTERPAY',
  'KLARNA',
  'GOOGLEPAY',
  'APPLEPAY',
];

function shouldShowActionButton(status: string, vendor: string): boolean {
  const upperVendor = vendor?.toUpperCase() || '';

  if (ACTION_BUTTON_VENDORS.includes(upperVendor)) {
    // 特殊列表：只有 request_info 时显示
    return status === 'request_info';
  } else {
    // 其他：request_info 或 lost_waiting_for_refund 时显示
    return status === 'request_info' || status === 'lost_waiting_for_refund';
  }
}
```

### 5.2 Provide Information 显示条件

```typescript
// 显示 Provide Information 按钮的条件
const showProvideInfo =
  actionRecord?.status !== 'lost_waiting_for_refund' &&
  ['card', 'paze', 'afterpay', 'klarna'].includes(
    actionRecord?.record.vendor?.toLowerCase() || '',
  );
```

### 5.3 状态显示映射

```typescript
function getStatusTagColor(status: string): string {
  switch (status) {
    case 'request_info':
      return 'orange';
    case 'under_review':
      return 'blue';
    case 'lost_waiting_for_refund':
      return 'volcano';
    case 'won':
    case 'win':
      return 'green';
    case 'lost':
      return 'red';
    case 'close':
      return 'default';
    default:
      return 'default';
  }
}

function getStatusDisplayText(status: string): string {
  switch (status) {
    case 'request_info':
      return 'Waiting For Response';
    case 'under_review':
      return 'Under Review';
    case 'lost_waiting_for_refund':
      return 'Waiting For Refund';
    case 'won':
    case 'win':
      return 'Merchant Win';
    case 'lost':
      return 'Merchant Lost';
    case 'close':
      return 'Closed';
    default:
      return status || '-';
  }
}
```

### 5.4 金额格式化

```typescript
// 使用通用的 formatCurrency 函数
import { formatCurrency } from '@/utils/currency';

// 在表格列渲染中
{
  title: 'Dispute Amount',
  dataIndex: 'disputeAmount',
  // disputeAmount 已在 transformData 中格式化
}

// transformData 中
const disputeAmount = formatCurrency(record.amount, record.currency);
```

### 5.5 HTML 内容安全渲染

```typescript
// Description 使用独立样式容器渲染 HTML
<div
  className="dispute-description-container"
  dangerouslySetInnerHTML={{ __html: record.description || '' }}
/>

// CSS 中添加 all: initial 重置继承样式
.dispute-description-container {
  all: initial;
  display: block;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}
```

---

## 6. 性能优化

### 6.1 请求防抖

```typescript
// Search 按钮使用 300ms 防抖
const debouncedSearch = useMemo(
  () => debounce(() => executeSearch(), 300),
  [executeSearch],
);

// 组件卸载时取消
useEffect(() => {
  return () => debouncedSearch.cancel();
}, [debouncedSearch]);
```

### 6.2 数据缓存

```typescript
// 使用 loadedNodeId 追踪已加载的节点
// 避免切换 Tab 返回时重复加载
if (loadedNodeId === currentNodeId && disputeData) {
  return; // 使用缓存
}
```

### 6.3 请求取消

```typescript
// Tab 切换时取消未完成的请求
export const cancelDisputeRequests = () => {
  if (disputeAbortController) {
    disputeAbortController.abort();
    disputeAbortController = null;
    useDisputeStore.setState({ loading: false });
  }
};

// 在 DashboardPage 中调用
useEffect(() => {
  return () => {
    cancelDisputeRequests();
  };
}, [activeTab]);
```

### 6.4 文件上传优化

```typescript
// 批量上传：使用 timer 合并多个文件
const uploadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const pendingFilesRef = useRef<File[]>([]);

// 延迟 100ms 执行，合并同时选择的多个文件
setTimeout(() => {
  uploadFiles(pendingFilesRef.current);
}, 100);
```

---

## 7. 错误处理

### 7.1 API 错误

```typescript
try {
  const response = await disputeApi.fetchDisputeList(params, signal);
  if (response.code !== 200) {
    throw new Error(response.message || 'Failed to fetch disputes');
  }
} catch (error) {
  // 忽略取消错误
  if (error instanceof Error && error.name === 'CanceledError') {
    return;
  }
  set({ error: errorMessage, loading: false });
}
```

### 7.2 文件上传错误

```typescript
// 文件类型验证
if (!ALLOWED_FILE_TYPES.includes(file.type)) {
  message.error(`File type not allowed: ${file.name}`);
  return;
}

// 文件大小验证
if (file.size > MAX_FILE_SIZE) {
  message.error(`File size exceeds 5MB: ${file.name}`);
  return;
}

// 总大小验证
const currentTotal = uploadedFiles.reduce((sum, f) => sum + f.size, 0);
if (currentTotal + file.size > MAX_TOTAL_SIZE) {
  message.error('Total file size exceeds 20MB');
  return;
}
```

### 7.3 表单验证

```typescript
// Note 字符数限制
const noteExceedsLimit = actionNote.length > 2000;

// 显示字符计数
<span style={{ color: noteExceedsLimit ? 'red' : undefined }}>
  {actionNote.length}/2000
</span>

// 提交前验证
if (noteExceedsLimit) {
  message.error('Note exceeds 2000 characters');
  return;
}
```

---

## 8. 测试要点

### 8.1 单元测试

- [ ] `shouldShowActionButton` 函数逻辑
- [ ] `getStatusTagColor` / `getStatusDisplayText` 映射
- [ ] `parseKlarnaRequests` Klarna 表单解析
- [ ] 文件上传验证逻辑

### 8.2 集成测试

- [ ] 争议列表加载和分页
- [ ] 筛选功能（日期范围、关键词、Tab 切换）
- [ ] 详情弹窗展示
- [ ] Action 弹窗操作
- [ ] PPCP 证据提交流程
- [ ] Afterpay 证据提交流程
- [ ] Klarna 证据提交流程
- [ ] 文件上传（大小限制、类型限制）
- [ ] CSV/PDF 下载

### 8.3 边界情况

- [ ] 空数据状态
- [ ] 网络错误处理
- [ ] 请求取消（快速切换 Tab）
- [ ] 超大文件上传
- [ ] Klarna requests 为空或格式错误

---

## 9. 依赖关系

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            外部依赖                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  react, antd, dayjs, lodash/debounce, zustand                           │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            内部依赖                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  @/types/dashboard        - Dispute 相关类型定义                         │
│  @/stores/disputeStore    - 状态管理                                     │
│  @/stores/authStore       - 认证信息（sessionId）                        │
│  @/stores/uiStore         - UI 状态（selectedNode）                      │
│  @/stores/themeStore      - 主题（primaryColor）                         │
│  @/services/api/disputeApi - API 调用                                   │
│  @/config/klarnaForm      - Klarna 表单配置                              │
│  @/utils/currency         - 金额格式化                                   │
│  @/utils/download         - CSV/PDF 下载                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. 后续优化建议

1. **表格组件拆分**: `DisputeSummaryTable.tsx` 接近 3000 行，建议拆分为：
   - `DisputeDetailModal.tsx`
   - `DisputeActionModal.tsx`
   - `PPCPProvideInfoModal.tsx`
   - `AfterpayProvideInfoModal.tsx`
   - `KlarnaProvideInfoModal.tsx`

2. **状态管理优化**: 考虑将弹窗状态提取到独立的 Store 或使用 Context

3. **类型安全**: 为 Klarna `requests` JSON 添加更严格的类型验证

4. **测试覆盖**: 添加单元测试和集成测试

5. **国际化**: 硬编码的文本提取为 i18n 资源
