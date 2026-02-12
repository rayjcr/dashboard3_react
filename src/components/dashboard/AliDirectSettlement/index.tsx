import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import type { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';
import { useAliDirectStore, useAuthStore, useUIStore } from '@/stores';
import { AliDirectTable } from './AliDirectTable';
import { AliDirectFilter } from './AliDirectFilter';

export const AliDirectSettlement: React.FC = () => {
  const { selectedNode } = useUIStore();
  const { sessionId } = useAuthStore();
  const {
    aliDirectData,
    loading,
    error,
    page,
    pageSize,
    startDate: storeStartDate,
    endDate: storeEndDate,
    fetchAliDirect,
    setPage,
    setPageSize,
    setStartDate,
    setEndDate,
    clearAliDirect,
  } = useAliDirectStore();

  // Local state for filter inputs (before search is clicked)
  const [localStartDate, setLocalStartDate] = useState<Dayjs | null>(null);
  const [localEndDate, setLocalEndDate] = useState<Dayjs | null>(null);

  // Track if initial load has been done for current node
  const initialLoadRef = useRef<string | null>(null);

  // Check if can load data - need merchantId for this API
  const merchantId = selectedNode?.merchantId || '';
  const canLoad = merchantId && sessionId;

  // Build request params
  const buildRequestParams = useCallback(
    (
      pageNum: number = page,
      pageSz: number = pageSize,
      start: string = storeStartDate,
      end: string = storeEndDate,
    ) => {
      if (!merchantId || !sessionId) return null;

      return {
        merchantId,
        session_id: sessionId,
        date_month: '',
        page_number: String(pageNum),
        row_count: pageSz,
        startDate: start,
        endDate: end,
      };
    },
    [merchantId, sessionId, page, pageSize, storeStartDate, storeEndDate],
  );

  // Load data
  const loadAliDirect = useCallback(
    (
      pageNum: number = page,
      pageSz: number = pageSize,
      start: string = storeStartDate,
      end: string = storeEndDate,
    ) => {
      const params = buildRequestParams(pageNum, pageSz, start, end);
      if (params) {
        fetchAliDirect(params);
      }
    },
    [
      buildRequestParams,
      fetchAliDirect,
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
    ],
  );

  // Initial load when component mounts or node changes
  useEffect(() => {
    const nodeKey = merchantId ? `${merchantId}-${sessionId}` : null;

    // Skip if cannot load or already loaded for this node
    if (!canLoad || !nodeKey) {
      return;
    }

    // Check if already loaded for this node
    if (initialLoadRef.current === nodeKey) {
      return;
    }

    initialLoadRef.current = nodeKey;
    clearAliDirect();
    setLocalStartDate(null);
    setLocalEndDate(null);

    // Load with default params
    const params = {
      merchantId,
      session_id: sessionId!,
      date_month: '',
      page_number: '0',
      row_count: 10,
      startDate: '',
      endDate: '',
    };
    fetchAliDirect(params);
  }, [
    merchantId,
    sessionId,
    canLoad,
    clearAliDirect,
    fetchAliDirect,
    selectedNode?.id,
  ]);

  // Handle date range change
  const handleDateRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (dates) {
        setLocalStartDate(dates[0]);
        setLocalEndDate(dates[1]);
      } else {
        setLocalStartDate(null);
        setLocalEndDate(null);
      }
    },
    [],
  );

  // Execute search - actual API call
  const executeSearch = useCallback(() => {
    const start = localStartDate ? localStartDate.format('YYYY-MM-DD') : '';
    const end = localEndDate ? localEndDate.format('YYYY-MM-DD') : '';

    // Update store
    setStartDate(start);
    setEndDate(end);
    setPage(0);

    // Load data
    loadAliDirect(0, pageSize, start, end);
  }, [
    localStartDate,
    localEndDate,
    setStartDate,
    setEndDate,
    setPage,
    loadAliDirect,
    pageSize,
  ]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce(() => executeSearch(), 300),
    [executeSearch],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search button click with debounce
  const handleSearch = useCallback(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      loadAliDirect(newPage, pageSize, storeStartDate, storeEndDate);
    },
    [setPage, loadAliDirect, pageSize, storeStartDate, storeEndDate],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      loadAliDirect(0, newPageSize, storeStartDate, storeEndDate);
    },
    [setPageSize, loadAliDirect, storeStartDate, storeEndDate],
  );

  return (
    <div>
      <AliDirectFilter
        startDate={localStartDate}
        endDate={localEndDate}
        onDateRangeChange={handleDateRangeChange}
        onSearch={handleSearch}
        loading={loading}
      />
      <AliDirectTable
        data={aliDirectData}
        loading={loading}
        error={error}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};
