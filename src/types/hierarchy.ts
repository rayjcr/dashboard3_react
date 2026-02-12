/**
 * Hierarchy module types
 * Used for dynamic tree menu (multilayer API)
 */

import type { HierarchyNodeSettings } from './auth';

/**
 * Children array item in ChildrensData
 */
export interface ChildrenArray {
  value: string;
}

/**
 * Child node data returned from /api/multilayer
 */
export interface ChildrensData {
  id: number;
  value: string;
  merchantId: string;
  hasAliDirect: number;
  hasMultiFundings: number;
  settings?: HierarchyNodeSettings;
  /**
   * If children exists, the node can be expanded
   */
  children?: ChildrenArray[];
}

/**
 * Request parameters for /api/multilayer
 */
export interface MultilayerRequest {
  /**
   * Parent node ID
   */
  parent_id: number;
  /**
   * Current session ID
   */
  session_id: string;
}

/**
 * Response from /api/multilayer
 */
export interface MultilayerResponse {
  /**
   * Response status code (200 = success)
   */
  code: number;
  /**
   * Error message (optional)
   */
  message?: string;
  /**
   * List of child nodes
   */
  childrens_data: ChildrensData[];
}
