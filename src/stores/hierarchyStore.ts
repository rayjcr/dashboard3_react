import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { hierarchyApi } from '@/services/api/hierarchyApi';
import type { HierarchyNode } from '@/types/auth';
import type { ChildrensData } from '@/types/hierarchy';

const HIERARCHY_STORAGE_KEY = 'hierarchy-storage';

/**
 * Convert ChildrensData to HierarchyNode
 */
function convertToHierarchyNode(data: ChildrensData): HierarchyNode {
  return {
    id: data.id,
    value: data.value,
    merchantId: data.merchantId,
    hasAliDirect: data.hasAliDirect,
    hasMultiFundings: data.hasMultiFundings,
    settings: data.settings,
    // If children exists (even empty array), mark as expandable
    children: data.children ? [] : undefined,
  };
}

/**
 * Hierarchy state interface
 */
export interface HierarchyState {
  /**
   * Cache of children nodes, keyed by parent ID
   */
  childrenCache: Record<number, HierarchyNode[]>;

  /**
   * List of node IDs currently being loaded
   */
  loadingNodes: number[];

  /**
   * Fetch children for a parent node
   * @param parentId - The parent node ID
   * @param sessionId - The session ID
   * @param forceRefresh - If true, will refetch even if cached
   */
  fetchChildren: (
    parentId: number,
    sessionId: string,
    forceRefresh?: boolean,
  ) => Promise<void>;

  /**
   * Refresh children for a parent node (force refetch)
   */
  refreshChildren: (parentId: number, sessionId: string) => Promise<void>;

  /**
   * Invalidate cache for a specific parent node
   */
  invalidateCache: (parentId: number) => void;

  /**
   * Set children for a parent node (manual)
   */
  setChildren: (parentId: number, children: HierarchyNode[]) => void;

  /**
   * Check if a node's children are cached
   */
  hasChildren: (parentId: number) => boolean;

  /**
   * Get cached children for a parent node
   */
  getChildren: (parentId: number) => HierarchyNode[] | undefined;

  /**
   * Check if a node is currently loading
   */
  isLoading: (parentId: number) => boolean;

  /**
   * Clear all cache
   */
  clearCache: () => void;
}

export const useHierarchyStore = create<HierarchyState>()(
  devtools(
    persist(
      (set, get) => ({
        childrenCache: {},
        loadingNodes: [],

        fetchChildren: async (
          parentId: number,
          sessionId: string,
          forceRefresh: boolean = false,
        ) => {
          const state = get();

          // Skip if already loading
          if (state.loadingNodes.includes(parentId)) {
            return;
          }

          // Skip if already cached (unless force refresh)
          if (!forceRefresh && state.childrenCache[parentId]) {
            return;
          }

          // Mark as loading
          set({ loadingNodes: [...state.loadingNodes, parentId] });
          try {
            const response = await hierarchyApi.fetchMultilayer(
              parentId,
              sessionId,
            );
            if (response.code == 200) {
              const children = response.childrens_data.map(
                convertToHierarchyNode,
              );
              set((state) => ({
                childrenCache: {
                  ...state.childrenCache,
                  [parentId]: children,
                },
                loadingNodes: state.loadingNodes.filter(
                  (id) => id !== parentId,
                ),
              }));
            } else {
              // Remove from loading on error
              set((state) => ({
                loadingNodes: state.loadingNodes.filter(
                  (id) => id !== parentId,
                ),
              }));
              throw new Error(response.message || 'Failed to fetch children');
            }
          } catch (error) {
            // Remove from loading on error
            set((state) => ({
              loadingNodes: state.loadingNodes.filter((id) => id !== parentId),
            }));
            throw error;
          }
        },

        setChildren: (parentId: number, children: HierarchyNode[]) => {
          set((state) => ({
            childrenCache: {
              ...state.childrenCache,
              [parentId]: children,
            },
          }));
        },

        refreshChildren: async (parentId: number, sessionId: string) => {
          // Force refresh by calling fetchChildren with forceRefresh=true
          await get().fetchChildren(parentId, sessionId, true);
        },

        invalidateCache: (parentId: number) => {
          set((state) => {
            const newCache = { ...state.childrenCache };
            delete newCache[parentId];
            return { childrenCache: newCache };
          });
        },

        hasChildren: (parentId: number) => {
          return parentId in get().childrenCache;
        },

        getChildren: (parentId: number) => {
          return get().childrenCache[parentId];
        },

        isLoading: (parentId: number) => {
          return get().loadingNodes.includes(parentId);
        },

        clearCache: () => {
          set({ childrenCache: {}, loadingNodes: [] });
        },
      }),
      {
        name: HIERARCHY_STORAGE_KEY,
        // Only persist the children cache
        partialize: (state) => ({
          childrenCache: state.childrenCache,
        }),
      },
    ),
    { name: 'HierarchyStore' },
  ),
);
