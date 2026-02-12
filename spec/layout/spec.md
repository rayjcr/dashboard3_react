# Feature Specification: Layout 组件

> 版本: 1.1  
> 最后更新: 2026-02-10  
> 状态: ✅ 已实现  
> 技术设计: [TD.md](./TD.md)

## 概述

Dashboard 主布局组件，采用经典管理后台布局模式：顶部导航栏 + 左侧可折叠菜单 + 内容区 + 底部。整体采用**简洁现代（类似 Ant Design Pro）的整体风格**风格，支持完整响应式设计。

### 核心功能

| 功能模块   | 描述                                    | 状态 |
| ---------- | --------------------------------------- | ---- |
| Header     | 顶部导航栏，包含 Logo、面包屑、主题切换 | ✅   |
| Sidebar    | 侧边栏，包含 TreeMenu 和 UserMenu       | ✅   |
| TreeMenu   | 商户层级树形菜单，支持动态加载子节点    | ✅   |
| UserMenu   | 静态功能菜单，支持路由跳转和外部链接    | ✅   |
| Footer     | 底部版权信息                            | ✅   |
| 响应式布局 | 移动端抽屉、平板/桌面端侧边栏折叠       | ✅   |
| 主题切换   | 支持亮色/暗色主题切换                   | ✅   |
| 空闲超时   | 20分钟无操作自动登出                    | ✅   |

---

## 用户故事

### US1: 顶部导航栏 (Header)

**作为** 已登录用户  
**我希望** 看到固定在顶部的导航栏，包含 Logo 和面包屑导航  
**以便于** 快速了解当前位置并导航到其他页面

**验收标准:**

- [x] Header 固定在顶部，滚动时不消失 (`position: sticky`)
- [x] 左侧显示 "Citcon" Logo/公司名称
- [x] Logo 右侧显示面包屑导航 (Breadcrumb)，反映当前页面层级
- [x] Header 高度约 64px
- [x] 简洁现代（类似 Ant Design Pro）的整体风格
- [x] 右侧显示主题切换按钮 (ThemeSwitcher)
- [x] 移动端显示 Hamburger 菜单按钮，桌面端隐藏

---

### US2: 响应式布局

**作为** 移动端用户  
**我希望** 在小屏幕设备上也能正常使用 Dashboard  
**以便于** 随时随地查看数据

**验收标准:**

- [x] 桌面端 (≥1024px): 标准布局，Sidebar 始终可见
- [x] 平板端 (768px - 1023px): Sidebar 可手动折叠/展开
- [x] 移动端 (<768px):
  - [x] Sidebar 变为抽屉模式 (Drawer)
  - [x] Header 显示汉堡菜单图标 (☰)
  - [x] 点击汉堡图标打开/关闭 Sidebar 抽屉
  - [x] 抽屉有遮罩层，点击遮罩关闭抽屉
- [x] 切换设备尺寸时自动关闭 Drawer（防止状态残留）

**断点定义:**

| 断点名称 | 尺寸范围       | 行为                   |
| -------- | -------------- | ---------------------- |
| Mobile   | < 768px        | Drawer 抽屉模式        |
| Tablet   | 768px - 1023px | Sider 可折叠           |
| Desktop  | ≥ 1024px       | Sider 展开，可手动折叠 |

---

### US3: Footer

**作为** 已登录用户  
**我希望** 页面底部显示版权信息  
**以便于** 了解产品归属

**验收标准:**

- [x] Footer 显示简单版权信息: `© 2026 Citcon. All rights reserved.`
- [x] Footer 固定在内容区底部（内容不足时贴底，内容超出时随内容滚动）
- [x] 简洁现代（类似 Ant Design Pro）的整体风格
- [x] 使用 `React.memo` 优化性能，避免不必要重渲染

---

