# Dispute Summary 功能规格说明

> **版本**: 1.2  
> **实现状态**: ✅ 已完成  
> **最后更新**: 2026-02-12  
> **技术设计**: [contracts.md](./contracts.md)  
> **相关文件**: `src/components/dashboard/DisputeSummary/`, `src/stores/disputeStore.ts`, `src/services/api/disputeApi.ts`

---

## 1. 概述

Dispute Summary 是用于管理和处理支付争议的功能模块。用户可以查看争议列表、筛选争议、查看争议详情，并对特定状态的争议执行操作（如提交证据、接受退款）。

### 核心功能

| 功能模块        | 描述                               | 状态 |
| --------------- | ---------------------------------- | ---- |
| 争议列表        | 展示争议记录，支持分页和筛选       | ✅   |
| 争议类型筛选    | Tab 页签切换不同类型的争议         | ✅   |
| 日期/关键词筛选 | 按日期范围和关键词搜索             | ✅   |
| 争议详情        | 查看争议历史和状态变更             | ✅   |
| 提交证据        | 针对 PPCP/AfterPay/Klarna 提交证据 | ✅   |
| 文件上传        | 上传证明文件                       | ✅   |
| 接受退款        | 接受败诉并执行退款                 | ✅   |
| CSV/PDF 下载    | 导出争议数据                       | ✅   |

---

## 2. 用户故事

### US1: 查看争议列表 (Priority: P1)

**作为** 已登录的商户用户  
**我希望** 在 Dashboard 中查看我的争议列表  
**以便于** 了解当前所有待处理和已处理的争议状态

**验收标准:**

- [x] 表格显示：Operation, Case ID, Status, Amount, Time Created, Time Updated, Payment Transaction ID, Payment Method, Reason, Type, Expiration Time
- [x] 支持分页（默认 10 条/页，可选 10/20/50/100）
- [x] 金额根据 currency 显示货币符号
- [x] 状态使用不同颜色的 Tag 标签显示
- [x] Case ID 支持复制功能
- [x] Loading 状态显示骨架屏

### US2: 筛选争议 (Priority: P1)

**作为** 已登录的商户用户  
**我希望** 通过日期范围、关键词和争议类型筛选争议  
**以便于** 快速找到我需要处理的特定争议

**验收标准:**

- [x] Tab 页签支持切换争议类型（All, Waiting For Response, Under Review, 等）
- [x] 日期范围选择器支持选择开始和结束日期
- [x] 关键词搜索支持 Case ID、Transaction ID
- [x] 切换 Tab 立即触发搜索
- [x] 点击 Search 按钮应用日期和关键词筛选
- [x] 搜索支持防抖（300ms）

### US3: 查看争议详情 (Priority: P1)

**作为** 已登录的商户用户  
**我希望** 点击 Case ID 查看争议的详细信息和历史记录  
**以便于** 了解争议的完整处理流程

**验收标准:**

- [x] 弹窗显示争议基本信息（Case ID, Description）
- [x] Timeline 组件展示状态变更历史
- [x] 每条历史记录显示状态、时间、来源、备注
- [x] 显示相关证据文件列表
- [x] Description 支持 HTML 格式渲染

### US4: 提交 PPCP 证据 (Priority: P1)

**作为** 已登录的商户用户  
**我希望** 对 PPCP（PayPal/Venmo/CashAppPay/Card/GooglePay/ApplePay）争议提交证据  
**以便于** 为争议申诉提供必要的证明材料

**验收标准:**

- [x] Action 按钮仅在 status='request_info' 时显示
- [x] 弹窗显示 Description 信息
- [x] Note 文本框支持最多 2000 字符
- [x] 支持上传文件（PNG/JPEG/PDF，单文件 ≤5MB，总计 ≤20MB）
- [x] Provide Information 区域包含 Tracking Number、Carrier Name、Refund ID
- [x] Submit 按钮提交证据
- [x] 提交成功后刷新列表

### US5: 提交 Afterpay 证据 (Priority: P2)

