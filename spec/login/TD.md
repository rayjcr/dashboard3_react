# 技术设计文档 - 登录模块

**功能**: 登录页面与认证系统  
**版本**: 1.0  
**创建日期**: 2026-02-09  
**状态**: ✅ 已实现  
**作者**: 开发团队

---

## 1. 概述

### 1.1 目的

本文档描述登录模块的技术设计，涵盖用户认证、会话管理、空闲超时、路由守卫及 MFA 手机号更改等功能的技术实现方案。

### 1.2 范围

| 功能模块       | 描述                            |
| -------------- | ------------------------------- |
| 登录认证       | 基于 JWT 的用户登录与会话持久化 |
| 空闲超时       | 20 分钟无操作自动登出           |
| 路由守卫       | 保护敏感路由，防止未授权访问    |
| 多标签页同步   | 跨标签页状态一致性              |
| MFA 手机号更改 | 安全的手机号变更流程            |

### 1.3 技术栈

- **前端框架**: React 19 + TypeScript
- **状态管理**: Zustand 4.x 配合 persist 中间件
- **UI 组件库**: Ant Design 6.x
- **HTTP 客户端**: Axios 配合拦截器
- **路由**: React Router 6.x
- **构建工具**: Vite 6.x

---

## 2. 架构设计

### 2.1 高层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        React 应用                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   登录页面   │  │  账户设置页面 │  │    布局组件   │           │
│  │              │  │              │  │ (空闲超时)    │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│  ┌──────┴─────────────────┴─────────────────┴───────┐           │
│  │                认证状态仓库 (Zustand)              │           │
│  │  ┌─────────────────────────────────────────────┐ │           │
│  │  │ user │ token │ hierarchyId │ mfaEnabled    │ │           │
│  │  └─────────────────────────────────────────────┘ │           │
│  │         ↕ persist 中间件 (localStorage)          │           │
│  └──────────────────────┬───────────────────────────┘           │
│                         │                                        │
│  ┌──────────────────────┴───────────────────────────┐           │
│  │                认证 API 服务                       │           │
│  │  login() │ logout() │ changePhone() │ verify()   │           │
│  └──────────────────────┬───────────────────────────┘           │
│                         │                                        │
│  ┌──────────────────────┴───────────────────────────┐           │
│  │          Axios API 客户端 (拦截器)                 │           │
│  └──────────────────────┬───────────────────────────┘           │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP
                          ▼
                 ┌─────────────────┐
                 │    后端 API     │
                 │  /api/login      │
                 │  /api/logout     │
                 │  /api/change_phone│
                 └─────────────────┘
```

### 2.2 组件架构

```
src/
├── components/
│   └── auth/
│       ├── index.ts              # 统一导出
│       ├── RequireAuth.tsx       # 受保护路由守卫
│       ├── PublicOnly.tsx        # 公开路由守卫
│       ├── ChangePhoneForm.tsx   # MFA 手机号更改表单
│       └── ChangePhoneForm.css   # 翻转卡片动画样式
├── hooks/
│   └── useIdleTimeout.ts         # 全局空闲检测 Hook
├── pages/
│   ├── LoginPage.tsx             # 登录表单 UI
│   └── AccountSettingsPage.tsx   # 账户设置（含手机号更改）
├── services/
│   └── api/
│       ├── apiClient.ts          # Axios 实例（含拦截器）
│       └── authApi.ts            # 认证相关 API 调用
├── stores/
│   ├── authStore.ts              # 认证状态管理
│   └── themeStore.ts             # 主题状态管理
├── config/
│   └── env.ts                    # 环境配置
└── types/
    └── auth.ts                   # TypeScript 接口定义
```

---

## 3. 详细设计

### 3.1 认证流程

#### 3.1.1 登录时序图

```
┌──────┐          ┌───────────┐         ┌───────────┐         ┌─────────┐
│ 用户 │          │  登录页面  │         │  认证仓库  │         │  后端   │
└──┬───┘          └─────┬─────┘         └─────┬─────┘         └────┬────┘
   │   输入凭证         │                    │                    │
   │ ──────────────────> │                    │                    │
   │                     │   login(creds)     │                    │
   │                     │ ─────────────────> │                    │
   │                     │                    │   POST /api/login  │
   │                     │                    │ ─────────────────> │
   │                     │                    │                    │
   │                     │                    │   登录响应          │
   │                     │                    │ <───────────────── │
   │                     │                    │                    │
   │                     │   更新状态          │                    │
   │                     │   持久化到 LS       │                    │
   │                     │ <───────────────── │                    │
   │   跳转到首页        │                    │                    │
   │ <────────────────── │                    │                    │
   │                     │                    │                    │
