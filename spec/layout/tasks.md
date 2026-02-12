# Tasks: Layout 组件

**Input**: Design documents from `/spec/layout/`
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

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 创建共享的状态管理和工具函数

- [x] T001 [P] 创建 `src/types/ui.ts`：定义 UI 相关类型
  - `UIState` 接口
  - `sidebarCollapsed: boolean`
  - `sidebarDrawerOpen: boolean`
- [x] T002 创建 `src/stores/uiStore.ts`：UI 状态管理
  - `sidebarCollapsed: boolean`
  - `sidebarDrawerOpen: boolean`
  - Actions: `toggleSidebar`, `setSidebarCollapsed`, `toggleDrawer`, `setDrawerOpen`
  - 使用 `persist` 中间件持久化 `sidebarCollapsed`
- [x] T003 更新 `src/stores/index.ts`：导出 `useUIStore`
- [x] T004 [P] 创建 `src/hooks/useBreakpoint.ts`：
  - 使用 `window.matchMedia` 或 `resize` 事件检测屏幕尺寸
  - 返回 `{ isMobile, isTablet, isDesktop }`
  - 断点：mobile < 768px, tablet 768-1023px, desktop ≥ 1024px

**Checkpoint**: 共享基础设施就绪

---

## Phase 2: User Story 1 - 顶部导航栏 Header (Priority: P1)

**Goal**: 实现固定顶部的 Header，包含 Logo 和面包屑导航

**Independent Test**: 访问任意页面，Header 应固定在顶部，面包屑反映当前路由

### Implementation for User Story 1

- [x] T005 [P] [US1] 创建 `src/components/layout/AppBreadcrumb.tsx`：
  - 使用 Ant Design `Breadcrumb` 组件
  - 使用 `useLocation` 获取当前路由
  - 路由路径映射为面包屑项
  - 支持点击跳转
- [x] T006 [US1] 更新 `src/components/layout/Header.tsx`：
  - 使用 Ant Design `Layout.Header`
  - 固定顶部 (`position: sticky`, `top: 0`, `z-index: 100`)
  - 高度 64px
  - 左侧：Citcon Logo (文字)
  - Logo 右侧：`<AppBreadcrumb />`
  - 移动端：显示汉堡菜单图标，点击触发 `toggleDrawer()`

**Checkpoint**: US1 完成，Header 功能可独立测试

---

## Phase 3: User Story 2 - 响应式布局 (Priority: P1)

**Goal**: 实现 Sidebar 折叠功能和移动端抽屉模式

**Independent Test**:

- 桌面端：Sidebar 可见，点击按钮可折叠/展开
- 移动端：Sidebar 变为 Drawer，点击汉堡菜单可打开/关闭

### Implementation for User Story 2

- [x] T007 [US2] 创建 `src/components/layout/Sidebar.tsx`：
  - 使用 Ant Design `Layout.Sider` 组件
  - 从 `useUIStore` 获取 `sidebarCollapsed` 状态
  - 展开宽度 256px，折叠宽度 80px
  - 底部添加折叠按钮 (`<<` / `>>` 图标)
  - 过渡动画 (`transition: width 0.2s`)
- [x] T008 [US2] 更新 `src/components/layout/Layout.tsx`：
  - 使用 `useBreakpoint` 检测屏幕尺寸
  - 桌面端/平板端 (≥768px)：正常渲染 `<Sidebar />`
  - 移动端 (<768px)：使用 Ant Design `Drawer` 包裹 Sidebar 内容
    - Drawer 从左侧滑出，有遮罩层
    - 点击遮罩关闭 Drawer (`onClose` → `setDrawerOpen(false)`)
  - Sidebar 折叠状态完全由用户控制，通过 persist 中间件持久化
  - 保留现有 idle timeout 逻辑
