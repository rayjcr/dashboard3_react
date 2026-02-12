# 实施计划 - 登录页面

> **最后更新**: 2026-02-09  
> **状态**: ✅ 已完成

本计划概述了根据 `spec/login/spec.md` 实现登录页面功能的步骤。

## 用户故事 1：登录与状态持久化 ✅

### 1. 定义类型与 API

- [x] 配置环境变量：设置后端根 URL 为 `http://localhost:4200/api/`。
- [x] 创建 `src/types/auth.ts`：定义 `User`, `LoginCredentials`, `AuthResponse` 接口。
- [x] 创建 `src/services/api/authApi.ts`：使用 `apiClient` 实现 `login` API 调用。

### 2. 状态管理 (Zustand)

- [x] 创建 `src/stores/authStore.ts`：
  - [x] 定义 `AuthState` 接口（user, token, isLoading, error）。
  - [x] 实现 `login` action：调用 `authApi.login`，更新状态，持久化 token（使用 `persist` 中间件）。
  - [x] 实现 `logout` action：清除状态和存储。
  - [x] 导出 `useAuthStore` hook。
- [x] 更新 `src/stores/index.ts` 以导出 `useAuthStore`。

### 3. UI 实现

- [x] 创建 `src/pages/LoginPage.tsx`：
  - [x] 使用 `Ant Design` 组件：`Form`, `Input`, `Button`, `Card`, `Typography`。
  - [x] 布局：居中显示的卡片，"Citcon" 标题，"Sign in to start your session" 副标题。
  - [x] 表单字段：邮箱（验证），密码（验证）。
  - [x] "Forgot Your Password" 链接。
  - [x] 处理表单提交：调用 `useAuthStore.login`。
  - [x] 处理加载状态（按钮 loading 属性）和错误显示（`message.error`）。

### 4. 路由

- [x] 更新 `src/router/routes.tsx`：
  - [x] 添加 `/login` 路由指向 `LoginPage`。
  - [x] 确保 `/login` 无需认证即可访问。
  - [x] 如果已认证用户尝试再次访问 `/login`，将其重定向到 `/`（仪表盘）。

---

## 用户故事 2：全局空闲自动登出 ✅

### 1. 自定义 Hook

- [x] 创建 `src/hooks/useIdleTimeout.ts`：
  - [x] 接受 `timeout`（毫秒）和 `onIdle`（回调）作为参数。
  - [x] 使用 `useEffect` 监听 `mousemove`, `keydown`, `click`, `scroll`, `touchstart` 事件。
  - [x] 发生事件时重置计时器。
  - [x] 计时器到期时触发 `onIdle`。
  - [x] 组件卸载时清理监听器。

### 2. 集成

- [x] 更新 `src/components/layout/Layout.tsx`：
  - [x] 引入 `useIdleTimeout` 和 `useAuthStore`。
  - [x] 调用 `useIdleTimeout`，设置超时时间为 20 分钟（1200000 毫秒）。
  - [x] 仅在用户已登录状态下激活（`enabled: !!token`）。
  - [x] 在 `onIdle` 回调中：调用 `logout()` action 并重定向到登录页。

---

## 用户故事 3：路由守卫 ✅

### 1. 组件实现

- [x] 创建 `src/components/auth/RequireAuth.tsx`：
  - [x] 检查 `useAuthStore` 是否有有效 token/user。
  - [x] 如果未认证，`<Navigate to="/login" replace />`。
  - [x] 如果已认证，渲染 `<Outlet />`。
- [x] 创建 `src/components/auth/PublicOnly.tsx`：
  - [x] 如果已认证，`<Navigate to="/" replace />`。
  - [x] 如果未认证，渲染 `<Outlet />`。

### 2. 路由配置

- [x] 更新 `src/router/routes.tsx`：
  - [x] 使用 `<RequireAuth>` 包裹受保护的路由（例如 `/`, `/dashboard`）。
  - [x] 使用 `<PublicOnly>` 包裹 `/login` 路由。

---

## 用户故事 4：更改手机号码 ✅

### 1. 组件实现

- [x] 创建 `src/components/auth/ChangePhoneForm.tsx`：
  - [x] 3 阶段状态机：input → verify → success
  - [x] 密码验证（最多 3 次尝试）
  - [x] 国际电话号码输入（使用 `react-phone-number-input`）
  - [x] 验证码输入和验证
  - [x] 重发验证码（最多 2 次）
  - [x] 错误处理和自动登出

### 2. 样式

- [x] 创建 `src/components/auth/ChangePhoneForm.css`：
  - [x] 3D 翻转卡片动画
  - [x] 响应式布局

### 3. API 集成

- [x] 更新 `src/services/api/authApi.ts`：
  - [x] 添加 `changePhone()` API
  - [x] 添加 `resendAuthCode()` API
  - [x] 添加 `verifyChangePhone()` API

### 4. 页面集成

- [x] 更新 `src/pages/AccountSettingsPage.tsx`：
  - [x] 集成翻转卡片动画
  - [x] 集成 `ChangePhoneForm` 组件

---

## 用户故事 5：主题切换 ✅

### 1. 状态管理

- [x] 创建 `src/stores/themeStore.ts`：
  - [x] 定义 `ThemeState` 接口（currentTheme, setTheme, toggleTheme）
  - [x] 使用 `persist` 中间件持久化主题选择
  - [x] 同步到 HTML 根元素的 `data-theme` 属性

### 2. UI 组件

- [x] 创建 `src/components/common/ThemeSwitcher.tsx`：
  - [x] 太阳/月亮图标切换
  - [x] 集成 `themeStore`

### 3. 样式

- [x] 更新 `src/styles/theme.css`：
  - [x] CSS 变量定义亮色/暗色主题
  - [x] 主色调配置

---

## 性能优化 ✅

### 1. 代码分割（懒加载）

- [x] 更新 `src/router/routes.tsx`：
  - [x] 使用 `React.lazy()` 懒加载页面组件
  - [x] 添加 `Suspense` 和加载状态

### 2. 运行时优化

- [x] 创建 `src/hooks/useDebounce.ts`：
  - [x] 防抖 Hook 用于搜索输入
- [x] 添加 `React.memo`：
  - [x] `TransactionLookupFilter`
  - [x] `DownloadButtons`
  - [x] `DateFilter`
  - [x] `Footer`
  - [x] `ThemeSwitcher`
  - [x] `AppBreadcrumb`
  - [x] `Button`
  - [x] `PageLoading`

---

## 测试 ✅

### 单元测试

- [x] 测试 `authStore` actions（登录/登出 成功/失败）
- [x] 测试 `themeStore` actions（setTheme/toggleTheme）
- [x] 测试 `useIdleTimeout` hook（模拟计时器）
- [x] 测试 `useDebounce` hook
- [x] 测试工具函数：`currency.ts`, `dashboard.ts`, `transactionLookup.ts`

### 组件测试

- [x] 测试 `ThemeSwitcher` 组件
- [x] 测试 `DateFilter` 组件
- [x] 测试 `DownloadButtons` 组件

### 集成测试

- [x] 测试登录页面流程：输入 -> 提交 -> 状态更新 -> 重定向
- [x] 测试 Transaction Lookup 流程

---

## 文档 ✅

- [x] 创建 `spec/login/TD.md`：技术设计文档
- [x] 创建 `tests/TEST_CASES.md`：测试用例文档
- [x] 创建 `tests/README.md`：测试指南
- [x] 更新 `spec/TechDesign.md`：添加安全性设计章节
