import type { HierarchyNode } from './auth';

/**
 * UI State interface for Zustand store
 */
export interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarDrawerOpen: boolean;

  // TreeMenu - selected node
  selectedNode: HierarchyNode | null;

  // TreeMenu - expanded node keys
  expandedKeys: string[];

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  setSelectedNode: (node: HierarchyNode | null) => void;
  setExpandedKeys: (keys: string[]) => void;
}