```

#### 3.1.2 状态管理设计

**认证状态仓库接口：**

```typescript
interface AuthState {
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

  // 操作方法
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

**持久化配置：**

```typescript
persist(
  (set, get) => ({
    /* 状态和操作 */
  }),
  {
    name: 'auth-storage',
    partialize: (state) => ({
      user: state.user,
      token: state.token,
      sessionId: state.sessionId,
      hierarchyId: state.hierarchyId,
      // ... 其他需要持久化的字段
    }),
  },
);
```

### 3.2 空闲超时设计

#### 3.2.1 Hook 实现

```typescript
// useIdleTimeout.ts
interface UseIdleTimeoutOptions {
  timeout: number; // 毫秒
  onIdle: () => void; // 空闲时的回调
  enabled?: boolean; // 启用/禁用 Hook
}

const useIdleTimeout = ({
  timeout,
  onIdle,
  enabled = true,
}: UseIdleTimeoutOptions) => {
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(onIdle, timeout);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );

    resetTimer(); // 启动初始计时器

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeout, onIdle, enabled]);
};
```

#### 3.2.2 在布局组件中集成

```typescript
// Layout.tsx
const Layout: React.FC = () => {
  const { token, logout } = useAuthStore();

  useIdleTimeout({
    timeout: 20 * 60 * 1000, // 20 分钟
    onIdle: logout,
    enabled: !!token,        // 仅在登录状态下启用
  });

  return (/* 布局 JSX */);
};
```

### 3.3 路由保护设计

#### 3.3.1 RequireAuth 组件

```typescript
// RequireAuth.tsx
const RequireAuth: React.FC = () => {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
```

#### 3.3.2 PublicOnly 组件

```typescript
// PublicOnly.tsx
const PublicOnly: React.FC = () => {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
```

#### 3.3.3 路由配置

```typescript
// routes.tsx
const routes: RouteObject[] = [
  {
    element: <PublicOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/accountsettings', element: <AccountSettingsPage /> },
          // ... 其他受保护路由
        ],
      },
    ],
  },
];
```

### 3.4 多标签页同步

#### 3.4.1 Storage 事件监听

```typescript
// authStore.ts - 在仓库初始化中
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth-storage') {
      const newState = event.newValue ? JSON.parse(event.newValue) : null;

      if (!newState?.state?.token) {
        // Token 在其他标签页被清除
        useAuthStore.getState().logout();
      }
    }
  });
}
```

### 3.5 更改手机号设计

#### 3.5.1 状态机

```
┌─────────────┐     提交        ┌─────────────┐     验证        ┌─────────────┐
│    输入     │ ──────────────> │    验证     │ ──────────────> │    成功     │
│  (步骤 1)   │                 │  (步骤 2)   │                 │  (步骤 3)   │
└─────────────┘                 └─────────────┘                 └─────────────┘
      │                               │                               │
      │ 错误                          │ 错误                          │
      ▼                               ▼                               │
┌─────────────┐                 ┌─────────────┐                       │
│  显示错误   │                 │ 重试/重发   │                       │
│    消息     │                 │  或登出     │                       │
└─────────────┘                 └─────────────┘                       │
      │                               │                               │
      │ 3次失败                       │ 达到最大尝试次数               │
      ▼                               ▼                               │
      └───────────────────────────────┴───────────────────────────────┘
                                   登出
```

#### 3.5.2 翻转动画 UI 流程

```css
/* 翻转卡片动画 */
.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

### 3.6 API 拦截器设计

#### 3.6.1 请求拦截器

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
```

#### 3.6.2 响应拦截器

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
```

---

## 4. API 接口契约

### 4.1 登录 API

| 属性         | 值                 |
| ------------ | ------------------ |
| 端点         | `POST /api/login`  |
| Content-Type | `application/json` |

**请求：**

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**响应：**

```typescript
interface LoginResponse {
  user_id: number;
  user_email: string;
  role: string;
  session_id: string;
  token: string | null;
  MFA: boolean;
  config: string;
  hierarchy: number;
  hierarchyName: string;
  merchant_id: string;
  merchant_name: string;
  merchants: string[];
  adminPermissions: string;
  can_refund: number;
  settlement_currencys: string[];
  timezone: string;
  timezone_short: string;
  child: HierarchyNode[];
  code: number;
  message: string;
}
```

### 4.2 更改手机号 API

| 属性         | 值                       |
| ------------ | ------------------------ |
| 端点         | `POST /api/change_phone` |
| Content-Type | `application/json`       |

**请求：**

```typescript
interface ChangePhoneRequest {
  password: string;
  phone: string; // 国际格式: +1234567890
}
```

**响应错误码：**

| 错误码 | 描述           | 处理方式                    |
| ------ | -------------- | --------------------------- |
| `0005` | 密码错误       | 显示剩余尝试次数，3次后登出 |
| `0016` | 手机号已被使用 | 提示使用其他号码            |
| `0003` | 验证码无效     | 显示剩余尝试次数            |
| `0004` | 验证码过期     | 提示重新发送                |
| `0014` | 账户被锁定     | 显示锁定时长，登出          |

### 4.3 Nauth 登录 URL API

| 属性 | 值                          |
| ---- | --------------------------- |
| 端点 | `POST /api/nauth_login_url` |
| 用途 | 获取修改密码的重定向 URL    |

**请求：**

```typescript
interface NauthLoginUrlRequest {
  callback_url: string;
  login_hint: string;
  update_password: boolean;
}
```

---

## 5. 安全考虑

### 5.1 Token 存储

| 方面       | 实现方式                             |
| ---------- | ------------------------------------ |
| 存储位置   | localStorage（通过 Zustand persist） |
| Token 类型 | JWT                                  |
| 过期处理   | 401 响应触发登出                     |

### 5.2 会话安全

| 措施         | 描述                               |
| ------------ | ---------------------------------- |
| 空闲超时     | 20 分钟无操作触发登出              |
| 多标签页同步 | 一个标签页登出后传播到所有标签页   |
| 敏感数据清理 | 登出时清除 hierarchyId、merchantId |
| 后退按钮保护 | 状态清除防止缓存访问               |

### 5.3 MFA 安全

| 措施           | 描述                   |
| -------------- | ---------------------- |
| 密码验证       | 更改手机号前需验证密码 |
| 尝试次数限制   | 3 次密码错误后强制登出 |
| 验证码重发限制 | 每个会话最多重发 2 次  |
| 账户锁定       | 多次失败后触发锁定     |

---

## 6. 性能考虑

### 6.1 优化策略

| 策略       | 实现方式                    |
| ---------- | --------------------------- |
| 懒加载     | 登录页面按需加载            |
| React.memo | 应用于认证组件              |
| 事件节流   | 空闲超时使用 passive 监听器 |
| 状态持久化 | 选择性字段持久化            |

### 6.2 性能指标

| 指标          | 目标    |
| ------------- | ------- |
| 路由守卫检查  | < 50ms  |
| 登录 API 响应 | < 2s    |
| 状态恢复      | < 100ms |

---

## 7. 测试策略

### 7.1 单元测试

| 组件             | 测试用例                           |
| ---------------- | ---------------------------------- |
| `authStore`      | 登录成功/失败、登出、状态持久化    |
| `useIdleTimeout` | 活动时重置计时器、超时时触发回调   |
| `RequireAuth`    | 无 token 时重定向、有 token 时渲染 |
| `PublicOnly`     | 有 token 时重定向、无 token 时渲染 |

### 7.2 集成测试

| 流程     | 测试用例                           |
| -------- | ---------------------------------- |
| 登录流程 | 表单验证、API 调用、状态更新、导航 |
| 登出流程 | 状态清理、localStorage 清除、导航  |
| 空闲超时 | 计时器在无操作后触发登出           |

### 7.3 测试文件

```
tests/
├── unit/
│   ├── stores/
│   │   └── authStore.test.ts
│   ├── hooks/
│   │   └── useIdleTimeout.test.ts
│   └── components/
│       └── (认证组件测试)
└── integration/
    └── auth/
        └── login.test.tsx
```

---

## 8. 错误处理

### 8.1 错误分类

| 分类           | 处理方式         |
| -------------- | ---------------- |
| 网络错误       | 显示重试提示     |
| 401 未授权     | 触发登出         |
| 400 请求错误   | 显示验证错误     |
| 500 服务器错误 | 显示通用错误消息 |

### 8.2 用户反馈

| 场景           | UI 反馈                    |
| -------------- | -------------------------- |
| 登录失败       | Ant Design `message.error` |
| 会话过期       | 重定向到登录页并显示消息   |
| 密码错误       | 内联表单错误，显示尝试次数 |
| 手机号更改成功 | 成功消息和返回按钮         |

---

## 9. 部署考虑

### 9.1 环境配置

```typescript
// src/config/env.ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL,
  helpDeskUrl: 'https://citcon-inc-591908.workflowcloud.com/...',
};
```

### 9.2 环境变量

| 变量           | 开发环境                     | 生产环境     |
| -------------- | ---------------------------- | ------------ |
| `VITE_API_URL` | `http://localhost:4200/api/` | 生产 API URL |

