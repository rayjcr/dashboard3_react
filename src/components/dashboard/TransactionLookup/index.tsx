import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import { App } from 'antd';
import type { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';
import {
  useTransactionLookupStore,
  useDashboardStore,
  useAuthStore,
  useUIStore,
} from '@/stores';
import { transactionLookupApi } from '@/services/api/transactionLookupApi';
import {
  downloadCSV,
  generateTransactionLookupCSV,
  getDateTimeString,
} from '@/utils/download';
import { DownloadButtons } from '../DownloadButtons';
import { TransactionLookupTable } from './TransactionLookupTable';
import { TransactionLookupFilter } from './TransactionLookupFilter';

interface TransactionLookupProps {
  refreshKey?: number;
}

export const TransactionLookup: React.FC<TransactionLookupProps> = ({
  refreshKey = 0,
}) => {
  const { selectedNode } = useUIStore();
  const { sessionId, hierarchyId, canRefund } = useAuthStore();
  const { nodeSharedInfo } = useDashboardStore();
  const { hasPreAuth, hasUPI } = nodeSharedInfo;
  const { message } = App.useApp();
  const {
    transactionData,
    loading,
    error,
    loadedNodeId,
    page,
    pageSize,
    startDate: storeStartDate,
    endDate: storeEndDate,
    searchKey: storeSearchKey,
    fetchTransactions,
    setPage,
    setPageSize,
    setStartDate,
    setEndDate,
    setSearchKey,
    clearTransactionLookup,
    getVisibleColumns,
    setColumnConfig,
  } = useTransactionLookupStore();

  // Local state for filter inputs (before search is clicked)
  const [localStartDate, setLocalStartDate] = useState<Dayjs | null>(null);
  const [localEndDate, setLocalEndDate] = useState<Dayjs | null>(null);
  const [localSearchKey, setLocalSearchKey] = useState<string>('');

  // Download state
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  // Track previous refreshKey to detect actual changes (not just component remount)
  const prevRefreshKeyRef = useRef<number>(refreshKey);

  // Check if can load data
  const canLoad = selectedNode?.id && sessionId && hierarchyId;

  // Get merchant ID from selected node
  const merchantId = selectedNode?.merchantId || '';

  // Build request params
  const buildRequestParams = useCallback(
    (
      pageNum: number = page,
      pageSz: number = pageSize,
      start: string = storeStartDate,
      end: string = storeEndDate,
      search: string = storeSearchKey,
    ) => {
      if (!selectedNode?.id || !sessionId || !hierarchyId) return null;

      return {
        merchantId: merchantId,
        sessionId: sessionId,
        rowCount: pageSz,
        pageNumber: pageNum,
        startDate: start,
        endDate: end,
        searchKey: search,
        hierarchy: hierarchyId,
        selectedMid: selectedNode.id,
      };
    },
    [
      selectedNode?.id,
      merchantId,
      sessionId,
      hierarchyId,
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
    ],
  );

  // Load transactions
  const loadTransactions = useCallback(
    (
      pageNum: number = page,
      pageSz: number = pageSize,
      start: string = storeStartDate,
      end: string = storeEndDate,
      search: string = storeSearchKey,
    ) => {
      const params = buildRequestParams(pageNum, pageSz, start, end, search);
      if (params) {
        const currentNodeId = selectedNode?.id || '';
        fetchTransactions(params, currentNodeId);
      }
    },
    [
      buildRequestParams,
      fetchTransactions,
      selectedNode?.id,
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
    ],
  );

  // Initial load when component mounts (tab becomes active)
  // With destroyInactiveTabPane=true in Tabs, component is remounted each time tab is activated
  // Use loadedNodeId from store to check if data for this node is already cached
  useEffect(() => {
    if (!canLoad) {
      return;
    }

    const currentNodeId = selectedNode?.id || '';

    // If data for this node is already loaded, skip loading (use cache)
    if (loadedNodeId === currentNodeId && transactionData) {
      return;
    }

    // Clear and load fresh data for this node
    clearTransactionLookup();
    setLocalStartDate(null);
    setLocalEndDate(null);
    setLocalSearchKey('');

    // Load with default params
    const params = {
      merchantId: merchantId,
      sessionId: sessionId!,
      rowCount: 10,
      pageNumber: 0,
      startDate: '',
      endDate: '',
      searchKey: '',
      hierarchy: hierarchyId!,
      selectedMid: selectedNode!.id,
    };
    fetchTransactions(params, currentNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  // Handle refresh when refreshKey changes (double-click on same tab)
  // Only trigger when refreshKey actually changes, not on component remount
  useEffect(() => {
    // Skip if refreshKey hasn't changed from previous value
    if (refreshKey === prevRefreshKeyRef.current) {
      return;
    }

    // Update ref to current value
    prevRefreshKeyRef.current = refreshKey;

    if (refreshKey > 0 && canLoad) {
      const currentNodeId = selectedNode?.id || '';

      // Clear search conditions and reload
      clearTransactionLookup();
      setLocalStartDate(null);
      setLocalEndDate(null);
      setLocalSearchKey('');

      const params = {
        merchantId: merchantId,
        sessionId: sessionId!,
        rowCount: 10,
        pageNumber: 0,
        startDate: '',
        endDate: '',
        searchKey: '',
        hierarchy: hierarchyId!,
        selectedMid: selectedNode!.id,
      };
      fetchTransactions(params, currentNodeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

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

  // Handle search key change
  const handleSearchKeyChange = useCallback((value: string) => {
    setLocalSearchKey(value);
  }, []);

  // Execute search - actual API call
  const executeSearch = useCallback(() => {
    const start = localStartDate ? localStartDate.format('YYYY-MM-DD') : '';
    const end = localEndDate ? localEndDate.format('YYYY-MM-DD') : '';
    const search = localSearchKey;

    // Update store
    setStartDate(start);
    setEndDate(end);
    setSearchKey(search);
    setPage(0);

    // Load transactions
    loadTransactions(0, pageSize, start, end, search);
  }, [
    localStartDate,
    localEndDate,
    localSearchKey,
    setStartDate,
    setEndDate,
    setSearchKey,
    setPage,
    loadTransactions,
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

  // Handle CSV download - use search conditions
  const handleDownloadCSV = useCallback(async () => {
    if (!selectedNode?.id || !sessionId || !hierarchyId) return;

    setDownloadingCSV(true);
    try {
      const response = await transactionLookupApi.downloadTransactions({
        merchantId: merchantId,
        sessionId: sessionId,
        rowCount: 10,
        pageNumber: 0,
        startDate: storeStartDate,
        endDate: storeEndDate,
        searchKey: storeSearchKey,
        hierarchy: hierarchyId,
        selectedMid: selectedNode.id,
      });

      const csvContent = generateTransactionLookupCSV(response);
      const filename = `TransactionLookup_${getDateTimeString()}.csv`;
      downloadCSV(csvContent, filename);
      message.success('CSV downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download CSV');
    } finally {
      setDownloadingCSV(false);
    }
  }, [
    selectedNode?.id,
    sessionId,
    hierarchyId,
    merchantId,
    storeStartDate,
    storeEndDate,
    storeSearchKey,
    message,
  ]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      loadTransactions(
        newPage,
        pageSize,
        storeStartDate,
        storeEndDate,
        storeSearchKey,
      );
    },
    [
      setPage,
      loadTransactions,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
    ],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      loadTransactions(
        0,
        newPageSize,
        storeStartDate,
        storeEndDate,
        storeSearchKey,
      );
    },
    [
      setPageSize,
      loadTransactions,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
    ],
  );

  // Handle refresh after action (e.g., refund success)
  const handleRefresh = useCallback(() => {
    loadTransactions(
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
    );
  }, [
    loadTransactions,
    page,
    pageSize,
    storeStartDate,
    storeEndDate,
    storeSearchKey,
  ]);

  return (
    <>
      <TransactionLookupFilter
        startDate={localStartDate}
        endDate={localEndDate}
        searchKey={localSearchKey}
        onDateRangeChange={handleDateRangeChange}
        onSearchKeyChange={handleSearchKeyChange}
        onSearch={handleSearch}
        loading={loading}
        visibleColumns={getVisibleColumns(merchantId || 'default')}
        onVisibleColumnsChange={(columns) =>
          setColumnConfig(merchantId || 'default', columns)
        }
      />
      <TransactionLookupTable
        data={transactionData}
        loading={loading}
        error={error}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        hasUPI={hasUPI}
        hasPreAuth={hasPreAuth}
        canRefund={canRefund}
        visibleColumns={getVisibleColumns(merchantId || 'default')}
        onRefresh={handleRefresh}
      />
      <DownloadButtons
        hasData={Boolean(transactionData?.transactions?.length)}
        onDownloadCSV={handleDownloadCSV}
        downloadingCSV={downloadingCSV}
      />
    </>
  );
};
