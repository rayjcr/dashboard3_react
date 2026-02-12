import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
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

  // Track if initial load has been done
  const initialLoadRef = useRef<string | null>(null);

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
        fetchTransactions(params);
      }
    },
    [
      buildRequestParams,
      fetchTransactions,
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
    ],
  );

  // Initial load when component mounts or node changes
  useEffect(() => {
    const nodeKey = selectedNode?.id ? `${selectedNode.id}-${sessionId}` : null;

    if (!canLoad || initialLoadRef.current === nodeKey) {
      return;
    }

    initialLoadRef.current = nodeKey;
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
    fetchTransactions(params);
  }, [
    selectedNode?.id,
    selectedNode,
    sessionId,
    hierarchyId,
    canLoad,
    merchantId,
    clearTransactionLookup,
    fetchTransactions,
  ]);

  // Handle refresh when refreshKey changes (tab click on same tab)
  useEffect(() => {
    if (refreshKey > 0 && canLoad) {
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
      fetchTransactions(params);
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
