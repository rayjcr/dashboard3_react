import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UIState } from '@/types/ui';
import type { HierarchyNode } from '@/types/auth';

const UI_STORAGE_KEY = 'ui-storage';

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sidebarCollapsed: false,
        sidebarDrawerOpen: false,
        selectedNode: null,
        expandedKeys: [],

        // Actions
        toggleSidebar: () => {
          set((state: UIState) => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          }));
        },

        setSidebarCollapsed: (collapsed: boolean) => {
          set({ sidebarCollapsed: collapsed });
        },

        toggleDrawer: () => {
          set((state: UIState) => ({
            sidebarDrawerOpen: !state.sidebarDrawerOpen,
          }));
        },

        setDrawerOpen: (open: boolean) => {
          set({ sidebarDrawerOpen: open });
        },

        setSelectedNode: (node: HierarchyNode | null) => {
          set({ selectedNode: node });
        },

        setExpandedKeys: (keys: string[]) => {
          set({ expandedKeys: keys });
        },
      }),
      {
        name: UI_STORAGE_KEY,
        // Persist sidebar collapsed state, selected node and expanded keys
        partialize: (state: UIState) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          selectedNode: state.selectedNode,
          expandedKeys: state.expandedKeys,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
