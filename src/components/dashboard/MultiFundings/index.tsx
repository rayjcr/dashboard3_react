import React, { useCallback, useEffect, useRef } from 'react';
import { useMultiFundingsStore, useAuthStore, useUIStore } from '@/stores';
import { MultiFundingsTable } from './MultiFundingsTable';

interface MultiFundingsProps {
  refreshKey?: number;
}

export const MultiFundings: React.FC<MultiFundingsProps> = ({
  refreshKey = 0,
}) => {
  const { selectedNode } = useUIStore();
  const { sessionId } = useAuthStore();
  const {
    multiFundingsData,
    loading,
    error,
    page,
    pageSize,
    fetchMultiFundings,
    setPage,
    setPageSize,
    clearMultiFundings,
  } = useMultiFundingsStore();

  // Track if initial load has been done
  const initialLoadRef = useRef<string | null>(null);

  // Get merchant ID from selected node (only leaf nodes have merchantId)
  const merchantId = selectedNode?.merchantId || '';

  // Check if can load data - only leaf nodes with merchantId
  const canLoad = selectedNode?.id && sessionId && merchantId;

  // Build request params
  const buildRequestParams = useCallback(
    (pageNum: number = page, pageSz: number = pageSize) => {
      if (!merchantId || !sessionId) return null;

      return {
        merchantId: merchantId,
        session_id: sessionId,
        date_month: '',
        page_number: String(pageNum),
        row_count: pageSz,
      };
    },
    [merchantId, sessionId, page, pageSize],
  );

  // Load multi fundings data
  const loadMultiFundings = useCallback(
    (pageNum: number = page, pageSz: number = pageSize) => {
      const params = buildRequestParams(pageNum, pageSz);
      if (params) {
        fetchMultiFundings(params);
      }
    },
    [buildRequestParams, fetchMultiFundings, page, pageSize],
  );

  // Initial load when component mounts (tab becomes active)
  // With destroyInactiveTabPane=true in Tabs, component is remounted each time tab is activated
  useEffect(() => {
    // Only load on initial mount when canLoad is true and not already loaded
    if (!canLoad || initialLoadRef.current !== null) {
      return;
    }

    const nodeKey = selectedNode?.id ? `${selectedNode.id}-${sessionId}` : null;
    initialLoadRef.current = nodeKey;
    clearMultiFundings();

    // Load with default params
    const params = {
      merchantId: merchantId,
      session_id: sessionId!,
      date_month: '',
      page_number: '0',
      row_count: 10,
    };
    fetchMultiFundings(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  // Handle refresh when refreshKey changes (tab click on same tab)
  useEffect(() => {
    if (refreshKey > 0 && canLoad) {
      clearMultiFundings();

      const params = {
        merchantId: merchantId,
        session_id: sessionId!,
        date_month: '',
        page_number: '0',
        row_count: 10,
      };
      fetchMultiFundings(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      loadMultiFundings(newPage, pageSize);
    },
    [setPage, loadMultiFundings, pageSize],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      loadMultiFundings(0, newPageSize);
    },
    [setPageSize, loadMultiFundings],
  );

  // If not a leaf node (no merchantId), show message
  if (!merchantId && selectedNode) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Multi Fundings is only available for merchant nodes.
      </div>
    );
  }

  return (
    <MultiFundingsTable
      data={multiFundingsData?.aliDirect || []}
      loading={loading}
      error={error}
      page={page}
      pageSize={pageSize}
      total={multiFundingsData?.total_records || 0}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
};