**作为** 已登录的商户用户  
**我希望** 对 Afterpay 争议提交专门的证据表单  
**以便于** 按照 Afterpay 的要求提供证明材料

**验收标准:**

- [x] Provide Information 弹窗包含 Afterpay 专用字段
- [x] 字段包括：Product Description, Shipping Address, Shipping Date, Carrier, Tracking Number
- [x] 支持 Shipping Document 文件上传
- [x] 字段包括：Refund Policy Disclosure, Refund Refusal Explanation
- [x] 支持 Refund Policy 文件上传
- [x] Done 按钮关闭弹窗并保留数据

### US6: 提交 Klarna 证据 (Priority: P2)

**作为** 已登录的商户用户  
**我希望** 对 Klarna 争议提交专门的证据表单  
**以便于** 按照 Klarna 的要求提供证明材料

**验收标准:**

- [x] 动态解析 Klarna requests 生成表单
- [x] 支持多种字段类型：Text, TextArea, DropDown, Date, UploadFile
- [x] Shipments 区域支持多条记录（添加/删除）
- [x] 字段包括：capture_id, shipping_company_contacted, shipping_carrier, shipping_date, tracking_id
- [x] Done 按钮关闭弹窗并保留数据
- [x] Submit 提交所有数据

### US7: 接受退款 (Priority: P2)

**作为** 已登录的商户用户  
**我希望** 对败诉的争议接受并执行退款  
**以便于** 快速解决争议避免进一步损失

**验收标准:**

- [x] Accept and Refund 按钮在 Action 弹窗底部显示
- [x] 点击后显示确认弹窗
- [x] 确认后调用退款接口
- [x] 成功后刷新列表

### US8: 下载争议数据 (Priority: P2)

**作为** 已登录的商户用户  
**我希望** 下载当前筛选条件下的争议数据  
**以便于** 离线分析或存档

**验收标准:**

- [x] CSV 下载按钮导出 CSV 格式
- [x] PDF 下载按钮导出 PDF 格式
- [x] 文件名包含日期时间戳

---

## 3. 显示条件

Dispute Summary 页签在以下条件满足时显示：

1. 节点必须绑定 `merchantId`
2. `userConfig.dispute_manage === true`
3. 或者 `userConfig.daily_dispute_summary_disable === false` 并且 `hasDisputeChild === true`

## 3. 争议状态类型 (DisputeType)

| 状态值                    | 显示标签                 | 说明             |
| ------------------------- | ------------------------ | ---------------- |
| `all`                     | All                      | 全部             |
| `request_info`            | Waiting For Response     | 等待响应         |
| `under_review`            | Under Review             | 审核中           |
| `lost_waiting_for_refund` | Waiting For Refund(Lost) | 等待退款（败诉） |
| `won/lost`                | Win/Lost                 | 胜诉/败诉        |
| `close`                   | Closed                   | 已关闭           |
| `other`                   | Other                    | 其他             |

## 4. 状态显示映射

| 原始状态                  | 显示文本             | 标签颜色 |
| ------------------------- | -------------------- | -------- |
| `request_info`            | Waiting For Response | orange   |
| `under_review`            | Under Review         | blue     |
| `lost_waiting_for_refund` | Waiting For Refund   | volcano  |
| `won` / `win`             | Merchant Win         | green    |
| `lost`                    | Merchant Lost        | red      |
| `close`                   | Closed               | default  |

## 5. 筛选功能

### 5.1 筛选条件

- **日期范围**: 开始日期 - 结束日期
- **搜索关键词**: 支持搜索 Case ID、Transaction ID 等
- **争议类型**: 通过 Tab 页签切换筛选

### 5.2 交互行为

- 切换 Tab 页签立即触发搜索
- 点击 Search 按钮使用当前筛选条件搜索
- 搜索支持防抖 (300ms)

## 6. 表格列定义

