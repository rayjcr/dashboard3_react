# Login 模块接口契约

> **实现状态**: ✅ 已完成
> **最后更新**: 2026-02-03
> **相关文件**: `src/types/auth.ts`, `src/services/api/authApi.ts`, `src/stores/authStore.ts`

## 类型定义

```typescript
// 层级节点设置
export interface HierarchyNodeSettings {
  isCollapsedOnInit?: string;
}

// 层级节点（递归结构）
export interface HierarchyNode {
  id?: number;
  value: string;
  merchantId?: string;
  hasAliDirect?: number;
  hasMultiFundings?: number;
  settings?: HierarchyNodeSettings;
  children?: HierarchyNode[];
}

// 用户信息
export interface User {
  id: number;
  email: string;
  role: string;
  sessionId: string;
}

// 登录凭证
export interface LoginCredentials {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  // 用户信息
  user_id: number;
  user_email: string;
  role: string;
  session_id: string;
  token: string | null;

  // MFA 配置
  MFA: boolean;
  config: string; // JSON 字符串，如 '{"MFA":false}'

  // 层级/商户信息
  hierarchy: number;
  hierarchyName: string;
  merchant_id: string;
  merchant_name: string;
  merchants: string[];

  // 权限
  adminPermissions: string;
  can_refund: number; // 0 或 1

  // 结算货币
  settlement_currencys: string[];

  // 时区
  timezone: string;
  timezone_short: string;

  // 层级树结构
  child: HierarchyNode[];

  // 响应状态
  code: number;
  message: string;
}
```

## Auth Store 实现

> **实现状态**: ✅ 已完成

```typescript
export interface AuthState {
  // 用户信息
  user: User | null;
  token: string | null;
  sessionId: string | null;

  // 层级/商户信息
  hierarchyId: number | null;
  hierarchyName: string | null;
  merchantId: string | null;
  merchantName: string | null;
  merchants: string[];
  hierarchyTree: HierarchyNode[];

  // 权限
  adminPermissions: string;
  canRefund: boolean;

  // MFA
  mfaEnabled: boolean;
  config: string;

  // 货币 & 时区
  settlementCurrencies: string[];
  timezone: string;
  timezoneShort: string;

  // UI 状态
  isLoading: boolean;
  error: string | null;
  currentEmail: string;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

**持久化配置**：

- 存储 key: `auth-storage`
- 持久化字段: `user`, `token`, `sessionId`, `hierarchyId`, `hierarchyName`, `merchantId`, `merchantName`, `merchants`, `hierarchyTree`, `adminPermissions`, `canRefund`, `mfaEnabled`, `config`, `settlementCurrencies`, `timezone`, `timezoneShort`, `currentEmail`

**多标签页同步**：

- 监听 `storage` 事件实现多标签页状态同步
- 当一个标签页登出时，其他标签页自动跳转到登录页

## Theme Store 实现

> **实现状态**: ✅ 已完成
> **相关文件**: `src/stores/themeStore.ts`, `src/types/theme.ts`

```typescript
export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}
```

**持久化配置**：

- 存储 key: `theme-storage`
- 全部字段持久化

**主题配色**：

- 亮色主题主色: `#1890ff`
- 暗色主题主色: `#7c3aed`
- CSS 变量: `--primary-color`, `--primary-color-light`

## Account Settings 页面

> **实现状态**: ✅ 已完成
> **路由**: `/accountsettings`
> **相关文件**: `src/pages/AccountSettingsPage.tsx`

### 页面功能

1. **密码登录用户** (当 `AuthState.user` 有值时显示)：
   - User Email 文本框（只读，显示当前用户邮箱）
   - Password 密码框（只读）
   - Change 按钮用于修改密码

2. **MFA 用户** (当 `AuthState.mfaEnabled` 有值时显示)：
   - Phone Number 标题
   - Change 按钮用于修改电话号码

### 修改密码流程

点击 Change 按钮后弹出确认对话框，提示信息：

> "You will be taken to the login screen before the password change request can proceed."

包含两个按钮：Confirm 和 Cancel

### Nauth Login URL 接口

**POST /nauth_login_url**

请求参数：

```typescript
interface NauthLoginUrlRequest {
  /** 回调 URL */
  callback_url: string; // `${window.location.origin}/auth-callback`
  /** 用户邮箱 */
  login_hint: string; // User Email 的值
  /** 固定为 true */
  update_password: boolean;
}
```

响应结构：

```typescript
interface NauthLoginUrlResponse {
  /** 响应码，200 表示成功 */
  code: number;
  /** 成功时为重定向 URL，失败时为错误信息 */
  data: string;
}
```

**示例请求**：

```json
{
  "callback_url": "http://localhost:4200/auth-callback",
  "login_hint": "tian.yiyuan@citcon.cn",
  "update_password": true
}
```

**成功响应** (code: 200)：

```json
{
  "code": 200,
  "data": "https://id.dev01.citconpay.com/realms/merchant/protocol/openid-connect/auth?client_id=dashboard&scope=openid%20email%20profile&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth-callback%3Fcode_challenge%3DUvUUasiBzO_DlwvWWE6q6-pqd4H-DlzLaFhov5S4ltI&code_challenge=UvUUasiBzO_DlwvWWE6q6-pqd4H-DlzLaFhov5S4ltI&code_challenge_method=S256&kc_action=UPDATE_PASSWORD&login_hint=tian.yiyuan%40citcon.cn"
}
```