---

## 10. 依赖项

### 10.1 运行时依赖

| 包名                       | 版本    | 用途               |
| -------------------------- | ------- | ------------------ |
| `zustand`                  | ^4.5.0  | 状态管理           |
| `antd`                     | ^6.2.0  | UI 组件            |
| `react-router-dom`         | ^6.20.0 | 路由               |
| `axios`                    | ^1.13.2 | HTTP 客户端        |
| `react-phone-number-input` | ^3.4.14 | 带国旗的手机号输入 |

### 10.2 开发依赖

| 包名                     | 版本    | 用途     |
| ------------------------ | ------- | -------- |
| `vitest`                 | ^1.0.0  | 测试框架 |
| `@testing-library/react` | ^16.0.0 | 组件测试 |
| `msw`                    | ^2.12.8 | API 模拟 |

---

## 11. 实现检查清单

### 阶段 1：基础设施 ✅

- [x] 类型定义 (`src/types/auth.ts`)
- [x] API 客户端配置 (`src/services/api/apiClient.ts`)
- [x] 认证 API 服务 (`src/services/api/authApi.ts`)
- [x] 认证仓库 (`src/stores/authStore.ts`)

### 阶段 2：登录流程 ✅

- [x] 登录页面 UI (`src/pages/LoginPage.tsx`)
- [x] Ant Design 表单验证
- [x] 状态集成
- [x] 成功后导航