- [x] T009 [US2] 更新 `src/components/layout/Header.tsx`：
  - 移动端：左侧显示汉堡图标 (`MenuOutlined`)
  - 点击汉堡图标触发 `toggleDrawer()`

**Checkpoint**: US2 完成，响应式布局可测试

---

## Phase 4: User Story 3 - Footer (Priority: P2)

**Goal**: 实现底部版权信息

**Independent Test**: 页面底部显示版权信息

### Implementation for User Story 3

- [x] T010 [US3] 更新 `src/components/layout/Footer.tsx`：
  - 使用 Ant Design `Layout.Footer`
  - 显示 `© 2026 Citcon. All rights reserved.`
  - 文字居中
  - 使用默认主题样式

**Checkpoint**: US3 完成，Footer 可测试

---

## Phase 5: Integration & Theme

**Purpose**: 整合所有组件，配置主题

- [x] T011 更新 `src/components/layout/Layout.tsx`：
  - 使用 Ant Design `Layout` 组件结构：
    ```tsx
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sider /> {/* 桌面端，或 Drawer（移动端） */}
        <Layout>
          <Content>
            <Outlet />
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </Layout>
    ```
- [x] T012 更新 `src/App.tsx`：
  - 使用 `ConfigProvider` 包裹应用
  - 使用 Ant Design 5.x 默认主题
  - 可选配置主色调 `colorPrimary: '#1890ff'`
- [x] T013 更新 `src/components/layout/index.ts`：
  - 导出所有布局组件：`Layout`, `Header`, `Sidebar`, `Footer`, `AppBreadcrumb`
- [x] T014 代码清理和 ESLint 检查

---

## Phase 6: User Story 4 - 动态树形菜单 TreeMenu (Priority: P1)

**Goal**: 实现商户/层级的动态树形菜单，支持异步加载子节点

**Independent Test**:

- 登录后 Sidebar 显示树形菜单
- 点击有子节点的节点，加载并显示子节点
- 点击节点名称，高亮选中

### Implementation for User Story 4

- [x] T015 [P] [US4] 创建 `src/types/hierarchy.ts`：

  - 定义 `MultilayerRequest` 接口：`{ parent_id: number, session_id: string }`
  - 定义 `MultilayerResponse` 接口：`{ code: number, message?: string, childrens_data: ChildrensData[] }`
  - 定义 `ChildrensData` 接口

- [x] T016 [P] [US4] 创建 `src/services/api/hierarchyApi.ts`：

  - 实现 `fetchMultilayer(parentId: number, sessionId: string): Promise<MultilayerResponse>`
  - POST `/multilayer`
  - Content-Type: application/json

- [x] T017 [US4] 更新 `src/stores/uiStore.ts`：

  - 添加 `selectedNode: HierarchyNode | null` 状态
  - 添加 `expandedKeys: string[]` 状态
  - 添加 `setSelectedNode(node: HierarchyNode | null)` action
  - 添加 `setExpandedKeys(keys: string[])` action
  - 持久化 `selectedNode` 和 `expandedKeys`

- [x] T018 [US4] 创建 `src/stores/hierarchyStore.ts`：

  - `childrenCache: Record<number, HierarchyNode[]>` - 子节点缓存
  - `loadingNodes: number[]` - 加载中的节点 ID 列表
  - `fetchChildren(parentId: number, sessionId: string)` action
  - `setChildren(parentId: number, children: HierarchyNode[])` action
  - 使用 `persist` 中间件持久化 `childrenCache`

- [x] T019 更新 `src/stores/index.ts`：导出 `useHierarchyStore`

