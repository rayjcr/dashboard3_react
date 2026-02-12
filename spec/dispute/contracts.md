# Dispute API 接口文档

> **版本**: 1.2  
> **实现状态**: ✅ 已完成  
> **最后更新**: 2026-02-12  
> **相关文件**: `src/types/dashboard.ts`, `src/services/api/disputeApi.ts`, `src/stores/disputeStore.ts`

---

## 目录

1. [获取争议列表](#1-获取争议列表)
2. [下载争议数据 (CSV)](#2-下载争议数据-csv)
3. [下载争议数据 (PDF)](#3-下载争议数据-pdf)
4. [获取争议详情](#4-获取争议详情)
5. [上传争议文件](#5-上传争议文件)
6. [提交 PPCP 证据](#6-提交-ppcp-证据)
7. [更新争议状态](#7-更新争议状态)
8. [提交 Afterpay 证据](#8-提交-afterpay-证据)
9. [上传 Afterpay 文件](#9-上传-afterpay-文件)
10. [提交 Klarna 证据](#10-提交-klarna-证据)
11. [上传 Klarna 文件](#11-上传-klarna-文件)
12. [Dispute Store 实现](#dispute-store-实现)
13. [状态值说明](#12-状态值说明)
14. [错误处理](#13-错误处理)

---

## 1. 获取争议列表

### POST /dispute/list

获取争议记录列表，支持分页和筛选。

#### 请求参数

```typescript
interface DisputeListRequest {
  /** 商户节点的 ID */
  hierarchy_user_id: number;
  /** 商户 ID（叶子节点传实际值，父节点传空字符串） */
  merchantId: string;
  /** 会话 ID */
  session_id: string;
  /** 搜索类型，固定为 'daily_dispute' */
  search_type: 'daily_dispute';
  /** 日期/月份（暂未使用） */
  date_month: string;
  /** 争议类型筛选（空字符串表示全部） */
  disputeType: string;
  /** 当前页码，从 0 开始 */
  page_number: string;
  /** 每页最大记录条数 */
  row_count: number;
  /** 开始日期 (YYYY-MM-DD) */
  startDate: string;
  /** 结束日期 (YYYY-MM-DD) */
  endDate: string;
  /** 搜索关键词 */
  searchKey: string;
}
```

#### 响应数据

```typescript
interface DisputeListResponse {
  /** 响应状态码，200 表示成功 */
  code: number;
  /** 错误消息 */
  message?: string;
  /** 交易记录列表 */
  transactions: DisputeRecord[];
  /** 总记录数 */
  total_records: number;
}

interface DisputeRecord {
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
```

#### 示例

**请求：**

```json
{
  "hierarchy_user_id": 12345,
  "merchantId": "M001",
  "session_id": "abc123",
  "search_type": "daily_dispute",
  "date_month": "",
  "disputeType": "request_info",
  "page_number": "0",
  "row_count": 10,
  "startDate": "2026-01-01",
  "endDate": "2026-01-29",
  "searchKey": ""
}
```

**响应：**

```json
{
  "code": 200,
  "transactions": [
    {
      "id": 1,
      "case_id": "CASE-2026-001",
      "description": "<p>Customer claims unauthorized transaction</p>",
      "status": "request_info",
      "vendor": "CARD",
      "amount": 99.99,
      "currency": "USD",
      "time_created": "2026-01-15 10:30:00",
      "time_updated": "2026-01-20 14:20:00",
      "payment_transaction_id": "TXN-12345",
      "reason_code": "Unauthorized",
      "case_expiration_date": "2026-02-15",
      "itme_transaction_type": "chargeback"
    }
  ],
  "total_records": 1
}
```

---

## 2. 下载争议数据 (CSV)

### POST /dispute/list

与获取列表使用相同接口，通过 `download` 参数区分。

#### 请求参数

```typescript
interface DisputeDownloadRequest {
  startDate: string;
  endDate: string;
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily_dispute';
  disputeType: string;
  page_number: string;
  row_count: number;
  download: 'csv';
}
```

#### 响应数据

返回 `DisputeListResponse` 结构，前端根据数据生成 CSV 文件。

---

## 3. 下载争议数据 (PDF)

### POST /dispute/list

与获取列表使用相同接口，通过 `download` 参数区分。

#### 请求参数

```typescript
interface DisputePDFDownloadRequest {
  startDate: string;
  endDate: string;
  hierarchy_user_id: number;
  merchantId: string;
  session_id: string;
  search_type: 'daily_dispute';
  disputeType: string;
  page_number: string;
  row_count: number;
  download: 'pdf';
}
```

#### 响应数据

返回 `Blob` 类型的 PDF 文件数据。

#### 请求配置

```typescript
{
  responseType: 'blob';
}
```

---

## 4. 获取争议详情

### GET /dispute/{caseId}

根据 Case ID 获取争议的详细信息，包括状态变更历史。

#### 路径参数

| 参数   | 类型   | 说明        |
| ------ | ------ | ----------- |
| caseId | string | 争议案例 ID |

#### 响应数据

```typescript
interface DisputeDetailResponse {
  code: number;
  notes: DisputeNote[];
}

interface DisputeNote {
  id: number;
  case_id: string;
  item_id: number;
  note_from: string;
  note: string;
  /** JSON 字符串，解析后为 DisputeNoteEvidence[] */
  evidence: string;
  note_read: string;
  time_updated: string | null;
  status: string;
}

interface DisputeNoteEvidence {
  id: string;
  file_name: string;
}
```

#### 示例

**请求：**

```
GET /dispute/CASE-2026-001
```

**响应：**

```json
{
  "code": 200,
  "notes": [
    {
      "id": 1,
      "case_id": "CASE-2026-001",
      "item_id": 100,
      "note_from": "Bank",
      "note": "Initial dispute filed by cardholder.\nReason: Unauthorized transaction.",
      "evidence": "[{\"id\":\"E001\",\"file_name\":\"receipt.pdf\"}]",
      "note_read": "Y",
      "time_updated": "2026-01-20 14:20:00",
      "status": "request_info"
    },
    {
      "id": 2,
      "case_id": "CASE-2026-001",
      "item_id": 100,
      "note_from": "Merchant",
      "note": "Submitted delivery confirmation.",
      "evidence": "[{\"id\":\"E002\",\"file_name\":\"tracking.pdf\"},{\"id\":\"E003\",\"file_name\":\"signature.jpg\"}]",
      "note_read": "N",
      "time_updated": "2026-01-22 09:15:00",
      "status": "under_review"
    }
  ]
}
```

---

## 5. 状态值说明

### 5.1 Dispute 状态 (status)

| 状态值                    | 说明             |
| ------------------------- | ---------------- |
| `request_info`            | 等待商户提供信息 |
| `under_review`            | 审核中           |
| `lost_waiting_for_refund` | 败诉，等待退款   |
| `won` / `win`             | 商户胜诉         |
| `lost`                    | 商户败诉         |
| `close`                   | 已关闭           |

### 5.2 Dispute 类型筛选值 (disputeType)

| 值                        | 说明      |
| ------------------------- | --------- |
| `''` (空字符串)           | 全部      |
| `request_info`            | 等待响应  |
| `under_review`            | 审核中    |
| `lost_waiting_for_refund` | 等待退款  |
| `won/lost`                | 胜诉/败诉 |
| `close`                   | 已关闭    |
| `other`                   | 其他      |

---

## 6. 错误处理

所有接口在出错时返回：

```typescript
{
  code: number; // 非 200 的错误码
  message: string; // 错误描述
}
```

常见错误码：

| 错误码 | 说明                   |
| ------ | ---------------------- |
| 400    | 请求参数错误           |
| 401    | 未授权（session 过期） |
| 404    | 资源不存在             |
| 500    | 服务器内部错误         |

---

## 7. 前端 API 调用示例

```typescript
import { disputeApi } from '@/services/api/disputeApi';

// 获取争议列表
const response = await disputeApi.fetchDisputeList({
  hierarchy_user_id: 12345,
  merchantId: 'M001',
  session_id: 'abc123',
  search_type: 'daily_dispute',
  date_month: '',
  disputeType: '',
  page_number: '0',
  row_count: 10,
  startDate: '',
  endDate: '',
  searchKey: '',
});

// 获取争议详情
const detail = await disputeApi.getDisputeDetail('CASE-2026-001');

// 下载 CSV
const csvData = await disputeApi.downloadDisputes({
  startDate: '2026-01-01',
  endDate: '2026-01-29',
  hierarchy_user_id: 12345,
  merchantId: 'M001',
  session_id: 'abc123',
  search_type: 'daily_dispute',
  disputeType: 'all',
  page_number: '0',
  row_count: 10,
  download: 'csv',
});

// 下载 PDF
const pdfBlob = await disputeApi.downloadDisputesPDF({
  startDate: '2026-01-01',
  endDate: '2026-01-29',
  hierarchy_user_id: 12345,
  merchantId: 'M001',
  session_id: 'abc123',
  search_type: 'daily_dispute',
  disputeType: 'all',
  page_number: '0',
  row_count: 10,
  download: 'pdf',
});

// 上传文件
const uploadResult = await disputeApi.uploadDisputeFiles(recordId, files);

// 提交 PPCP 证据
const submitResult = await disputeApi.submitEvidence(caseId, files, {
  carrier_name: 'UPS',
  tracking_number: '1Z999AA10123456784',
  refund_id: 'REF-001',
  note: 'Delivery confirmed',
});

// 提交 Afterpay 证据
const afterpayResult = await disputeApi.submitAfterPayEvidence(
  caseId,
  {
    uncategorizedText: 'Additional notes',
    productDescription: 'Product details',
    shippingAddress: '123 Main St',
    shippingDate: '2026-01-15',
    shippingCarrier: 'UPS',
    shippingTrackingNumber: '1Z999AA10123456784',
    refundPolicyDisclosure: 'Policy details',
    refundRefusalExplanation: 'Reason for refusal',
  },
  sessionId,
);

// 提交 Klarna 证据
const klarnaResult = await disputeApi.submitKlarnaEvidence(caseId, {
  case_id: 'CASE-001',
  status: 'request_info',
  from: 'MERCHANT-001',
  session_id: sessionId,
  requests: [
    {
      comment: 'Evidence provided',
      request_id: 1,
      requested_fields: {
        tracking_id: '1Z999AA10123456784',
        shipping_carrier: 'ups',
      },
    },
  ],
});
```

---

## 8. 提交 Afterpay 证据

### POST /dispute/{caseId}/afterpay/evidence

提交 Afterpay 争议的证据信息。

#### 路径参数

| 参数   | 类型   | 说明        |
| ------ | ------ | ----------- |
| caseId | string | 争议案例 ID |

#### 请求参数

```typescript
interface SubmitAfterPayEvidencePayload {
  evidence: SubmitAfterPayEvidenceData;
  session_id: string;
}

interface SubmitAfterPayEvidenceData {
  /** Note 文本 */
  uncategorizedText: string;
  /** 产品描述 */
  productDescription: string;
  /** 配送地址 */
  shippingAddress: string;
  /** 配送日期 */
  shippingDate: string;
  /** 承运商 */
  shippingCarrier: string;
  /** 物流单号 */
  shippingTrackingNumber: string;
  /** 退款政策说明 */
  refundPolicyDisclosure: string;
  /** 拒绝退款原因 */
  refundRefusalExplanation: string;
  /** 配送文件 ID (可选) */
  shippingDocumentation?: string;
  /** 退款政策文件 ID (可选) */
  refundPolicy?: string;
  /** 未分类文件 ID (可选) */
  uncategorizedFile?: string;
}
```

#### 响应数据

```typescript
interface SubmitAfterPayEvidenceResponse {
  code: number;
  message?: string;
}
```

---

## 9. 上传 Afterpay 文件

### POST /dispute/{caseId}/afterpay/file

上传 Afterpay 争议相关的文件。

#### 路径参数

| 参数   | 类型   | 说明        |
| ------ | ------ | ----------- |
| caseId | string | 争议案例 ID |

#### 请求参数

使用 `multipart/form-data` 格式：

| 字段  | 类型 | 说明         |
| ----- | ---- | ------------ |
| data1 | File | 要上传的文件 |

#### 响应数据

```typescript
interface AfterPayUploadResponse {
  code: number;
  message?: string;
  data: AfterPayFileInfo;
}

interface AfterPayFileInfo {
  /** 文件 ID */
  id: string;
  /** 文件访问 URL */
  url: string;
  /** URL 过期时间 */
  urlExpiresAt: string;
  /** 文件名 */
  filename: string;
}
```

---

## 10. 提交 Klarna 证据

### PUT /dispute/{caseId}

提交 Klarna 争议的证据信息（与更新争议状态共用接口）。

#### 路径参数

| 参数   | 类型   | 说明        |
| ------ | ------ | ----------- |
| caseId | string | 争议案例 ID |

#### 请求参数

```typescript
interface SubmitKlarnaEvidenceData {
  /** 争议案例 ID */
  case_id: string;
  /** 当前状态 */
  status: string;
  /** 商户 ID */
  from: string;
  /** 会话 ID */
  session_id: string;
  /** 请求项列表 */
  requests: KlarnaRequestItem[];
}

interface KlarnaRequestItem {
  /** 已上传文件列表 */
  attachments?: KlarnaUploadedFileInfo[];
  /** 评论/备注 */
  comment: string;
  /** 请求 ID */
  request_id: number;
  /** 请求字段 */
  requested_fields: KlarnaRequestedFields;
}

interface KlarnaRequestedFields {
  [key: string]: string | KlarnaShipmentFields[] | undefined;
  /** 配送信息列表 */
  list_of_shipments?: KlarnaShipmentFields[];
}

interface KlarnaShipmentFields {
  capture_id?: string;
  is_shipping_company_contacted?: string;
  shipping_carrier?: string;
  shipping_date?: string;
  tracking_id?: string;
}

interface KlarnaUploadedFileInfo {
  fileName: string;
  id: string;
}
```

#### 响应数据

```typescript
interface SubmitKlarnaEvidenceResponse {
  code: number;
  message?: string;
}
```

---

## 11. 上传 Klarna 文件

### POST /dispute/{caseId}/klarna/file

上传 Klarna 争议相关的文件。

#### 路径参数

| 参数   | 类型   | 说明        |
| ------ | ------ | ----------- |
| caseId | string | 争议案例 ID |

#### 请求参数

使用 `multipart/form-data` 格式：

| 字段              | 类型 | 说明                       |
| ----------------- | ---- | -------------------------- |
| data1, data2, ... | File | 要上传的文件（按顺序命名） |

#### 响应数据

```typescript
interface KlarnaUploadResponse {
  code: number;
  message?: string;
  data: KlarnaUploadedFileInfo[];
}

interface KlarnaUploadedFileInfo {
  fileName: string;
  id: string;
}
```

---

## Dispute Store 实现

> **实现状态**: ✅ 已完成

```typescript
export interface DisputeState {
  // Data
  disputeData: DisputeListResponse | null;
  loading: boolean;
  error: string | null;

  // Pagination
  page: number;
  pageSize: number;

  // Search filters
  startDate: string;
  endDate: string;
  searchKey: string;
  disputeType: DisputeType;

  // Actions
  fetchDisputes: (params: DisputeListRequest) => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setSearchKey: (key: string) => void;
  setDisputeType: (type: DisputeType) => void;
  clearDispute: () => void;
}

// 请求取消函数
export const cancelDisputeRequests: () => void;
```

---

## 12. 状态值说明

### 12.1 Dispute 状态 (status)

| 状态值                    | 说明             |
| ------------------------- | ---------------- |
| `request_info`            | 等待商户提供信息 |
| `under_review`            | 审核中           |
| `lost_waiting_for_refund` | 败诉，等待退款   |
| `won` / `win`             | 商户胜诉         |
| `lost`                    | 商户败诉         |
| `close`                   | 已关闭           |

### 12.2 Dispute 类型筛选值 (disputeType)

| 值                        | 说明      |
| ------------------------- | --------- |
| `''` (空字符串)           | 全部      |
| `request_info`            | 等待响应  |
| `under_review`            | 审核中    |
| `lost_waiting_for_refund` | 等待退款  |
| `won/lost`                | 胜诉/败诉 |
| `close`                   | 已关闭    |
| `other`                   | 其他      |

---

## 13. 错误处理

所有接口在出错时返回：

```typescript
{
  code: number; // 非 200 的错误码
  message: string; // 错误描述
}
```

常见错误码：

| 错误码 | 说明                   |
| ------ | ---------------------- |
| 400    | 请求参数错误           |
| 401    | 未授权（session 过期） |
| 404    | 资源不存在             |
| 500    | 服务器内部错误         |