### 阶段 3：会话管理 ✅

- [x] 空闲超时 Hook (`src/hooks/useIdleTimeout.ts`)
- [x] 布局组件集成
- [x] 多标签页同步

### 阶段 4：路由保护 ✅

- [x] RequireAuth 组件
- [x] PublicOnly 组件
- [x] 路由配置

### 阶段 5：MFA 功能 ✅

- [x] 账户设置页面
- [x] 带翻转动画的更改手机号表单
- [x] 验证流程
- [x] 错误处理

### 阶段 6：完善 ✅

- [x] 401 拦截器
- [x] 环境配置
- [x] 主题支持
- [x] 单元测试

---

## 12. 附录

### A. 文件映射

| 规格需求               | 实现文件                                  |
| ---------------------- | ----------------------------------------- |
| FR-001 (Ant Design UI) | `src/pages/LoginPage.tsx`                 |
| FR-002 (Zustand Store) | `src/stores/authStore.ts`                 |
| FR-003 (空闲 Hook)     | `src/hooks/useIdleTimeout.ts`             |
| FR-004 (路由守卫)      | `src/components/auth/*.tsx`               |
| FR-005 (统一登出)      | `src/stores/authStore.ts`                 |
| FR-006 (更改手机号)    | `src/components/auth/ChangePhoneForm.tsx` |
| FR-007 (外部链接)      | `src/config/env.ts`                       |

### B. 相关文档

- [spec.md](./spec.md) - 功能规格说明
- [contracts.md](./contracts.md) - API 接口契约
- [plan.md](./plan.md) - 实施计划
- [tasks.md](./tasks.md) - 任务分解
