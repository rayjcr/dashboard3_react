# 实施计划 - Layout 组件

本计划概述了根据 `spec/layout/spec.md` 实现 Dashboard 布局组件的步骤。

---

## 用户故事 1：顶部导航栏 (Header)

### 1. 创建面包屑导航组件

- [ ] 创建 `src/components/layout/AppBreadcrumb.tsx`：
  - [ ] 使用 Ant Design `Breadcrumb` 组件
  - [ ] 根据当前路由动态生成面包屑
  - [ ] 使用 `react-router-dom` 的 `useLocation`
  - [ ] 路由路径映射为面包屑项，支持点击跳转

### 2. 更新 Header 组件

- [ ] 更新 `src/components/layout/Header.tsx`：
  - [ ] 使用 Ant Design `Layout.Header` 组件
  - [ ] 固定顶部 (`position: sticky`, `top: 0`, `z-index: 100`)
  - [ ] 高度 64px
  - [ ] 左侧显示 "Citcon" Logo
  - [ ] Logo 右侧显示 `<AppBreadcrumb />`
  - [ ] 移动端 (<768px) 显示汉堡菜单图标，点击触发 Drawer 打开

---

## 用户故事 2：响应式布局

### 1. 创建响应式 Hook

- [ ] 创建 `src/hooks/useBreakpoint.ts`：
  - [ ] 使用 `window.matchMedia` 或 `resize` 事件检测屏幕尺寸
  - [ ] 返回 `{ isMobile, isTablet, isDesktop }` 状态
  - [ ] 断点：mobile < 768px, tablet 768-1023px, desktop ≥ 1024px

### 2. 创建 UI 状态管理

- [ ] 创建 `src/types/ui.ts`：

  - [ ] 定义 `UIState` 接口

- [ ] 创建 `src/stores/uiStore.ts`：

  - [ ] `sidebarCollapsed: boolean` - Sidebar 折叠状态
  - [ ] `sidebarDrawerOpen: boolean` - 移动端抽屉状态
  - [ ] Actions: `toggleSidebar`, `setSidebarCollapsed`, `toggleDrawer`, `setDrawerOpen`
  - [ ] 使用 `persist` 中间件持久化 `sidebarCollapsed`

- [ ] 更新 `src/stores/index.ts`：导出 `useUIStore`

### 3. 创建 Sidebar 组件

- [ ] 创建 `src/components/layout/Sidebar.tsx`：
  - [ ] 使用 Ant Design `Layout.Sider` 组件
  - [ ] 从 `useUIStore` 获取 `sidebarCollapsed` 状态
  - [ ] 展开宽度 256px，折叠宽度 80px
  - [ ] 底部添加折叠按钮 (`<<` / `>>` 图标)
  - [ ] 过渡动画 (`transition: width 0.2s`)

### 4. 更新主布局组件

- [ ] 更新 `src/components/layout/Layout.tsx`：
  - [ ] 使用 `useBreakpoint` 检测屏幕尺寸
  - [ ] 桌面端/平板端 (≥768px)：正常渲染 `<Sidebar />`
  - [ ] 移动端 (<768px)：使用 Ant Design `Drawer` 包裹 Sidebar 内容
    - [ ] Drawer 从左侧滑出，有遮罩层
    - [ ] 点击遮罩关闭 Drawer (`onClose` → `setDrawerOpen(false)`)
  - [ ] Sidebar 折叠状态完全由用户控制，通过 persist 中间件持久化
  - [ ] 不自动折叠 Sidebar（避免覆盖用户的持久化偏好）
  - [ ] 保留现有 idle timeout 逻辑

### 5. Header 响应式适配

- [ ] 更新 `src/components/layout/Header.tsx`：
  - [ ] 移动端：左侧显示汉堡图标 (`MenuOutlined`)
  - [ ] 点击汉堡图标触发 `toggleDrawer()`

---

## 用户故事 3：Footer

### 1. 更新 Footer 组件

- [ ] 更新 `src/components/layout/Footer.tsx`：
  - [ ] 使用 Ant Design `Layout.Footer` 组件
  - [ ] 显示 `© 2026 Citcon. All rights reserved.`
  - [ ] 文字居中对齐
  - [ ] 使用默认主题样式

---

## 用户故事 4：动态树形菜单 (TreeMenu)

### 1. 创建类型定义

- [ ] 更新 `src/types/hierarchy.ts`：
  - [ ] 定义 `MultilayerRequest` 接口
  - [ ] 定义 `MultilayerResponse` 接口
  - [ ] 定义 `ChildrensData` 接口

### 2. 创建 API 服务

- [ ] 创建 `src/services/api/hierarchyApi.ts`：
  - [ ] 实现 `fetchMultilayer(parentId, sessionId)` 方法
  - [ ] POST `/multilayer`
  - [ ] 返回 `MultilayerResponse`

### 3. 更新状态管理

- [ ] 更新 `src/stores/uiStore.ts`：

  - [ ] 添加 `selectedNode: HierarchyNode | null`
  - [ ] 添加 `expandedKeys: string[]`
  - [ ] 添加 `setSelectedNode(node)` action
  - [ ] 添加 `setExpandedKeys(keys)` action
  - [ ] 持久化 `selectedNode` 和 `expandedKeys`

- [ ] 创建 `src/stores/hierarchyStore.ts`：
  - [ ] `childrenCache: Record<number, HierarchyNode[]>` - 子节点缓存
  - [ ] `loadingNodes: number[]` - 加载中的节点 ID
  - [ ] `fetchChildren(parentId, sessionId)` - 加载子节点
  - [ ] 持久化 `childrenCache`

### 4. 创建 TreeMenu 组件