- [x] T020 [US4] 创建 `src/components/layout/TreeMenu.tsx`：
  - 使用 Ant Design `Tree` 组件
  - 从 `authStore.hierarchyTree` 获取初始数据（顶层节点）
  - 从 `uiStore` 获取 `selectedNode` 和 `expandedKeys`
  - 从 `hierarchyStore` 获取 `childrenCache` 和 `loadingNodes`
  - 实现 `loadData` prop 异步加载子节点
  - 节点 title 显示 `value` 字段
  - 鼠标悬停节点时 Tooltip 显示 `merchantId`
  - 根据 `children` 属性判断是否显示展开图标
  - 点击节点名称：`setSelectedNode(node)` 高亮选中
  - 加载中节点显示 loading 图标
  - 加载失败显示 Toast 消息 (`message.error`)

**Checkpoint**: US4 完成，TreeMenu 功能可独立测试

---

## Phase 7: User Story 5 - 静态用户菜单 UserMenu (Priority: P1)

**Goal**: 实现静态功能菜单，支持路由跳转、外部链接和退出登录

**Independent Test**:

- 点击菜单项跳转到对应路由
- Citcon Help Desk 新窗口打开外部链接
- Logout 退出登录并跳转到 /login

### Implementation for User Story 5

- [x] T021 [P] [US5] 创建 `src/config/userMenu.ts`：

  - 定义 `UserMenuItem` 接口
  - 导出 `USER_MENU_ITEMS` 配置数组
  - 包含：All Transactions Search, Account Settings, Fraud Engine, Citcon Help Desk, Logout

- [x] T022 [US5] 创建 `src/components/layout/UserMenu.tsx`：
  - 使用 Ant Design `Menu` 组件
  - 从 `USER_MENU_ITEMS` 渲染菜单项
  - 使用对应图标：SearchOutlined, SettingOutlined, SafetyOutlined, QuestionCircleOutlined, LogoutOutlined
  - 处理内部路由跳转：使用 `useNavigate`
  - 处理外部链接：`window.open(href, '_blank')`
  - 处理 Logout：调用 `authStore.logout()` 后 `navigate('/login')`
  - 使用 `useLocation` 高亮当前路由对应的菜单项
  - 支持 `collapsed` prop 折叠状态（只显示图标）

**Checkpoint**: US5 完成，UserMenu 功能可独立测试

---

## Phase 8: Sidebar 整合

**Goal**: 整合 TreeMenu 和 UserMenu 到 Sidebar

- [x] T023 [US4+US5] 更新 `src/components/layout/Sidebar.tsx`：

  - 上部渲染 `<TreeMenu />`
  - 添加 `<Divider />` 分隔线
  - 下部渲染 `<UserMenu collapsed={collapsed} />`
  - 底部保留折叠按钮
  - TreeMenu 和 UserMenu 支持折叠状态

- [x] T024 更新 `src/components/layout/index.ts`：

  - 导出 `TreeMenu`, `UserMenu`

- [x] T025 代码清理和 ESLint 检查

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (US1 - Header)**: Depends on Phase 1 (useBreakpoint, uiStore)
- **Phase 3 (US2 - Responsive)**: Depends on Phase 1 & 2
- **Phase 4 (US3 - Footer)**: Independent, can run in parallel with Phase 2 & 3
- **Phase 5 (Integration)**: Depends on all previous phases
- **Phase 6 (US4 - TreeMenu)**: Depends on Phase 1 & 3 (需要 uiStore, Sidebar)
- **Phase 7 (US5 - UserMenu)**: Depends on Phase 1 & 3 (需要 authStore, Sidebar)
- **Phase 8 (Sidebar 整合)**: Depends on Phase 6 & 7

### Parallel Opportunities

- T001, T004 can run in parallel (different files)
- T005 can run in parallel with T007 (different components)
- T010 (Footer) can run in parallel with T007-T009 (Responsive)
- T015, T016, T021 can run in parallel (different files)
- Phase 6 (TreeMenu) can run in parallel with Phase 7 (UserMenu)

### Recommended Order

1. T001-T004 (Setup)
2. T005-T006 (Header) | T010 (Footer) - 可并行
3. T007-T009 (Responsive)
4. T011-T014 (Integration)
5. T015-T020 (TreeMenu) | T021-T022 (UserMenu) - 可并行
6. T023-T025 (Sidebar 整合)