## 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  Header (固定顶部, 64px)                                      │
│  ┌──────────┬──────────────────────────────────────────────┐│
│  │  Logo    │  Breadcrumb: Home > Merchants > Detail       ││
│  └──────────┴──────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌─────────────────────────────────────────────┐│
│ │ Sidebar  │ │  Main Content Area                          ││
│ │ (256px)  │ │                                             ││
│ │          │ │  <Outlet />                                 ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ │          │ │                                             ││
│ └──────────┘ └─────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Footer: © 2026 Citcon. All rights reserved.                │
└─────────────────────────────────────────────────────────────┘
```

---

## 组件拆分

| 组件       | 路径                                 | 职责                                       |
| ---------- | ------------------------------------ | ------------------------------------------ |
| `Layout`   | `src/components/layout/Layout.tsx`   | 主布局容器，组合 Header/Sidebar/Footer     |
| `Header`   | `src/components/layout/Header.tsx`   | 顶部导航：Logo + Breadcrumb                |
| `Sidebar`  | `src/components/layout/Sidebar.tsx`  | 侧边栏容器：TreeMenu + UserMenu + 折叠按钮 |
| `TreeMenu` | `src/components/layout/TreeMenu.tsx` | 动态树形菜单：商户/层级选择                |
| `UserMenu` | `src/components/layout/UserMenu.tsx` | 静态用户菜单：功能导航 + 退出登录          |
| `Footer`   | `src/components/layout/Footer.tsx`   | 底部版权信息                               |

---

## Sidebar 详细需求

### US4: 动态树形菜单 (TreeMenu)

**作为** 已登录用户  
**我希望** 在侧边栏看到商户/层级的树形结构，可以展开查看子层级  
**以便于** 快速切换和选择要查看的商户

**验收标准:**

- [x] 树形菜单显示在 Sidebar 上部
- [x] 初始数据来源：登录响应 `LoginResponse.child` 作为顶层节点
- [x] 节点显示 `value` 字段内容
- [x] 鼠标悬停节点时，Tooltip 显示 `merchantId`
- [x] 如果节点有 `children` 属性（数组），显示展开图标
- [x] 点击展开图标：调用 `/api/multilayer` 接口加载子节点
  - 请求方式：POST
  - 参数：`{ parent_id: 节点id, session_id: 当前会话id }`
  - 响应：`childrens` 数组包含子节点列表
- [x] 子节点如有 `children` 属性，可继续展开（递归加载）
- [x] 点击节点名称：
  - [x] 高亮选中该节点
  - [x] 将节点信息存储到全局状态 (UIStore.selectedNode)
  - [x] 导航到 Dashboard 页面 (`navigate('/dashboard')`)
- [x] 加载中显示 Spin loading 状态
- [x] 加载失败显示 Toast 错误消息 (`message.error`)
- [x] 展开/折叠状态刷新后保持 (持久化到 localStorage)
- [x] 已加载的子节点缓存在 HierarchyStore，避免重复请求

**节点图标规则:**

| 节点类型          | 图标                | 说明         |
| ----------------- | ------------------- | ------------ |
| 父节点 (有子节点) | `ApartmentOutlined` | 组织架构图标 |
| 叶子节点 (商户)   | `ShopOutlined`      | 商店图标     |

---

### US5: 静态用户菜单 (UserMenu)

**作为** 已登录用户  
**我希望** 在侧边栏快速访问常用功能页面  
**以便于** 高效完成日常操作

**验收标准:**

- [x] 用户菜单显示在 Sidebar 下部（TreeMenu 下方，用分隔线分开）
- [x] 菜单项列表：

| 菜单项                  | 图标                   | 路由/行为                                     |
| ----------------------- | ---------------------- | --------------------------------------------- |
| All Transactions Search | SearchOutlined         | `/alltransactions`                            |
| Account Settings        | SettingOutlined        | `/accountsettings`                            |
| Fraud Engine            | SafetyOutlined         | `/fraudengine`                                |
| Citcon Help Desk        | QuestionCircleOutlined | 新窗口打开外部链接 (带 `noopener,noreferrer`) |
| Logout                  | LogoutOutlined         | 调用 `logout()` 方法，跳转到 `/login`         |

- [x] 当前路由对应的菜单项高亮显示
- [x] 菜单项支持折叠状态（只显示图标）
- [x] 点击菜单项时清除 TreeMenu 选中状态 (`setSelectedNode(null)`)
- [x] 外部链接使用 `noopener,noreferrer` 防止 tabnabbing 攻击
- [x] Logout 显示成功提示消息 (`message.success`)

---

### US6: 空闲超时自动登出

**作为** 安全意识用户  
**我希望** 长时间不操作后自动登出  
**以便于** 保护账户安全

**验收标准:**

- [x] 用户登录后开始检测空闲时间
- [x] 20 分钟无操作自动调用 `logout()` 退出登录
- [x] 检测的用户活动包括：鼠标移动、键盘输入、点击、滚动
- [x] 未登录状态不启用空闲检测
- [x] 使用 `useIdleTimeout` 自定义 Hook 实现

---

### US7: 主题切换

**作为** 用户  
**我希望** 能够切换亮色/暗色主题  
**以便于** 在不同环境下舒适地使用应用

**验收标准:**

- [x] Header 右侧显示主题切换按钮 (ThemeSwitcher)
- [x] 点击切换亮色/暗色主题
- [x] 主题状态持久化到 localStorage
- [x] 多标签页同步主题状态

---

## 状态管理

> **实现状态**: ✅ 已完成  
> **相关文件**: `src/stores/uiStore.ts`, `src/stores/hierarchyStore.ts`

### UI Store (`src/stores/uiStore.ts`)

管理 UI 状态，包括侧边栏折叠、Drawer 开关、选中节点、展开节点。

```typescript
interface UIState {
  // Sidebar
  sidebarCollapsed: boolean; // 侧边栏折叠状态
  sidebarDrawerOpen: boolean; // 移动端抽屉状态

