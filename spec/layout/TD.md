# Layout 模块 - 技术设计文档

> 版本: 1.0  
> 最后更新: 2026-01-20  
> 状态: ✅ 已实现

---

## 目录

1. [概述](#1-概述)
2. [架构设计](#2-架构设计)
3. [组件设计](#3-组件设计)
4. [状态管理](#4-状态管理)
5. [API 契约](#5-api-契约)
6. [响应式设计](#6-响应式设计)
7. [用户交互流程](#7-用户交互流程)
8. [安全性设计](#8-安全性设计)
9. [性能优化](#9-性能优化)
10. [测试策略](#10-测试策略)
11. [Bug 修复记录](#11-bug-修复记录)

---

## 1. 概述

### 1.1 模块简介

Layout 模块是 Dashboard 应用的核心框架组件，负责整体页面布局、导航结构和响应式适配。它采用 Ant Design Layout 组件体系，实现了商户层级树形菜单、静态功能菜单、头部导航和底部版权信息。

### 1.2 核心功能

| 功能模块 | 描述                                    |
| -------- | --------------------------------------- |
| Header   | 顶部导航栏，包含 Logo、面包屑、主题切换 |
| Sidebar  | 侧边栏，包含 TreeMenu 和 UserMenu       |
| TreeMenu | 商户层级树形菜单，支持动态加载子节点    |
| UserMenu | 静态功能菜单，支持路由跳转和外部链接    |
| Footer   | 底部版权信息                            |
| 响应式   | 移动端抽屉、平板/桌面端侧边栏折叠       |

### 1.3 设计原则

- **组件化**: 每个布局区域独立封装，便于维护和复用
- **响应式优先**: 移动端优先设计，向上适配大屏幕
- **状态持久化**: 侧边栏折叠状态、选中节点等通过 localStorage 持久化
- **懒加载**: TreeMenu 子节点按需加载，减少初始数据量

---

## 2. 架构设计

### 2.1 布局结构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Header (64px)                               │
│  ┌──────────┬───────────────────────────────────────┬──────────┐    │
│  │ Hamburger│         Breadcrumb (Desktop)          │  Theme   │    │
│  │  (Mobile)│                                       │ Switcher │    │
│  └──────────┴───────────────────────────────────────┴──────────┘    │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                       │
│   Sidebar    │                    Content                           │
│  ┌────────┐  │                   (Outlet)                           │
│  │TreeMenu│  │                                                       │
│  ├────────┤  │                                                       │
│  │Divider │  │                                                       │
│  ├────────┤  │                                                       │
│  │UserMenu│  │                                                       │
│  ├────────┤  │                                                       │
│  │Collapse│  │                                                       │
│  │ Button │  │                                                       │
│  └────────┘  │                                                       │
├──────────────┴──────────────────────────────────────────────────────┤
│                          Footer                                      │
│                 © 2026 Citcon. All rights reserved.                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 组件层次结构

```
src/components/layout/
├── Layout.tsx         # 主布局容器，整合所有布局组件
├── Header.tsx         # 顶部导航栏
├── Sidebar.tsx        # 侧边栏容器
├── TreeMenu.tsx       # 商户层级树形菜单
├── UserMenu.tsx       # 静态功能菜单
├── Footer.tsx         # 底部版权信息
├── AppBreadcrumb.tsx  # 面包屑导航
└── index.ts           # 统一导出
```

### 2.3 技术栈

| 技术           | 用途      |
| -------------- | --------- |
| React 18       | UI 框架   |
| Ant Design 5.x | UI 组件库 |
| Zustand        | 状态管理  |
| React Router 6 | 路由管理  |
| TypeScript     | 类型安全  |

---

## 3. 组件设计

### 3.1 Layout 组件

> 文件: `src/components/layout/Layout.tsx`

**职责**: 主布局容器，整合 Header、Sidebar、Content、Footer

**核心特性**:

- 集成空闲超时检测 (20 分钟)
- 响应式布局切换 (移动端 Drawer / 桌面端 Sider)
- 主题感知

```tsx
export const Layout: React.FC = () => {
  const { token, logout } = useAuthStore();
  const { sidebarDrawerOpen, setDrawerOpen } = useUIStore();
  const { isMobile } = useBreakpoint();

  // 空闲超时处理
  useIdleTimeout({
    timeout: 20 * 60 * 1000, // 20 分钟
    onIdle: handleIdle,
    enabled: !!token,
  });

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header />
      <AntLayout>
        {!isMobile && <Sidebar />}
        {isMobile && (
          <Drawer
            placement="left"
            open={sidebarDrawerOpen}
            onClose={handleDrawerClose}
          >
            <Sidebar inDrawer />
          </Drawer>
        )}
        <AntLayout>
          <Content>
            <Outlet />
          </Content>
          <Footer />
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};
```

### 3.2 Header 组件

> 文件: `src/components/layout/Header.tsx`

**职责**: 顶部导航栏

**UI 元素**:
| 元素 | 可见性 | 描述 |
|-----|--------|------|
| Hamburger 按钮 | 仅移动端 | 打开 Sidebar Drawer |
| Logo | 始终 | 显示 "Citcon" |
| Breadcrumb | 仅桌面端 | 显示当前路由路径 |
| ThemeSwitcher | 始终 | 切换亮色/暗色主题 |

```tsx
<AntHeader style={{ position: 'sticky', top: 0, zIndex: 100 }}>
  {isMobile && <Button icon={<MenuOutlined />} onClick={toggleDrawer} />}
  <Title level={4}>Citcon</Title>
  {!isMobile && <AppBreadcrumb />}
  <div style={{ flex: 1 }} />
  <ThemeSwitcher />
</AntHeader>
```

### 3.3 Sidebar 组件

> 文件: `src/components/layout/Sidebar.tsx`

**职责**: 侧边栏容器，包含 TreeMenu、UserMenu 和折叠按钮

**Props**:

```typescript
interface SidebarProps {
  inDrawer?: boolean; // 是否在 Drawer 中渲染 (移动端模式)
}
```

**布局结构**:

```
┌────────────────────┐
│     TreeMenu       │  <- 可滚动区域
│   (商户层级树)      │
├────────────────────┤
│     Divider        │
├────────────────────┤
│     UserMenu       │
│   (功能菜单)        │
├────────────────────┤
│   Collapse Button  │  <- 仅桌面端显示
└────────────────────┘
```

**折叠状态**:

- `inDrawer=true`: 始终展开 (移动端 Drawer 内)
- `inDrawer=false`: 由 `sidebarCollapsed` 状态控制

### 3.4 TreeMenu 组件

> 文件: `src/components/layout/TreeMenu.tsx`

**职责**: 渲染商户层级树形菜单，支持动态加载子节点

**核心特性**:

1. **动态加载**: 展开节点时按需请求子节点
2. **节点缓存**: 已加载的子节点缓存在 HierarchyStore
3. **Loading 状态**: 加载中显示 Spin 组件
4. **节点选中**: 点击节点导航到 Dashboard 页面
5. **Tooltip**: 鼠标悬停显示 merchantId

**节点图标规则**:
| 节点类型 | 图标 | 说明 |
|---------|------|------|
| 父节点 (有子节点) | `ApartmentOutlined` | 组织架构图标 |
| 叶子节点 (商户) | `ShopOutlined` | 商店图标 |

**节点 Key 生成规则**:

```typescript
function getNodeKey(node: HierarchyNode): string {
  return node.id ? `node-${node.id}` : `node-${node.value}`;
}
```

**交互流程**:

1. 点击节点名称 → `setSelectedNode(node)` → `navigate('/dashboard')`
2. 展开 SubMenu → 检查缓存 → 无缓存则调用 `fetchChildren(parentId, sessionId)`

### 3.5 UserMenu 组件

> 文件: `src/components/layout/UserMenu.tsx`

**职责**: 静态功能菜单，支持内部路由、外部链接和特殊操作

**菜单配置**:

```typescript
// src/config/userMenu.ts
export const USER_MENU_ITEMS: UserMenuItem[] = [
  {
    key: 'alltransactions',
    label: 'All Transactions Search',
    icon: 'SearchOutlined',
    path: '/alltransactions',
  },
  {
    key: 'accountsettings',
    label: 'Account Settings',
    icon: 'SettingOutlined',
    path: '/accountsettings',
  },
  {
    key: 'fraudengine',
    label: 'Fraud Engine',
    icon: 'SafetyOutlined',
    path: '/fraudengine',
  },
  {
    key: 'helpdesk',
    label: 'Citcon Help Desk',
    icon: 'QuestionCircleOutlined',
    href: 'http://baidu.com',
    target: '_blank',
  },
  { key: 'logout', label: 'Logout', icon: 'LogoutOutlined', action: 'logout' },
];
```

**操作类型处理**:
| 类型 | 处理方式 |
|-----|---------|
| 内部路由 (`path`) | `navigate(item.path)` |
| 外部链接 (`href`) | `window.open(item.href, '_blank')` |
| 特殊操作 (`action: 'logout'`) | `logout()` → `navigate('/login')` |

### 3.6 Footer 组件

> 文件: `src/components/layout/Footer.tsx`

**职责**: 底部版权信息

```tsx
export const Footer: React.FC = memo(() => (
  <AntFooter style={{ textAlign: 'center', padding: '16px 50px' }}>
    © 2026 Citcon. All rights reserved.
  </AntFooter>
));
```

**优化**: 使用 `React.memo` 避免不必要的重渲染

---

## 4. 状态管理

### 4.1 UI Store (uiStore)

> 文件: `src/stores/uiStore.ts`

**职责**: 管理 UI 状态，包括侧边栏折叠、Drawer 开关、选中节点、展开节点

```typescript
interface UIState {
  sidebarCollapsed: boolean; // 侧边栏折叠状态
  sidebarDrawerOpen: boolean; // 移动端 Drawer 开关
  selectedNode: HierarchyNode | null; // 当前选中的树节点
  expandedKeys: string[]; // 展开的树节点 keys

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setSelectedNode: (node: HierarchyNode | null) => void;
  setExpandedKeys: (keys: string[]) => void;
}
```

**持久化配置**:

```typescript
persist(
  (set) => ({ ... }),
  {
    name: 'ui-storage',
    partialize: (state) => ({
      sidebarCollapsed: state.sidebarCollapsed,
      selectedNode: state.selectedNode,
      expandedKeys: state.expandedKeys,
    }),
  }
)
```

**持久化字段**: `sidebarCollapsed`, `selectedNode`, `expandedKeys`

### 4.2 Hierarchy Store (hierarchyStore)

> 文件: `src/stores/hierarchyStore.ts`

**职责**: 管理商户层级树的子节点缓存和加载状态

```typescript
interface HierarchyState {
  childrenCache: Record<number, HierarchyNode[]>; // 子节点缓存 (key: parentId)
  loadingNodes: number[]; // 正在加载的节点 ID 列表

  // Actions
  fetchChildren: (
    parentId: number,
    sessionId: string,
    forceRefresh?: boolean,
  ) => Promise<void>;
  refreshChildren: (parentId: number, sessionId: string) => Promise<void>;
  invalidateCache: (parentId: number) => void;
  setChildren: (parentId: number, children: HierarchyNode[]) => void;
  hasChildren: (parentId: number) => boolean;
  getChildren: (parentId: number) => HierarchyNode[] | undefined;
  isLoading: (parentId: number) => boolean;
  clearCache: () => void;
}
```

**缓存策略**:

1. 首次展开节点时调用 API 获取子节点
2. 子节点存入 `childrenCache[parentId]`
3. 再次展开时直接从缓存读取
4. 可通过 `refreshChildren` 强制刷新

---

## 5. API 契约

### 5.1 获取子节点层级 API

**端点**: `POST /multilayer`

**请求头**:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:

```typescript
interface MultilayerRequest {
  parent_id: number; // 父节点 ID
  session_id: string; // 会话 ID (登录时获取)
}
```

**响应体**:

```typescript
interface MultilayerResponse {
  childrens: ChildrensData[];
  code: string; // '0' 表示成功
  msg: string;
}

interface ChildrensData {
  id: number;
  value: string; // 节点显示名称
  merchantId?: string; // 商户 ID (Tooltip 显示)
  hasAliDirect?: boolean; // 是否有支付宝直连
  hasMultiFundings?: boolean;
  settings?: { klarna_form?: boolean };
  children?: ChildrensData[]; // 子节点 (如有)
}
```

**数据转换**:

```typescript
function convertToHierarchyNode(data: ChildrensData): HierarchyNode {
  return {
    id: data.id,
    value: data.value,
    merchantId: data.merchantId,
    hasAliDirect: data.hasAliDirect,
    hasMultiFundings: data.hasMultiFundings,
    settings: data.settings,
    children: data.children ? [] : undefined, // 标记是否可展开
  };
}
```

---

## 6. 响应式设计

### 6.1 断点定义

> 文件: `src/hooks/useBreakpoint.ts`

```typescript
const BREAKPOINTS = {
  mobile: 768, // < 768px
  tablet: 1024, // 768px - 1023px
};

// 返回值
interface BreakpointState {
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1023px
  isDesktop: boolean; // >= 1024px
}
```

### 6.2 响应式行为

| 屏幕尺寸                | Sidebar 行为 | Header 行为         |
| ----------------------- | ------------ | ------------------- |
| **Mobile** (< 768px)    | Drawer 抽屉  | 显示 Hamburger 按钮 |
| **Tablet** (768-1023px) | Sider 可折叠 | 显示 Breadcrumb     |
| **Desktop** (≥ 1024px)  | Sider 展开   | 显示 Breadcrumb     |

### 6.3 Sider 宽度

| 状态 | 宽度  |
| ---- | ----- |
| 展开 | 200px |
| 折叠 | 80px  |

```tsx
<Sider
  collapsible
  collapsed={collapsed}
  collapsedWidth={80}
  width={200}
  trigger={null}
/>
```

---

## 7. 用户交互流程

### 7.1 移动端导航流程

```
用户点击 Hamburger 按钮
        │
        ▼
┌───────────────────┐
│ toggleDrawer()    │
│ sidebarDrawerOpen │
│     = true        │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Drawer 打开       │
│ 显示 TreeMenu +   │
│ UserMenu          │
└───────────────────┘
        │
        ▼
用户点击菜单项或 Drawer 外部
        │
        ▼
┌───────────────────┐
│ setDrawerOpen(    │
│   false)          │
└───────────────────┘
```

### 7.2 TreeMenu 节点展开流程

```
用户展开 SubMenu (父节点)
        │
        ▼
┌───────────────────────────────┐
│ handleOpenChange(openKeys)    │
│ 1. 计算新展开的 keys          │
│ 2. 检查 childrenCache         │
└───────────────────────────────┘
        │
        ├── 有缓存 ────► 直接展开, 渲染子节点
        │
        └── 无缓存
              │
              ▼
┌───────────────────────────────┐
│ fetchChildren(parentId,       │
│               sessionId)      │
│ 1. loadingNodes.push(parentId)│
│ 2. 调用 POST /multilayer      │
│ 3. 转换数据, 存入缓存          │
│ 4. loadingNodes.remove(...)   │
└───────────────────────────────┘
              │
              ▼
        渲染子节点
```

### 7.3 节点选中导航流程

```
用户点击节点名称 (非展开图标)
        │
        ▼
┌───────────────────────────────┐
│ handleLabelClick(node, e)     │
│ 1. e.stopPropagation()        │
│ 2. setSelectedNode(node)      │
│ 3. navigate('/dashboard',     │
│      { state: { timestamp } })│
└───────────────────────────────┘
        │
        ▼
Dashboard 页面加载
显示选中商户信息
```

---

## 8. 安全性设计

### 8.1 认证保护

Layout 组件通过 `RequireAuth` 高阶组件保护:

```tsx
// src/router/routes.tsx
{
  element: <RequireAuth><Layout /></RequireAuth>,
  children: [
    { path: '/dashboard', element: <DashboardPage /> },
    // ...
  ]
}
```

### 8.2 空闲超时

```tsx
// Layout.tsx
useIdleTimeout({
  timeout: 20 * 60 * 1000, // 20 分钟
  onIdle: () => {
    if (isLoggedIn) {
      logout();
    }
  },
  enabled: isLoggedIn,
});
```

### 8.3 外部链接安全

UserMenu 中的外部链接使用 `window.open`:

```tsx
window.open(item.href, '_blank');
```

**建议**: 添加 `rel="noopener noreferrer"` 防止 tabnabbing 攻击

### 8.4 API 请求认证

所有 API 请求通过 Axios 拦截器自动添加 Token:

```typescript
// src/services/api/axiosInstance.ts
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 9. 性能优化

### 9.1 组件优化

| 组件                      | 优化策略                 |
| ------------------------- | ------------------------ |
| Footer                    | `React.memo` 避免重渲染  |
| TreeMenu menuItems        | `useMemo` 缓存菜单项数组 |
| TreeMenu selectedKeys     | `useMemo` 缓存选中 keys  |
| Sidebar handleDrawerClose | `useCallback` 缓存回调   |

### 9.2 数据缓存

- **HierarchyStore**: 子节点缓存，避免重复请求
- **UIStore 持久化**: 避免每次刷新重置状态

### 9.3 代码分割

Layout 及其子路由通过 LazyPage 懒加载:

```tsx
const DashboardPage = LazyPage(() => import('@/pages/DashboardPage'));
```

### 9.4 按需加载

TreeMenu 子节点按需加载，减少初始数据量:

- 初始只加载第一层
- 展开时加载子节点
- 缓存已加载节点

---

## 10. 测试策略

### 10.1 单元测试

| 文件                     | 测试内容     |
| ------------------------ | ------------ |
| `useBreakpoint.test.ts`  | 断点检测逻辑 |
| `uiStore.test.ts`        | UI 状态管理  |
| `hierarchyStore.test.ts` | 层级缓存逻辑 |

### 10.2 组件测试

| 组件     | 测试场景                                |
| -------- | --------------------------------------- |
| Header   | Hamburger 按钮可见性、Breadcrumb 可见性 |
| Sidebar  | 折叠/展开切换、inDrawer 模式            |
| TreeMenu | 节点渲染、展开加载、选中高亮            |
| UserMenu | 菜单点击、路由跳转、外部链接、登出      |
| Layout   | 响应式切换、Drawer 开关                 |

### 10.3 集成测试

| 场景       | 验证点                             |
| ---------- | ---------------------------------- |
| 移动端导航 | Hamburger → Drawer → 菜单项 → 路由 |
| 桌面端导航 | TreeMenu → Dashboard               |
| 空闲超时   | 20分钟后自动登出                   |

---

## 11. Bug 修复记录

### BF001 - Sidebar 折叠状态不持久化 (2026-01-19)

**问题描述**: 用户点击 Sidebar 折叠按钮后，刷新页面状态不保留。

**根因分析**: Layout.tsx 中有 useEffect 在 tablet 模式下强制设置 `sidebarCollapsed = true`，覆盖了持久化状态。

**解决方案**: 移除 tablet 自动折叠逻辑，让状态完全由 Zustand persist 管理。

**修改文件**: `src/components/layout/Layout.tsx`

---

### BF002 - TreeMenu 图标不符合商户语义 (2026-01-20)

**问题描述**: TreeMenu 使用文件夹图标 (FolderOutlined)，语义不符合商户层级。

**解决方案**:

- 父节点: `ApartmentOutlined` (组织架构图标)
- 叶子节点: `ShopOutlined` (商店图标)

**修改文件**: `src/components/layout/TreeMenu.tsx`

---

### BF003 - TreeMenu 和 UserMenu 样式不统一 (2026-01-20)

**问题描述**: TreeMenu 使用 Tree 组件，UserMenu 使用 Menu 组件，视觉不一致。

**解决方案**: 将 TreeMenu 从 Tree 组件改为 Menu + SubMenu 实现。

**修改文件**: `src/components/layout/TreeMenu.tsx`

---

## 附录 A: 文件清单

| 文件路径                                  | 描述             |
| ----------------------------------------- | ---------------- |
| `src/components/layout/Layout.tsx`        | 主布局容器       |
| `src/components/layout/Header.tsx`        | 顶部导航栏       |
| `src/components/layout/Sidebar.tsx`       | 侧边栏容器       |
| `src/components/layout/TreeMenu.tsx`      | 商户层级树形菜单 |
| `src/components/layout/UserMenu.tsx`      | 静态功能菜单     |
| `src/components/layout/Footer.tsx`        | 底部版权信息     |
| `src/components/layout/AppBreadcrumb.tsx` | 面包屑导航       |
| `src/components/layout/index.ts`          | 统一导出         |
| `src/stores/uiStore.ts`                   | UI 状态管理      |
| `src/stores/hierarchyStore.ts`            | 层级数据缓存     |
| `src/hooks/useBreakpoint.ts`              | 响应式断点检测   |
| `src/config/userMenu.ts`                  | 静态菜单配置     |

---

## 附录 B: 依赖关系

```
Layout
├── Header
│   ├── AppBreadcrumb
│   ├── ThemeSwitcher
│   └── useBreakpoint
├── Sidebar
│   ├── TreeMenu
│   │   ├── useHierarchyStore
│   │   ├── useUIStore
│   │   └── useAuthStore
│   └── UserMenu
│       ├── userMenu config
│       └── useAuthStore
├── Footer
└── Hooks
    ├── useIdleTimeout
    └── useBreakpoint
```

---

## 附录 C: 任务完成状态

| Phase                      | 任务数 | 状态            |
| -------------------------- | ------ | --------------- |
| Phase 1 (Setup)            | 4      | ✅              |
| Phase 2 (US1 - Header)     | 2      | ✅              |
| Phase 3 (US2 - Responsive) | 3      | ✅              |
| Phase 4 (US3 - Footer)     | 1      | ✅              |
| Phase 5 (Integration)      | 4      | ✅              |
| Phase 6 (US4 - TreeMenu)   | 6      | ✅              |
| Phase 7 (US5 - UserMenu)   | 2      | ✅              |
| Phase 8 (Sidebar 整合)     | 3      | ✅              |
| Phase 9 (Dashboard 页面)   | 3      | ✅              |
| **总计**                   | **28** | **✅ 全部完成** |
