import React, { useCallback, useEffect, useRef } from 'react';
import { useReserveSummaryStore, useAuthStore, useUIStore } from '@/stores';
import { ReserveSummaryTables } from './ReserveSummaryTables';

interface ReserveSummaryProps {
  refreshKey?: number;
}

export const ReserveSummary: React.FC<ReserveSummaryProps> = ({
  refreshKey = 0,
}) => {
  const { selectedNode } = useUIStore();
  const { sessionId } = useAuthStore();
  const {
    reserveSummaryData,
    loading,
    error,
    currency,
    page,
    pageSize,
    fetchReserveSummary,
    setPage,
    clearReserveSummary,
  } = useReserveSummaryStore();

  // Track if initial load has been done
  const initialLoadRef = useRef<string | null>(null);

  // Get merchant ID from selected node (only leaf nodes have merchantId)
  const merchantId = selectedNode?.merchantId || '';

  // Check if can load data - only leaf nodes with merchantId
  const canLoad = selectedNode?.id && sessionId && merchantId;

  // Load reserve summary data
  const loadReserveSummary = useCallback(
    (pageNum: number = page) => {
      if (!selectedNode?.id || !sessionId || !merchantId) return;

      fetchReserveSummary({
        hierarchy_user_id: selectedNode.id,
        merchantId: merchantId,
        session_id: sessionId,
        search_type: 'reserve',
        date_month: '',
        disputeType: 'all',
        page_number: String(pageNum),
        row_count: pageSize,
      });
    },
    [
      selectedNode?.id,
      merchantId,
      sessionId,
      pageSize,
      page,
      fetchReserveSummary,
    ],
  );

  // Initial load when component mounts or node changes
  useEffect(() => {
    const nodeKey = selectedNode?.id ? `${selectedNode.id}-${sessionId}` : null;

    if (!canLoad || initialLoadRef.current === nodeKey) {
      return;
    }

    initialLoadRef.current = nodeKey;
    clearReserveSummary();

    // Load with default params
    fetchReserveSummary({
      hierarchy_user_id: selectedNode!.id,
      merchantId: merchantId,
      session_id: sessionId!,
      search_type: 'reserve',
      date_month: '',
      disputeType: 'all',
      page_number: '0',
      row_count: 10,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedNode?.id,
    sessionId,
    canLoad,
    merchantId,
    clearReserveSummary,
    fetchReserveSummary,
  ]);

  // Handle refresh when refreshKey changes (tab click on same tab)
  useEffect(() => {
    if (refreshKey > 0 && canLoad) {
      clearReserveSummary();

      fetchReserveSummary({
        hierarchy_user_id: selectedNode!.id,
        merchantId: merchantId,
        session_id: sessionId!,
        search_type: 'reserve',
        date_month: '',
        disputeType: 'all',
        page_number: '0',
        row_count: 10,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Handle page change for rolling details
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      loadReserveSummary(newPage);
    },
    [setPage, loadReserveSummary],
  );

  // If not a leaf node (no merchantId), show message
  if (!merchantId && selectedNode) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Reserve Summary is only available for merchant nodes.
      </div>
    );
  }

  return (
    <ReserveSummaryTables
      fixedReserves={reserveSummaryData?.fixed_reserves || []}
      rollingReserves={reserveSummaryData?.rolling_reserves || []}
      rollingDetails={reserveSummaryData?.rolling_detail?.transactions || []}
      rollingDetailTotal={
        reserveSummaryData?.rolling_detail?.total_records || 0
      }
      loading={loading}
      error={error}
      currency={currency}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
    />
  );
};
