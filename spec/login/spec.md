# Feature Specification: [Login Page]

**Feature Branch**: `[beta]`  
**Created**: [2026-01-16]  
**Updated**: [2026-02-05]  
**Status**: ✅ 已实现  
**Input**: 用户描述："使用 React 19 技术栈重写旧版登录逻辑，包含 JWT 认证、20 分钟空闲自动登出、AntD UI 组件及路由守卫。"

## 实现状态

| 功能模块            | 状态      | 相关文件                                  |
| ------------------- | --------- | ----------------------------------------- |
| Auth Store          | ✅ 已完成 | `src/stores/authStore.ts`                 |
| Auth API            | ✅ 已完成 | `src/services/api/authApi.ts`             |
| Login Page          | ✅ 已完成 | `src/pages/LoginPage.tsx`                 |
| RequireAuth         | ✅ 已完成 | `src/components/auth/RequireAuth.tsx`     |
| PublicOnly          | ✅ 已完成 | `src/components/auth/PublicOnly.tsx`      |
| Idle Timeout        | ✅ 已完成 | `src/hooks/useIdleTimeout.ts`             |
| Theme Store         | ✅ 已完成 | `src/stores/themeStore.ts`                |
| Account Settings    | ✅ 已完成 | `src/pages/AccountSettingsPage.tsx`       |
| Change Phone Number | ✅ 已完成 | `src/components/auth/ChangePhoneForm.tsx` |
| Environment Config  | ✅ 已完成 | `src/config/env.ts`                       |

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 登录与状态存储 (Priority: P1)

作为用户，我希望使用基于 Ant Design 的现代化界面登录，登录成功后系统应自动在全局状态管理器 (Zustand) 中持久化我的会话，并跳转至主页。

**Why this priority**: 系统的唯一入口，阻断性功能。
**The implementation ideas**: 使用 `Ant Design Form` 组件处理输入，通过 `useAuthStore` 的 `login` Action 处理 API 请求与状态更新。

**Independent Test**: 访问 `/login`，输入正确账号密码，观察 Redux DevTools/Zustand devtools 中的 Token 变化及路由跳转。

**Acceptance Scenarios**:

1. **Given** 用户在登录页 **When** 输入有效凭证并点击 "Sign In", **Then** 调用 `authService`，成功后更新 Zustand `user` 状态，并且持久化中间件将 Token 存入 Storage，路由重定向至 Dashboard
2. **Given** 用户输入无效凭证 **When** 提交表单 **Then** 界面展示 AntD `message.error` 提示，且状态不发生变更。

---

### User Story 2 - 全局空闲自动登出 (Priority: P1)

作为安全管理员，我要求系统使用 React Hooks 监听全局用户交互，若用户静止超过 20 分钟，自动触发清理流程并跳转至 IDP 登出页。

**Why this priority**: 满足金融级安全合规要求。
**The implementation ideas**: 创建自定义 Hook `useIdleTimeout(20)`，在根组件 `App.tsx` 或 `Layout` 中挂载。不依赖旧的 `idlejs` 库，而是使用 React useEffect 或现代轻量库。

**Independent Test**: 将超时时间临时改为 1 分钟，停止操作鼠标键盘，验证是否触发 Zustand 的 `logout` action。

**Acceptance Scenarios**:

1. **Given** 用户已登录 **When** 全局 Hook 检测到 20 分钟无 `mousemove` / `keydown` 事件 **Then** `useAuthStore.getState().logout()`，清理 `hierarchyId` 等敏感数据，并执行 `window.location.href = idpLogoutUrl`
2. **Given** 用户正在操作，**When** 发生交互事件，**Then** Hook 内部的 Timer 重置。

---

### User Story 3 - 路由守卫与组件保护 (Priority: P1)

作为开发者，我希望通过 React 高阶组件 (HOC) 或 Wrapper 组件保护敏感路由，防止未授权访问。

**Why this priority**: 前端路由安全的基础。
**The implementation ideas**: 创建 `<RequireAuth>` 组件包裹受保护的路由配置。

**Independent Test**: 清除 LocalStorage 后直接访问 URL `/dashboard/users`，应被强制重定向回 `/login`。

**Acceptance Scenarios**:

