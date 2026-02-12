# 实施计划 - 登录页面

本计划概述了根据 `specs/login/spec.md` 实现登录页面功能的步骤。

## 用户故事 1：登录与状态持久化

### 1. 定义类型与 API

- [ ] 创建 `src/types/auth.ts`：定义 `User`, `LoginCredentials`, `AuthResponse` 接口。
- [ ] 创建 `src/services/api/authApi.ts`：使用 `apiClient` 实现 `login` API 调用。

### 2. 状态管理 (Zustand)

- [ ] 创建 `src/stores/authStore.ts`：
  - [ ] 定义 `AuthState` 接口（user, token, isLoading, error）。
  - [ ] 实现 `login` action：调用 `authApi.login`，更新状态，持久化 token（使用 `persist` 中间件）。
  - [ ] 实现 `logout` action：清除状态和存储。
  - [ ] 导出 `useAuthStore` hook。
- [ ] 更新 `src/stores/index.ts` 以导出 `useAuthStore`。

### 3. UI 实现

- [ ] 创建 `src/pages/LoginPage.tsx`：
  - [ ] 使用 `Ant Design` 组件：`Form`, `Input`, `Button`, `Card`, `Typography`。
  - [ ] 布局：居中显示的卡片，"Citcon" 标题，"Sign in to start your session" 副标题。
  - [ ] 表单字段：邮箱（验证），密码（验证）。
  - [ ] "Forgot Your Password" 链接。
  - [ ] 处理表单提交：调用 `useAuthStore.login`。
  - [ ] 处理加载状态（按钮 loading 属性）和错误显示（`message.error`）。

### 4. 路由

- [ ] 更新 `src/router/routes.tsx`：
  - [ ] 添加 `/login` 路由指向 `LoginPage`。
  - [ ] 确保 `/login` 无需认证即可访问。
  - [ ] 如果已认证用户尝试再次访问 `/login`，将其重定向到 `/`（仪表盘）。

---

## 用户故事 2：全局空闲自动登出

### 1. 自定义 Hook

- [ ] 创建 `src/hooks/useIdleTimeout.ts`：
  - [ ] 接受 `timeout`（毫秒）和 `onIdle`（回调）作为参数。
  - [ ] 使用 `useEffect` 监听 `mousemove`, `keydown`, `click`, `scroll` 事件。
  - [ ] 发生事件时重置计时器。
  - [ ] 计时器到期时触发 `onIdle`。
  - [ ] 组件卸载时清理监听器。

### 2. 集成

- [ ] 更新 `src/components/layout/Layout.tsx`（或 `App.tsx`）：
  - [ ] 引入 `useIdleTimeout` 和 `useAuthStore`。
  - [ ] 调用 `useIdleTimeout`，设置超时时间为 20 分钟（1200000 毫秒）。
  - [ ] 在 `onIdle` 回调中：调用 `logout()` action 并重定向到登录页（或外部 IDP 登出 URL）。

---

## 用户故事 3：路由守卫

### 1. 组件实现

- [ ] 创建 `src/components/auth/RequireAuth.tsx`：
  - [ ] 检查 `useAuthStore` 是否有有效 token/user。
  - [ ] 如果未认证，`<Navigate to="/login" replace />`。
  - [ ] 如果已认证，渲染 `children` 或 `<Outlet />`。

### 2. 路由配置

- [ ] 更新 `src/router/routes.tsx`：
  - [ ] 使用 `<RequireAuth>` 包裹受保护的路由（例如 `/`, `/users`）。

---

## 测试与验证

- [ ] **单元测试**：
  - [ ] 测试 `authStore` actions（登录/登出 成功/失败）。
  - [ ] 测试 `useIdleTimeout` hook（模拟计时器）。
- [ ] **集成测试**：
  - [ ] 测试登录页面流程：输入 -> 提交 -> 状态更新 -> 重定向。
  - [ ] 测试路由守卫：访问受保护路由 -> 重定向至登录页。
