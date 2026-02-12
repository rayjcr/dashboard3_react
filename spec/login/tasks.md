# Tasks: Login Page

> **最后更新**: 2026-02-09  
> **状态**: ✅ 已完成

**Input**: Design documents from `/spec/login/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `src/` at repository root
- Paths follow constitution.md structure

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization and environment configuration

- [x] T001 配置环境变量：更新 `.env.development`，设置 `VITE_API_URL` 为 `http://localhost:4200/api/`
- [x] T002 [P] 创建 `src/types/auth.ts`：定义 `User`, `LoginCredentials`, `AuthResponse`, `AuthState` 接口
- [x] T003 [P] 配置 `src/services/api/apiClient.ts`：确保 baseURL 使用 `import.meta.env.VITE_API_URL`
- [x] `login` API 调用接口为 `VITE_API_URL/login`。

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 创建 `src/services/api/authApi.ts`：实现 `login(credentials)` 和 `logout()` API 调用
- [x] T005 创建 `src/stores/authStore.ts`：
  - 读取 `spec/login/contracts.md` 中的 `login` 返回结构
  - 定义 `AuthState` 接口（user, token, isLoading, error, hierarchyId）
  - 使用 `persist` 和 `devtools` 中间件
  - 实现 `login` action：调用 `authApi.login`，更新状态，持久化 token
  - 实现 `logout` action：清除状态和 localStorage
  - 导出 `useAuthStore` hook
- [x] T006 更新 `src/stores/index.ts`：导出 `useAuthStore`

**Checkpoint**: Foundation ready ✅

---

## Phase 3: User Story 1 - 登录与状态存储 (Priority: P1) ✅

**Goal**: 用户可以通过 Ant Design 界面登录，成功后会话持久化到 Zustand 并跳转至主页

- [x] T007 [US1] 创建 `src/pages/LoginPage.tsx`
- [x] T008 [US1] 在 `LoginPage.tsx` 中集成 `useAuthStore`
- [x] T009 [US1] 更新 `src/router/routes.tsx`：添加 `/login` 路由指向 `LoginPage`
- [x] T010 [US1] 在 `LoginPage.tsx` 中添加已登录用户重定向逻辑

**Checkpoint**: User Story 1 完成 ✅

---

## Phase 4: User Story 2 - 全局空闲自动登出 (Priority: P1) ✅

**Goal**: 用户静止超过 20 分钟后，系统自动触发登出并跳转至登录页

- [x] T011 [US2] 创建 `src/hooks/useIdleTimeout.ts`
- [x] T012 [US2] 更新 `src/components/layout/Layout.tsx`：集成 `useIdleTimeout`
- [x] T013 [US2] 在 `authStore.ts` 的 `logout` action 中添加跳转逻辑

**Checkpoint**: User Story 2 完成 ✅

---

## Phase 5: User Story 3 - 路由守卫与组件保护 (Priority: P1) ✅

**Goal**: 通过 Wrapper 组件保护敏感路由，未授权用户无法访问

- [x] T014 [P] [US3] 创建 `src/components/auth/RequireAuth.tsx`
- [x] T015 [P] [US3] 创建 `src/components/auth/PublicOnly.tsx`
- [x] T016 [US3] 更新 `src/router/routes.tsx`：配置路由守卫
- [x] T017 [US3] 创建 `src/components/auth/index.ts`：导出组件

**Checkpoint**: User Story 3 完成 ✅

---

## Phase 6: User Story 4 - 更改手机号码 (Priority: P2) ✅

**Goal**: MFA 用户可以在 Account Settings 页面更改绑定手机号码

- [x] T021 [US4] 创建 `src/components/auth/ChangePhoneForm.tsx`：
  - 3 阶段状态机：input → verify → success
  - 密码验证（最多 3 次尝试，超过后强制登出）
  - 国际电话号码输入（使用 `react-phone-number-input`，带国旗选择器）
  - 验证码输入和验证
  - 重发验证码功能（最多 2 次）
  - 错误处理和自动登出逻辑
- [x] T022 [US4] 创建 `src/components/auth/ChangePhoneForm.css`：
  - 3D 翻转卡片动画（perspective, rotateY）
  - 响应式布局
- [x] T023 [US4] 更新 `src/services/api/authApi.ts`：
  - 添加 `changePhone(password, phone)` API
  - 添加 `resendAuthCode()` API
  - 添加 `verifyChangePhone(authCode)` API
- [x] T024 [US4] 更新 `src/pages/AccountSettingsPage.tsx`：
  - 集成翻转卡片动画
  - 集成 `ChangePhoneForm` 组件
  - 添加 MFA 用户显示逻辑

**Checkpoint**: User Story 4 完成 ✅

---

## Phase 7: 主题切换功能 ✅

**Goal**: 支持亮色/暗色主题切换

- [x] T025 创建 `src/stores/themeStore.ts`：
  - 定义 `ThemeState` 接口
  - 使用 `persist` 中间件持久化
  - 同步到 HTML 根元素 `data-theme` 属性
- [x] T026 创建 `src/components/common/ThemeSwitcher.tsx`：
  - 太阳/月亮图标切换
  - 集成 `themeStore`