| 列名                   | 字段                 | 宽度 | 对齐   | 说明                     |
| ---------------------- | -------------------- | ---- | ------ | ------------------------ |
| Operation              | -                    | 100  | center | Action 按钮（固定左侧）  |
| Dispute case ID        | caseId               | 280  | left   | 可点击查看详情，支持复制 |
| Status                 | status               | 160  | center | 显示状态标签             |
| Dispute Amount         | disputeAmount        | 130  | right  | 格式化后的金额           |
| Time Created           | timeCreated          | 180  | center | -                        |
| Last updated Time      | timeUpdated          | 180  | center | -                        |
| Payment Transaction ID | paymentTransactionId | 280  | left   | 支持复制                 |
| Payment Method         | paymentMethod        | 130  | center | -                        |
| Reason                 | reason               | 200  | left   | 争议原因                 |
| Type                   | type                 | 120  | center | 交易类型                 |
| Case Expiration Time   | caseExpirationTime   | 180  | center | -                        |

## 7. Operation 列 - Action 按钮

### 7.1 显示条件

Action 按钮的显示逻辑：

```
特殊 Vendor 列表: ['PAYPAL', 'VENMO', 'CASHAPPPAY', 'CARD', 'AFTERPAY', 'KLARNA', 'GOOGLEPAY', 'APPLEPAY']

如果 vendor 在特殊列表中:
  - 只有 status === 'request_info' 时显示 Action
否则:
  - status === 'request_info' 或 status === 'lost_waiting_for_refund' 时显示 Action
```

### 7.2 Action 弹层 (Dispute Modal)

点击 Action 按钮打开弹层：

**弹层结构：**

- **标题**: `Dispute`
- **宽度**: 700px

**内容区域：**

1. **Description 区域**
   - 显示记录的 `description` 信息
   - 支持 HTML 格式渲染（独立样式，不受项目样式影响）
   - 使用 `dangerouslySetInnerHTML` 渲染
   - 背景色: `#f5f5f5`，圆角: `4px`

2. **Note 文本框**
   - 多行文本输入框
   - 最大字符限制: 2000
   - 显示字符统计: `{num}/2000`
   - 超出 2000 字符时红色提示

3. **Provide Information 区域** (条件显示)
   - **显示条件**:
     - `status !== 'lost_waiting_for_refund'`
     - 且 `vendor` 属于 `['card', 'paze', 'afterpay', 'klarna']`
   - 包含 **Provide Information** 按钮

4. **Attachment Upload 区域** (条件显示)
   - **显示条件**: `status !== 'lost_waiting_for_refund'`
   - 显示已上传文件列表（带删除按钮）
   - **Upload Files** 按钮（样式与 Download 按钮一致）

**底部按钮：**

- `Submit` - 提交操作（暂未实现）
- `Accept and Refund` - 接受并退款（暂未实现）

**关闭行为：**

- 关闭弹层时清除所有临时数据（Note、上传文件、Provide Information 数据）
- 同时关闭子弹层（如 Provide Information 弹层）

### 7.3 Provide Information 弹层

点击 Provide Information 按钮打开子弹层：

**弹层结构：**

- **标题**: `Provide Information`
- **宽度**: 500px

**内容区域：**

1. **提示语**: `For different reasons of dispute, the type of evidence will be different.`

2. **Proof of Fulfillment 区域** (条件显示)
   - **显示条件**: `reason_code` 是 `'Unauthorized'` 或 `'merchandise or service not received'`
   - 带边框的卡片样式（背景色: `#fafafa`）
   - 包含字段：
     - `Tracking Number` - 文本输入框
     - `Carrier Name` - 文本输入框

3. **Proof of Refund 区域** (始终显示)
   - 带边框的卡片样式（背景色: `#fafafa`）
   - 包含字段：
     - `Refund ID/Reference` - 文本输入框

**底部按钮：**

- `Done` - 关闭弹层（保留数据）

**数据管理：**

- 使用对象统一管理: `{ trackNum, carrierName, refId }`
- 关闭 Provide Information 弹层时保留数据
- 关闭主弹层（Dispute Modal）时清除数据

