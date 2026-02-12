# Layout 模块接口契约

> **实现状态**: ✅ 已完成
> **最后更新**: 2026-02-03
> **相关文件**: `src/types/hierarchy.ts`, `src/types/auth.ts`, `src/services/api/hierarchyApi.ts`, `src/stores/hierarchyStore.ts`, `src/stores/uiStore.ts`

## 类型定义

```typescript
// 层级节点设置
export interface HierarchyNodeSettings {
  isCollapsedOnInit?: string;
}

// 子层级节点的 children 数组项
export interface ChildrenArray {
  value: string;
}

// 子层级节点（/multilayer 返回的数据结构）
export interface ChildrensData {
  id: number;
  value: string;
  merchantId: string;
  hasAliDirect: number;
  hasMultiFundings: number;
  settings?: HierarchyNodeSettings;
  // 如果有 children 属性，表示该节点可以继续展开
  children?: ChildrenArray[];
}

// 层级节点（用于 TreeMenu 和 Store）
export interface HierarchyNode {
  id?: number;
  value: string;
  merchantId?: string;
  hasAliDirect?: number;
  hasMultiFundings?: number;
  settings?: HierarchyNodeSettings;
  children?: HierarchyNode[];
}

// /multilayer 响应
export interface MultilayerResponse {
  // 响应状态码 (200 = 成功)
  code: number;
  // 错误消息
  message?: string;
  // 下一层数据列表
  childrens_data: ChildrensData[];
}

// /multilayer 请求参数
export interface MultilayerRequest {
  // 父节点 ID
  parent_id: number;
  // 当前会话 ID
  session_id: string;
}
```

## API 接口

### POST /multilayer

**描述**: 获取指定层级节点的子节点列表

**请求**:

```typescript
// Content-Type: application/json
{
  "parent_id": 123,
  "session_id": "abc123..."
}
```

**成功响应** (code: 200):

```typescript
{
  "code": 200,
  "childrens_data": [
    {
      "id": 456,
      "value": "Merchant A",
      "merchantId": "M001",
      "hasAliDirect": 0,
      "hasMultiFundings": 1,
      "children": [{ "value": "子节点" }]  // 有此属性表示可继续展开
    },
    {
      "id": 789,
      "value": "Merchant B",
      "merchantId": "M002",
      "hasAliDirect": 1,
      "hasMultiFundings": 0
      // 无 children 属性表示叶子节点
    }
  ]
}
```

**错误响应**:

```typescript
{
  "code": 500,
  "message": "Failed to fetch children",
  "childrens_data": []
}
```

## Hierarchy Store 实现

> **实现状态**: ✅ 已完成

```typescript
export interface HierarchyState {
  /**
   * 子节点缓存，按父节点 ID 索引
   */
  childrenCache: Record<number, HierarchyNode[]>;

  /**
   * 正在加载的节点 ID 列表
   */
  loadingNodes: number[];

  /**
   * 获取子节点（支持缓存）
   */
  fetchChildren: (
    parentId: number,
    sessionId: string,
    forceRefresh?: boolean,
  ) => Promise<void>;

  /**
   * 强制刷新子节点
   */
  refreshChildren: (parentId: number, sessionId: string) => Promise<void>;

  /**
   * 使指定节点的缓存失效
   */
  invalidateCache: (parentId: number) => void;

  /**
   * 手动设置子节点
   */
  setChildren: (parentId: number, children: HierarchyNode[]) => void;

  /**
   * 检查是否有缓存
   */
  hasChildren: (parentId: number) => boolean;

  /**
   * 获取缓存的子节点
   */
  getChildren: (parentId: number) => HierarchyNode[] | undefined;

  /**
   * 检查节点是否正在加载
   */
  isLoading: (parentId: number) => boolean;

  /**
   * 清除所有缓存
   */
  clearCache: () => void;
}
```

**持久化配置**：

- 存储 key: `hierarchy-storage`
- 持久化字段: `childrenCache`

## UI Store 实现

> **实现状态**: ✅ 已完成

```typescript
export interface UIState {
  // Sidebar 状态
  sidebarCollapsed: boolean;
  sidebarDrawerOpen: boolean;

  // TreeMenu 选中节点
  selectedNode: HierarchyNode | null;

  // TreeMenu 展开的节点 keys
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

- 存储 key: `ui-storage`
- 持久化字段: `sidebarCollapsed`, `selectedNode`, `expandedKeys`

## 静态路由菜单配置

```typescript
export interface UserMenuItem {
  key: string;
  label: string;
  icon: string; // Ant Design 图标名称
  path?: string; // 内部路由
  href?: string; // 外部链接
  target?: '_blank' | '_self';
  action?: 'logout'; // 特殊操作
}

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
  {
    key: 'logout',
    label: 'Logout',
    icon: 'LogoutOutlined',
    action: 'logout',
  },
];
```
