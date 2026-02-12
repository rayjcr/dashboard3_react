import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Tooltip, Spin, message } from 'antd';
import type { MenuProps } from 'antd';
import { ShopOutlined, ApartmentOutlined } from '@ant-design/icons';
import {
  useAuthStore,
  useUIStore,
  useHierarchyStore,
  useThemeStore,
} from '@/stores';
import type { HierarchyNode } from '@/types/auth';
import { getTheme } from '@/types/theme';

interface TreeMenuProps {
  /**
   * Whether the sidebar is collapsed
   */
  collapsed?: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Generate a unique key for a tree node
 */
function getNodeKey(node: HierarchyNode): string {
  return node.id ? `node-${node.id}` : `node-${node.value}`;
}

export const TreeMenu: React.FC<TreeMenuProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const { hierarchyTree, sessionId } = useAuthStore();
  const { selectedNode, expandedKeys, setSelectedNode, setExpandedKeys } =
    useUIStore();
  const { childrenCache, loadingNodes, fetchChildren } = useHierarchyStore();
  const { currentTheme } = useThemeStore();
  const theme = getTheme(currentTheme);
  const isDark = currentTheme === 'dark';

  // Handle label click - navigate to dashboard and select node
  const handleLabelClick = useCallback(
    (node: HierarchyNode, e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent submenu toggle
      setSelectedNode(node);
      // Pass timestamp as state to force data reload on Dashboard
      navigate('/dashboard', { state: { timestamp: Date.now() } });
    },
    [setSelectedNode, navigate],
  );

  /**
   * Convert HierarchyNode to Ant Design MenuItem
   */
  const convertToMenuItem = useCallback(
    (node: HierarchyNode): MenuItem => {
      const key = getNodeKey(node);
      const nodeId = node.id;
      const isLoading = nodeId ? loadingNodes.includes(nodeId) : false;
      const cachedChildren = nodeId ? childrenCache[nodeId] : undefined;
      const hasChildren = node.children !== undefined;

      // Determine icon type - use hierarchy icon for parent nodes, shop icon for merchants (leaf)
      const IconComponent = hasChildren ? ApartmentOutlined : ShopOutlined;

      // Build icon element - use the icon component directly for proper collapsed display
      const iconElement = isLoading ? <Spin size="small" /> : <IconComponent />;

      // Build label with click handler and Tooltip for merchantId
      const labelContent = (
        <span
          onClick={(e) => handleLabelClick(node, e)}
          style={{ cursor: 'pointer' }}
        >
          {node.value}
        </span>
      );

      const label = node.merchantId ? (
        <Tooltip title={`Merchant ID: ${node.merchantId}`} placement="right">
          {labelContent}
        </Tooltip>
      ) : (
        labelContent
      );

      // Build children array if has cached children
      let children: MenuItem[] | undefined;
      if (hasChildren && cachedChildren && cachedChildren.length > 0) {
        children = cachedChildren.map((child) => convertToMenuItem(child));
      } else if (hasChildren) {
        // Has children but not loaded yet - show as expandable
        children = undefined;
      }

      // If it's a parent node (hasChildren), return SubMenu item
      if (hasChildren) {
        return {
          key,
          icon: iconElement,
          label,
          children: children || [],
        };
      }

      // Leaf node - return regular item
      return {
        key,
        icon: iconElement,
        label,
      };
    },
    [childrenCache, loadingNodes, handleLabelClick],
  );

  // Convert hierarchy tree to Ant Design Menu items
  const menuItems = useMemo(() => {
    if (!hierarchyTree || hierarchyTree.length === 0) {
      return [];
    }
    return hierarchyTree.map((node) => convertToMenuItem(node));
  }, [hierarchyTree, convertToMenuItem]);

  // Get selected keys from selectedNode
  const selectedKeys = useMemo(() => {
    if (!selectedNode) return [];
    return [getNodeKey(selectedNode)];
  }, [selectedNode]);

  // Find node by key in hierarchy tree
  const findNodeByKey = useCallback(
    (key: string): HierarchyNode | null => {
      const searchInNodes = (nodes: HierarchyNode[]): HierarchyNode | null => {
        for (const node of nodes) {
          if (getNodeKey(node) === key) {
            return node;
          }
          // Search in cached children
          if (node.id && childrenCache[node.id]) {
            const found = searchInNodes(childrenCache[node.id]);
            if (found) return found;
          }
        }
        return null;
      };
      return searchInNodes(hierarchyTree);
    },
    [hierarchyTree, childrenCache],
  );

  // Handle submenu open/close
  const handleOpenChange: MenuProps['onOpenChange'] = useCallback(
    async (openKeys: string[]) => {
      // Find newly opened keys
      const newOpenKeys = openKeys.filter((key) => !expandedKeys.includes(key));

      // Load children for newly opened nodes
      for (const key of newOpenKeys) {
        const node = findNodeByKey(key);
        if (node && node.id && node.children !== undefined && sessionId) {
          // Check if not already cached
          if (!childrenCache[node.id]) {
            try {
              await fetchChildren(node.id, sessionId);
            } catch (error) {
              message.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to load children',
              );
            }
          }
        }
      }

      setExpandedKeys(openKeys);
    },
    [
      expandedKeys,
      findNodeByKey,
      sessionId,
      childrenCache,
      fetchChildren,
      setExpandedKeys,
    ],
  );

  // Don't render if no tree data
  if (menuItems.length === 0) {
    return (
      <div
        style={{
          padding: collapsed ? '12px 0' : '12px 0',
          color: theme.colors.textMuted,
          fontSize: '12px',
          textAlign: 'center',
        }}
      >
        {collapsed ? '...' : 'No hierarchy data'}
      </div>
    );
  }

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={collapsed ? [] : expandedKeys}
      onOpenChange={handleOpenChange}
      items={menuItems}
      inlineCollapsed={collapsed}
      theme={isDark ? 'dark' : 'light'}
      style={{
        border: 'none',
        background: 'transparent',
        marginTop: '8px',
      }}
    />
  );
};