- [ ] 创建 `src/components/layout/TreeMenu.tsx`：
  - [ ] 使用 Ant Design `Tree` 组件
  - [ ] 从 `authStore` 获取初始数据 (`hierarchyTree`)
  - [ ] 从 `uiStore` 获取选中节点和展开状态
  - [ ] 实现异步加载子节点 (`loadData` prop)
  - [ ] 节点显示 `value` 字段
  - [ ] 鼠标悬停显示 `merchantId` (Tooltip)
  - [ ] 点击节点：选中高亮 + 存储到全局状态
  - [ ] 加载中显示 Spin
  - [ ] 加载失败显示 Toast

---

## 用户故事 5：静态用户菜单 (UserMenu)

### 1. 创建菜单配置

- [ ] 创建 `src/config/userMenu.ts`：
  - [ ] 定义 `UserMenuItem` 接口
  - [ ] 导出 `USER_MENU_ITEMS` 配置数组

### 2. 创建 UserMenu 组件

- [ ] 创建 `src/components/layout/UserMenu.tsx`：
  - [ ] 使用 Ant Design `Menu` 组件
  - [ ] 渲染静态菜单项列表
  - [ ] 使用对应图标 (SearchOutlined, SettingOutlined 等)
  - [ ] 处理内部路由跳转 (`useNavigate`)
  - [ ] 处理外部链接跳转 (`window.open`)
  - [ ] 处理 Logout 操作 (调用 `logout()` 后跳转 `/login`)
  - [ ] 当前路由高亮 (`useLocation`)
  - [ ] 支持折叠状态（只显示图标）

---

## 整合 Sidebar

### 1. 更新 Sidebar 组件

- [ ] 更新 `src/components/layout/Sidebar.tsx`：
  - [ ] 上部渲染 `<TreeMenu />`
  - [ ] 添加分隔线 `<Divider />`
  - [ ] 下部渲染 `<UserMenu />`
  - [ ] 底部保留折叠按钮
  - [ ] 支持折叠状态下的显示

### 2. 更新导出

- [ ] 更新 `src/components/layout/index.ts`：
  - [ ] 导出 `TreeMenu`, `UserMenu`

---

## 主布局整合

### 1. 更新 Layout 组件结构

- [ ] 更新 `src/components/layout/Layout.tsx`：
  - [ ] 使用 Ant Design `Layout` 组件结构：
    ```tsx
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sider /> {/* 桌面端 */}
        {/* 或 Drawer 包裹 Sidebar 内容（移动端） */}
        <Layout>
          <Content>
            <Outlet />
          </Content>
          <Footer />
        </Layout>
      </Layout>
    </Layout>
    ```

### 2. 导出更新

- [ ] 更新 `src/components/layout/index.ts`：
  - [ ] 导出所有布局组件：`Layout`, `Header`, `Sidebar`, `Footer`, `AppBreadcrumb`, `TreeMenu`, `UserMenu`

---

## 主题配置

### 1. 全局主题配置

- [ ] 更新 `src/App.tsx`：
  - [ ] 使用 `ConfigProvider` 包裹应用
  - [ ] 使用 Ant Design 5.x 默认主题
  - [ ] 可选配置主色调 `colorPrimary: '#1890ff'`

---

## 测试与验证

- [ ] **功能测试**：
  - [ ] Header Logo 和面包屑正确显示
  - [ ] Sidebar 折叠/展开功能正常，状态持久化
  - [ ] TreeMenu：
    - [ ] 初始加载顶层节点
    - [ ] 点击展开加载子节点
    - [ ] 选中节点高亮，状态持久化
    - [ ] 鼠标悬停显示 merchantId
    - [ ] 加载失败 Toast 提示
    - [x] 点击节点导航到 `/dashboard` 页面
  - [ ] UserMenu：
    - [ ] 内部路由跳转正常
    - [ ] 外部链接新窗口打开
    - [ ] Logout 功能正常
    - [ ] 当前路由高亮
  - [ ] 响应式：桌面端 Sidebar 可见，移动端抽屉模式正常工作
  - [ ] Footer 显示正确
  - [ ] 20 分钟 idle timeout 功能正常

---

## Dashboard 页面

### 1. 创建 Dashboard 页面

- [x] 创建 `src/pages/DashboardPage.tsx`：
  - [x] 显示选中商户/节点的详细信息
  - [x] 使用 Ant Design Card 组件
  - [x] 显示 value、merchantId、id 字段
  - [x] 未选中时显示提示信息

### 2. 配置路由

- [x] 更新 `src/router/routes.tsx`：
  - [x] 导入 `DashboardPage`
  - [x] 添加 `/dashboard` 路由配置

### 3. TreeMenu 导航功能

- [x] 更新 `src/components/layout/TreeMenu.tsx`：
  - [x] 导入 `useNavigate` hook
  - [x] 点击节点时导航到 `/dashboard`
  - [x] 同时更新选中状态

---

## Bug 修复记录

### BF001 - Sidebar 折叠状态不持久化 (2026-01-19)

**问题**：刷新页面后 Sidebar 折叠状态不保留

**原因**：`Layout.tsx` 中 tablet 模式自动折叠覆盖了持久化状态

**修复**：移除 tablet 自动折叠逻辑

### BF002 - TreeMenu 图标语义不符 (2026-01-20)

**问题**：使用文件夹图标表示商户层级，语义不符

**修复**：

- 父节点：`ApartmentOutlined` 组织架构图标
- 叶子节点：`ShopOutlined` 商店图标

### BF003 - TreeMenu 和 UserMenu 样式不统一 (2026-01-20)

**问题**：TreeMenu 使用 Tree 组件，UserMenu 使用 Menu 组件，样式不一致

**修复**：将 TreeMenu 重构为使用 Menu 组件