## 8. Dispute case ID 点击 - 详情弹层

点击 Dispute case ID 打开详情弹层：

**弹层结构：**

- **标题**: `Dispute Detail`
- **宽度**: 700px

**内容区域：**

1. **基本信息** (Descriptions 组件)
   - `Dispute case ID`: 案例 ID
   - `Description`: 描述信息（支持 HTML 格式）

2. **Status Change History** (Timeline 组件)
   - 显示状态变更历史记录
   - 每条记录包含：
     - 状态标签（带颜色）
     - 更新时间
     - 来源 (note_from)
     - 备注 (note) - 支持 HTML 格式，`\n` 转换为 `<br />`
     - 证据文件列表 (evidence)

**底部按钮：**

- `Close` - 关闭弹层

## 9. 下载功能

### 9.1 CSV 下载

- 下载当前筛选条件下的所有争议数据
- 文件名格式: `DisputeSummary_YYYYMMDD_HHmmss.csv`

### 9.2 PDF 下载

- 下载当前筛选条件下的所有争议数据
- 文件名格式: `DisputeSummary_YYYYMMDD_HHmmss.pdf`
- 返回 Blob 数据

## 10. 分页

- 默认每页: 10 条
- 支持切换: 10, 20, 50, 100 条/页
- 显示总记录数和当前范围

## 12. Vendor 特殊处理

### 12.1 Action 按钮显示的 Vendor 列表

```typescript
ACTION_BUTTON_VENDORS = [
  'PAYPAL',
  'VENMO',
  'CASHAPPPAY',
  'CARD',
  'AFTERPAY',
  'KLARNA',
  'GOOGLEPAY',
  'APPLEPAY',
];
```

### 12.2 Provide Information 支持的 Vendor

| Vendor   | Provide Info 表单 | 特殊处理                                 |
| -------- | ----------------- | ---------------------------------------- |
| CARD     | 通用表单          | Tracking Number, Carrier Name, Refund ID |
| PAZE     | 通用表单          | Tracking Number, Carrier Name, Refund ID |
| AFTERPAY | Afterpay 专用表单 | 多字段 + 文件上传                        |
| KLARNA   | Klarna 动态表单   | 解析 requests 生成表单                   |

### 12.3 文件上传限制

| 限制项         | 值                                           |
| -------------- | -------------------------------------------- |
| 允许的文件类型 | `image/png`, `image/jpeg`, `application/pdf` |
| 单文件最大大小 | 5 MB                                         |
| 总文件最大大小 | 20 MB                                        |

---

## 13. 错误处理

- API 请求失败显示 `message.error` 提示
- 表单验证失败显示红色提示文字
- 文件上传失败显示具体错误信息
- 支持请求取消（AbortController）

---

## 14. 文件结构

```
src/
├── components/dashboard/DisputeSummary/
│   ├── index.tsx                 # 主组件（筛选、Tab、表格、下载按钮）
│   ├── DisputeSummaryTable.tsx   # 表格组件（包含详情弹层、Action弹层、证据提交）
│   └── DisputeSummaryFilter.tsx  # 筛选组件
├── services/api/
│   └── disputeApi.ts             # Dispute API 服务（列表、详情、上传、提交证据）
├── stores/
│   └── disputeStore.ts           # Dispute 状态管理
├── config/
│   └── klarnaForm.ts             # Klarna 表单配置
└── types/
    └── dashboard.ts              # 类型定义（Dispute 相关类型）
```

---

## 15. 依赖关系

```
types/dashboard.ts (DisputeType, DisputeRecord, DisputeListResponse, etc.)
    ↓
config/klarnaForm.ts (Klarna 表单配置)
    ↓
services/api/disputeApi.ts (API 调用)
    ↓
stores/disputeStore.ts (状态管理)
    ↓
components/dashboard/DisputeSummary/* (UI 组件)
    ↓
pages/DashboardPage.tsx (页面集成)
```