1. **Given** 匿名用户，**When** 尝试访问非白名单路由（非 `/login`, `/forgot-password`），**Then** `<RequireAuth>` 组件检测到 Zustand 中无 Token，利用 `<Navigate to="/login" replace />` 将其拦截。
2. **Given** 已登录用户，**When** 访问 `/login` 页面，**Then** 系统自动将其重定向回 `/dashboard`（防止重复登录）。

---

### User Story 4 - 更改手机号码 (Priority: P2)

作为启用了 MFA 的用户，我希望能够在 Account Settings 页面更改我的绑定手机号码，以便在更换手机时保持账户安全。

**Why this priority**: MFA 用户的重要安全功能。
**The implementation ideas**: 使用翻转卡片动画展示 Change Phone Number 表单，集成 `react-phone-number-input` 实现国际电话号码输入。

**Independent Test**: 登录启用 MFA 的账户，进入 Account Settings，点击 Phone Number 的 Change 按钮，验证翻转动画和表单功能。

**Acceptance Scenarios**:

1. **Given** MFA 用户在 Account Settings **When** 点击 Phone Number 的 "Change" 按钮 **Then** 页面通过 3D 翻转动画展示 Change Phone Number 表单
2. **Given** 用户在 Change Phone Number 表单 **When** 输入正确密码和新手机号并提交 **Then** 系统发送验证码到原手机号
3. **Given** 用户收到验证码 **When** 输入正确验证码并提交 **Then** 手机号更改成功，显示成功消息和 Back 按钮
4. **Given** 用户密码输入错误 3 次 **When** 再次提交 **Then** 显示错误消息，3秒后自动登出
5. **Given** 用户验证码尝试次数用尽 **When** 重发次数也用尽 **Then** 显示错误消息，自动登出

---

### Edge Cases

- **Token 自动续期**: 如果用户一直在操作，但 JWT Token 过期，Axios 拦截器 (Interceptor) 应捕获 401 错误并触发 Zustand 的 `logout` Action。
- **浏览器并发标签页**: 修改 LocalStorage 时，利用 `window.addEventListener('storage', ...)` 确保多标签页状态同步（由 Zustand persist middleware 部分处理，但需验证业务逻辑同步）。

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 必须使用 **Ant Design 5** 的 `<Form>`, `<Input>`, `<Button>` 组件构建 UI，并支持 Form 校验反馈。
- **FR-002**: 必须使用 **Zustand** 创建 `useAuthStore`，管理 `token`, `userInfo`, `hierarchyId`，并配置 `persist` 中间件实现自动持久化到 LocalStorage。
- **FR-003**: 必须实现自定义 Hook `useIdle(timeout: number)`，仅在用户**已登录**状态下激活倒计时逻辑。
- **FR-004**: 必须在路由层级实现 `<RequireAuth>` 和 `<PublicOnly>` (针对登录页) 两种包装组件。
- **FR-005**: 登出逻辑需封装在 Store Action 中，确保 UI 点击登出和自动超时登出调用的是**同一段**业务逻辑代码。
- **FR-006**: 必须实现 Change Phone Number 功能，包含密码验证、国际电话号码输入（带国旗）、验证码验证三个步骤。
- **FR-007**: 外部链接（如 Help Desk URL）必须配置在 `src/config/env.ts` 中，便于统一管理。

### Key Entities (Zustand State)

- **AuthContext**:
  ```typescript
  interface AuthState {
    loggedInData: object;
    preAuthMerchant: boolean;
    upiMerchant: boolean;
    hasDispute: boolean;
    currentEmail: string;
    merchantId: string | null; // 需在 unload 时清理
    hierarchyId: string | null; // 需主要持久化
    login: (params) => Promise<void>;
    logout: () => void;
  }
  ```

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: **代码规范**: 登录模块完全没有 Class Component，全面使用 FC + Hooks，且无 `any` 类型。
- **SC-002**: **性能**: 路由切换时，鉴权逻辑带来的延迟不超过 50ms（无感知）。
- **SC-003**: **安全**: 20 分钟无操作后，LocalStorage 中的 `sensitive_data` 被确切清除，且无法通过浏览器“后退”按钮查看之前的缓存页面。