- [x] T027 更新 `src/styles/theme.css`：CSS 变量定义

**Checkpoint**: 主题切换功能完成 ✅

---

## Phase 8: 性能优化 ✅

**Goal**: 代码分割和运行时优化

### 8.1 代码分割

- [x] T028 更新 `src/router/routes.tsx`：使用 `React.lazy()` 懒加载页面
- [x] T029 创建 `src/components/common/LazyPage.tsx`：懒加载包装组件
- [x] T030 创建 `src/components/common/PageLoading.tsx`：加载状态组件

### 8.2 运行时优化

- [x] T031 创建 `src/hooks/useDebounce.ts`：防抖 Hook
- [x] T032 创建 `src/hooks/index.ts`：统一导出 Hooks
- [x] T033 添加 `React.memo` 到以下组件：
  - `TransactionLookupFilter`
  - `DownloadButtons`
  - `DateFilter`
  - `Footer`
  - `ThemeSwitcher`
  - `AppBreadcrumb`
  - `Button`
  - `PageLoading`

**Checkpoint**: 性能优化完成 ✅

---

## Phase 9: 测试 ✅

**Goal**: 添加单元测试和集成测试

### 9.1 测试基础设施

- [x] T034 安装测试依赖：`@testing-library/jest-dom`, `msw`, `@testing-library/user-event`, `jsdom`
- [x] T035 更新 `tests/setup.ts`：配置 Vitest 和 jest-dom
- [x] T036 创建 `tests/mocks/handlers.ts`：MSW API 处理器
- [x] T037 创建 `tests/mocks/server.ts`：MSW 服务器配置
- [x] T038 更新 `vitest.config.ts`：添加覆盖率配置

### 9.2 单元测试

- [x] T039 创建 `tests/unit/utils/currency.test.ts`（26 tests）
- [x] T040 创建 `tests/unit/utils/dashboard.test.ts`（25 tests）
- [x] T041 创建 `tests/unit/utils/transactionLookup.test.ts`（17 tests）
- [x] T042 创建 `tests/unit/hooks/useDebounce.test.ts`（7 tests）
- [x] T043 创建 `tests/unit/hooks/useIdleTimeout.test.ts`（8 tests）
- [x] T044 创建 `tests/unit/stores/themeStore.test.ts`（6 tests）
- [x] T045 创建 `tests/unit/stores/authStore.test.ts`（11 tests）

### 9.3 组件测试

- [x] T046 创建 `tests/unit/components/ThemeSwitcher.test.tsx`（4 tests）
- [x] T047 创建 `tests/unit/components/DateFilter.test.tsx`（7 tests）
- [x] T048 创建 `tests/unit/components/DownloadButtons.test.tsx`（11 tests）

### 9.4 集成测试

- [x] T049 创建 `tests/integration/auth/login.test.tsx`（4 tests）
- [x] T050 创建 `tests/integration/dashboard/transactionLookup.test.tsx`（7 tests）

### 9.5 文档

- [x] T051 创建 `tests/TEST_CASES.md`：测试用例文档
- [x] T052 创建 `tests/README.md`：测试指南

**Checkpoint**: 测试完成（133 tests passing）✅

---

## Phase 10: 文档与收尾 ✅

**Goal**: 完善技术文档

- [x] T053 创建 `spec/login/TD.md`：登录模块技术设计文档
- [x] T054 更新 `spec/TechDesign.md`：添加安全性设计章节（第 9 章）
- [x] T055 更新 `README.md`：添加测试命令说明
- [x] T056 更新 `package.json`：添加测试脚本

**Checkpoint**: 文档完成 ✅

---

## Phase 6 (Legacy): Polish & Cross-Cutting Concerns ✅

**Purpose**: Improvements that affect multiple user stories

- [x] T018 [P] 在 `src/services/api/apiClient.ts` 中添加 Axios 响应拦截器：捕获 401 错误并触发 `logout` action
- [x] T019 [P] 添加多标签页同步：通过 Zustand persist 中间件自动同步 localStorage
- [x] T020 代码清理和 ESLint 检查

---

## Summary

| 阶段                    | 任务数 | 状态   |
| ----------------------- | ------ | ------ |
| Phase 1: Setup          | 4      | ✅     |
| Phase 2: Foundational   | 3      | ✅     |
| Phase 3: US1 登录       | 4      | ✅     |
| Phase 4: US2 空闲登出   | 3      | ✅     |
| Phase 5: US3 路由守卫   | 4      | ✅     |
| Phase 6: US4 更改手机号 | 4      | ✅     |
| Phase 7: 主题切换       | 3      | ✅     |
| Phase 8: 性能优化       | 6      | ✅     |
| Phase 9: 测试           | 19     | ✅     |
| Phase 10: 文档          | 4      | ✅     |
| Legacy Polish           | 3      | ✅     |
| **总计**                | **57** | **✅** |

---

## 测试统计

| 类别        | 测试文件数 | 测试用例数 |
| ----------- | ---------- | ---------- |
| Utils       | 3          | 68         |
| Hooks       | 2          | 15         |
| Stores      | 2          | 17         |
| Components  | 3          | 22         |
| Integration | 2          | 11         |
| **总计**    | **12**     | **133**    |