**失败响应** (code: 500)：

```json
{
  "code": 500,
  "data": "error message!"
}
```

**处理逻辑**：

- 如果 `code === 200`，页面跳转到 `data` 返回的 URL
- 如果 `code !== 200`，显示 `data` 中的错误信息

## Change Phone Number 功能

> **实现状态**: ✅ 已完成
> **相关文件**: `src/components/auth/ChangePhoneForm.tsx`, `src/components/auth/ChangePhoneForm.css`

### 功能概述

该功能允许启用 MFA 的用户更改其绑定的手机号码。使用翻转卡片动画展示表单。

### UI 流程

1. **Account Settings 页面** - 点击 "Change" 按钮
2. **翻转动画** - 卡片翻转显示 Change Phone Number 表单
3. **步骤 1: 输入阶段**
   - Password 输入框（验证当前密码）
   - New Phone Number 输入框（带国旗的国际电话号码选择器）
   - Confirm New Phone Number 输入框
   - Back / Next 按钮
4. **步骤 2: 验证阶段**
   - Verification Code 输入框（6位验证码）
   - Resend Code 链接（最多重发2次）
   - Back / Next 按钮
5. **成功状态**
   - 显示成功消息
   - Back 按钮返回 Account Settings

### 错误处理

| 错误码 | 场景           | 处理方式                    |
| ------ | -------------- | --------------------------- |
| `0005` | 密码错误       | 显示剩余尝试次数，3次后登出 |
| `0016` | 手机号已被使用 | 提示使用其他号码            |
| `0003` | 验证码错误     | 显示剩余尝试次数            |
| `0004` | 验证码过期     | 提示重新发送验证码          |
| `0014` | 账户被锁定     | 显示锁定时间，自动登出      |

### Change Phone 接口

**POST /change_phone**

请求参数：

```typescript
interface ChangePhoneRequest {
  /** 当前密码 */
  password: string;
  /** 新手机号码（国际格式，如 +1234567890） */
  phone: string;
}
```

响应结构：

```typescript
interface ChangePhoneResponse {
  /** 响应码，201 表示成功 */
  code: number;
  data: {
    /** 错误码 */
    code?: string;
    /** 错误消息 */
    msg?: string;
    /** 密码错误尝试次数 */
    attempt_change_phone_count?: number;
    /** 验证码重发次数 */
    resent_count?: number;
  };
}
```

**成功响应** (code: 201, data.code 无值)：

```json
{
  "code": 201,
  "data": {
    "resent_count": 0
  }
}
```

**密码错误响应** (code: 201, data.code: "0005")：

```json
{
  "code": 201,
  "data": {
    "code": "0005",
    "msg": "Password is incorrect",
    "attempt_change_phone_count": 1
  }
}
```

**手机号已使用响应** (code: 201, data.code: "0016")：

```json
{
  "code": 201,
  "data": {
    "code": "0016",
    "msg": "This phone number is in use"
  }
}
```

### Resend Auth Code 接口

**POST /resend_auth_code_to_init_phone**

请求参数：无

响应结构：

```typescript
interface ResendAuthCodeResponse {
  /** 响应码，201 表示成功 */
  code: number;
  data: {
    /** 错误码 */
    code?: string;
    /** 错误消息 */
    msg?: string;
    /** 验证码重发次数 */
    resent_count?: number;
    /** 账户锁定剩余分钟数 */
    remain_minutes?: number;
  };
}
```

**成功响应** (code: 201)：

```json
{
  "code": 201,
  "data": {
    "resent_count": 1
  }
}
```

**账户锁定响应** (code: 201, data.code: "0014")：

```json
{
  "code": 201,
  "data": {
    "code": "0014",
    "msg": "Account locked",
    "remain_minutes": 30
  }
}
```

### Verify Change Phone 接口

**POST /verify_change_phone**

请求参数：

```typescript
interface VerifyChangePhoneRequest {
  /** 验证码 */
  auth_code: string;
}
```

响应结构：

```typescript
interface VerifyChangePhoneResponse {
  /** 响应码，200 表示成功，204 表示失败 */
  code: number;
  data: {
    /** 错误码 */
    code?: string;
    /** 错误消息 */
    msg?: string;
    /** 验证码尝试次数 */
    attempt_count?: number;
    /** 验证码重发次数 */
    resent_count?: number;
    /** 账户锁定剩余分钟数 */
    remain_minutes?: number;
  };
}
```

**成功响应** (code: 200)：

```json
{
  "code": 200,
  "data": {}
}
```

**验证码错误响应** (code: 204, data.code: "0003")：

```json
{
  "code": 204,
  "data": {
    "code": "0003",
    "msg": "Invalid verification code",
    "attempt_count": 1,
    "resent_count": 0
  }
}
```

**验证码过期响应** (code: 204, data.code: "0004")：

```json
{
  "code": 204,
  "data": {
    "code": "0004",
    "msg": "Verification code expired"
  }
}
```

## 环境配置

> **相关文件**: `src/config/env.ts`

```typescript
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  // External links
  helpDeskUrl:
    'https://citcon-inc-591908.workflowcloud.com/forms/ff8a3a5e-cbf2-48a3-869c-d1e1099fc751',
};
```

### 用户菜单配置

> **相关文件**: `src/config/userMenu.ts`

Citcon Help Desk 链接从 `env.helpDeskUrl` 读取，便于统一管理外部链接配置。