  // TreeMenu - 选中的节点
  selectedNode: HierarchyNode | null;

  // TreeMenu - 展开的节点 keys
  expandedKeys: string[];

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setSelectedNode: (node: HierarchyNode | null) => void;
  setExpandedKeys: (keys: string[]) => void;
}
```

**持久化配置**：

- 使用 Zustand `persist` 中间件
- 存储 key: `ui-storage`
- 持久化字段: `sidebarCollapsed`, `selectedNode`, `expandedKeys`
- 多标签页自动同步

### Hierarchy Store (`src/stores/hierarchyStore.ts`)

管理商户层级树的子节点缓存和加载状态。

```typescript
interface HierarchyState {
  // 动态加载的子节点缓存 (key: parent_id, value: children)
  childrenCache: Record<number, HierarchyNode[]>;

  // 加载状态 (当前正在加载的节点 ID 列表)
  loadingNodes: number[];

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

**缓存策略**：

1. 首次展开节点时调用 API 获取子节点
2. 子节点存入 `childrenCache[parentId]`
3. 再次展开时直接从缓存读取
4. 可通过 `refreshChildren` 强制刷新

## 组件文件清单

| 组件            | 路径                                      | 职责                                        | 状态 |
| --------------- | ----------------------------------------- | ------------------------------------------- | ---- |
| `Layout`        | `src/components/layout/Layout.tsx`        | 主布局容器，组合 Header/Sidebar/Footer      | ✅   |
| `Header`        | `src/components/layout/Header.tsx`        | 顶部导航：Logo + Breadcrumb + ThemeSwitcher | ✅   |
| `Sidebar`       | `src/components/layout/Sidebar.tsx`       | 侧边栏容器：TreeMenu + UserMenu + 折叠按钮  | ✅   |
| `TreeMenu`      | `src/components/layout/TreeMenu.tsx`      | 动态树形菜单：商户/层级选择                 | ✅   |
| `UserMenu`      | `src/components/layout/UserMenu.tsx`      | 静态用户菜单：功能导航 + 退出登录           | ✅   |
| `Footer`        | `src/components/layout/Footer.tsx`        | 底部版权信息                                | ✅   |
| `AppBreadcrumb` | `src/components/layout/AppBreadcrumb.tsx` | 面包屑导航                                  | ✅   |
| `index.ts`      | `src/components/layout/index.ts`          | 统一导出                                    | ✅   |

---

## 技术实现建议

### Ant Design 组件使用

- `Layout`, `Layout.Header`, `Layout.Sider`, `Layout.Content`, `Layout.Footer`
- `Breadcrumb`
- `Drawer` (移动端 Sidebar)
- `Button` (折叠按钮)

### AntDesign 默认主题

使用 Ant Design 5.x 默认主题，无需额外配置暗色或自定义主题。

```tsx
// src/App.tsx
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff', // 主色调（可选，默认即此值）
      borderRadius: 6, // 圆角（可选）
    },
  }}
>
  <App />
</ConfigProvider>;
```

**主题特点：**

- 浅色背景 (`#fff` / `#f5f5f5`)
- 默认蓝色主色调 (`#1890ff`)
- 标准 Ant Design 组件样式
- Header/Sider 使用组件默认颜色或自定义深色背景 (`#001529`)

### Vite 开发服务器配置

> **配置文件**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // 监听所有地址，包括局域网 IP
    port: 5173,
  },
});
```

````

**配置说明：**

| 配置项        | 值     | 说明                                                         |
| ------------- | ------ | ------------------------------------------------------------ |
| `server.host` | `true` | 监听所有网络接口，允许通过局域网 IP 访问（如 `192.168.x.x`） |
| `server.port` | `5173` | 开发服务器端口，若被占用会自动切换到下一个可用端口           |

**访问地址：**

- 本地访问: `http://localhost:5173/`
- 局域网访问: `http://192.168.x.x:5173/` （便于移动端调试）