---

## Summary

- **Total Tasks**: 25
- **Phase 1 (Setup)**: 4 tasks (T001-T004) ✅ 已完成
- **Phase 2 (US1 - Header)**: 2 tasks (T005-T006) ✅ 已完成
- **Phase 3 (US2 - Responsive)**: 3 tasks (T007-T009) ✅ 已完成
- **Phase 4 (US3 - Footer)**: 1 task (T010) ✅ 已完成
- **Phase 5 (Integration)**: 4 tasks (T011-T014) ✅ 已完成
- **Phase 6 (US4 - TreeMenu)**: 6 tasks (T015-T020) ✅ 已完成
- **Phase 7 (US5 - UserMenu)**: 2 tasks (T021-T022) ✅ 已完成
- **Phase 8 (Sidebar 整合)**: 3 tasks (T023-T025) ✅ 已完成
- **Parallel Opportunities**: 多个任务可并行

---

## Bug Fixes

### BF001 - Sidebar 折叠状态不持久化 (2026-01-19)

**问题描述**：用户点击 Sidebar 折叠按钮后，刷新页面状态不保留，始终显示折叠状态。

**根因分析**：`Layout.tsx` 中有一个 useEffect 在 tablet 模式下每次组件挂载时都会强制设置 `sidebarCollapsed = true`，这会覆盖从 localStorage 恢复的用户偏好设置。

```tsx
// 问题代码
useEffect(() => {
  if (isTablet) {
    setSidebarCollapsed(true); // 每次挂载都会覆盖持久化状态
  }
}, [isTablet, setSidebarCollapsed]);
```

**解决方案**：移除 tablet 自动折叠逻辑，让 Sidebar 折叠状态完全由用户控制和 Zustand persist 中间件管理。

**修改文件**：

- `src/components/layout/Layout.tsx` - 移除 tablet 自动折叠的 useEffect

---

### BF002 - TreeMenu 图标不符合商户语义 (2026-01-20)

**问题描述**：TreeMenu 使用文件夹图标 (FolderOutlined) 表示树节点，但树形结构表示的是商户层级，图标语义不符。

**解决方案**：

- 父节点（有子节点）：使用 `ApartmentOutlined` 组织架构图标
- 叶子节点（商户）：使用 `ShopOutlined` 商店图标

**修改文件**：

- `src/components/layout/TreeMenu.tsx` - 更新图标逻辑

---

### BF003 - TreeMenu 和 UserMenu 样式不统一 (2026-01-20)

**问题描述**：TreeMenu 使用 Ant Design `Tree` 组件，UserMenu 使用 `Menu` 组件，导致两者视觉样式不统一。

**解决方案**：将 TreeMenu 从 `Tree` 组件改为 `Menu` 组件，使用 SubMenu 实现层级展开功能。

**修改文件**：

- `src/components/layout/TreeMenu.tsx` - 重构为使用 Menu 组件

---

## Phase 9: Dashboard 页面 (2026-01-20)

**Goal**: 点击 TreeMenu 节点时导航到 Dashboard 页面显示选中商户信息

- [x] T026 [US4] 创建 `src/pages/DashboardPage.tsx`：

  - 显示选中节点的详细信息（value, merchantId, id）
  - 使用 Ant Design Card 组件展示
  - 未选中节点时显示提示信息

- [x] T027 [US4] 更新 `src/router/routes.tsx`：

  - 添加 `/dashboard` 路由
  - 导入并配置 `DashboardPage` 组件

- [x] T028 [US4] 更新 `src/components/layout/TreeMenu.tsx`：
  - 导入 `useNavigate` hook
  - 点击节点时调用 `navigate('/dashboard')`
  - 同时更新选中状态 (`setSelectedNode`)

**Checkpoint**: TreeMenu 点击导航功能完成