### 响应式断点

```css
/* Tailwind 默认断点 */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
````

---

## 依赖

- **React Router**: 面包屑需要根据当前路由生成

---

## 非功能性需求

- 折叠动画时长: 200-300ms
- Sidebar 宽度过渡平滑
- 移动端抽屉有遮罩层 (backdrop)

---

## 安全性需求

| 安全措施     | 描述                                             | 状态 |
| ------------ | ------------------------------------------------ | ---- |
| 认证保护     | Layout 通过 `RequireAuth` 组件保护，未登录重定向 | ✅   |
| 空闲超时     | 20 分钟无操作自动登出                            | ✅   |
| 外部链接安全 | 使用 `noopener,noreferrer` 防止 tabnabbing 攻击  | ✅   |
| API 请求认证 | Axios 拦截器自动添加 Bearer Token                | ✅   |

---

## 性能优化

| 优化策略     | 实现方式                         | 状态 |
| ------------ | -------------------------------- | ---- |
| 组件 Memo    | Footer 使用 `React.memo`         | ✅   |
| useMemo 缓存 | TreeMenu menuItems, selectedKeys | ✅   |
| useCallback  | Sidebar handleDrawerClose 等回调 | ✅   |
| 数据缓存     | HierarchyStore 缓存已加载子节点  | ✅   |
| 状态持久化   | UIStore 持久化避免刷新重置       | ✅   |
| 代码分割     | 子路由页面通过 LazyPage 懒加载   | ✅   |
| 按需加载     | TreeMenu 子节点展开时才加载      | ✅   |

---

## 已知问题与修复

### BF001 - Sidebar 折叠状态不持久化 (2026-01-19)

**问题**: 刷新页面后 Sidebar 折叠状态不保留  
**原因**: tablet 模式下 useEffect 强制设置 `sidebarCollapsed = true`  
**修复**: 移除自动折叠逻辑，由 Zustand persist 管理

### BF002 - TreeMenu 图标不符合商户语义 (2026-01-20)

**问题**: 使用文件夹图标 (FolderOutlined)，语义不符  
**修复**: 父节点用 `ApartmentOutlined`，叶子节点用 `ShopOutlined`

### BF003 - TreeMenu 和 UserMenu 样式不统一 (2026-01-20)

**问题**: TreeMenu 用 Tree 组件，UserMenu 用 Menu 组件，视觉不一致  
**修复**: 将 TreeMenu 改为使用 Menu + SubMenu 实现

---

## 相关文档

- [技术设计文档 (TD.md)](./TD.md) - 详细架构、组件设计、交互流程
- [API 契约 (contracts.md)](./contracts.md) - API 接口定义
- [实现计划 (plan.md)](./plan.md) - 实现步骤
- [任务清单 (tasks.md)](./tasks.md) - 任务分解与状态
