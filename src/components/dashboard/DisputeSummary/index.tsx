import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Tabs, App } from 'antd';
import type { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';
import { useDisputeStore, useAuthStore, useUIStore } from '@/stores';
import { disputeApi } from '@/services/api/disputeApi';
import {
  downloadCSV,
  downloadPDF,
  generateDisputeSummaryCSV,
  getDateTimeString,
} from '@/utils/download';
import { DownloadButtons } from '../DownloadButtons';
import { DisputeSummaryTable } from './DisputeSummaryTable';
import { DisputeSummaryFilter } from './DisputeSummaryFilter';
import type { DisputeType } from '@/types/dashboard';
import { DISPUTE_TYPE_OPTIONS } from '@/types/dashboard';

export const DisputeSummary: React.FC = () => {
  const { selectedNode } = useUIStore();
  const { sessionId, hierarchyId } = useAuthStore();
  const { message } = App.useApp();
  const {
    disputeData,
    loading,
    error,
    loadedNodeId,
    page,
    pageSize,
    startDate: storeStartDate,
    endDate: storeEndDate,
    disputeType: storeDisputeType,
    searchKey: storeSearchKey,
    fetchDisputes,
    setPage,
    setPageSize,
    setStartDate,
    setEndDate,
    setDisputeType,
    setSearchKey,
    clearDispute,
  } = useDisputeStore();

  // Local state for filter inputs (before search is clicked)
  const [localStartDate, setLocalStartDate] = useState<Dayjs | null>(null);
  const [localEndDate, setLocalEndDate] = useState<Dayjs | null>(null);
  const [localSearchKey, setLocalSearchKey] = useState<string>('');

  // Download state
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Check if can load data
  const canLoad = selectedNode?.id && sessionId && hierarchyId;

  // Get merchant ID from selected node
  const merchantId = selectedNode?.merchantId || '';

  // Check if selected node is a leaf node (no children)
  const isLeafNode = selectedNode && !selectedNode.children;

  // Build request params
  const buildRequestParams = useCallback(
    (
      pageNum: number = page,
      pageSz: number = pageSize,
      start: string = storeStartDate,
      end: string = storeEndDate,
      type: DisputeType = storeDisputeType,
      keyword: string = storeSearchKey,
    ) => {
      if (!selectedNode?.id || !sessionId) return null;

      return {
        hierarchy_user_id: selectedNode.id,
        merchantId: isLeafNode ? merchantId : '',
        session_id: sessionId,
        search_type: 'daily_dispute' as const,
        date_month: '',
        disputeType: type === 'all' ? '' : type,
        page_number: String(pageNum),
        row_count: pageSz,
        startDate: start,
        endDate: end,
        searchKey: keyword,
      };
    },
    [
      selectedNode?.id,
      merchantId,
      sessionId,
      isLeafNode,
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeDisputeType,
      storeSearchKey,
    ],
  );

  // Load disputes
  const loadDisputes = useCallback(
    (
      pageNum: number = page,
      pageSz: number = pageSize,
      start: string = storeStartDate,
      end: string = storeEndDate,
      type: DisputeType = storeDisputeType,
      keyword: string = storeSearchKey,
    ) => {
      const params = buildRequestParams(
        pageNum,
        pageSz,
        start,
        end,
        type,
        keyword,
      );
      if (params) {
        const currentNodeId = selectedNode?.id || '';
        fetchDisputes(params, currentNodeId);
      }
    },
    [
      buildRequestParams,
      fetchDisputes,
      selectedNode?.id,
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeDisputeType,
      storeSearchKey,
    ],
  );

  // Handle evidence submission success - refresh dispute list
  const handleEvidenceSubmitted = useCallback(() => {
    // Reload disputes with current search parameters
    loadDisputes(
      page,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeDisputeType,
      storeSearchKey,
    );
  }, [
    loadDisputes,
    page,
    pageSize,
    storeStartDate,
    storeEndDate,
    storeDisputeType,
    storeSearchKey,
  ]);

  // Initial load when component mounts (tab becomes active)
  // With destroyInactiveTabPane=true in Tabs, component is remounted each time tab is activated
  // Use loadedNodeId from store to check if data for this node is already cached
  useEffect(() => {
    if (!canLoad) {
      return;
    }

    const currentNodeId = selectedNode?.id || '';

    // If data for this node is already loaded, skip loading (use cache)
    if (loadedNodeId === currentNodeId && disputeData) {
      return;
    }

    // Clear and load fresh data for this node
    clearDispute();
    setLocalStartDate(null);
    setLocalEndDate(null);
    setLocalSearchKey('');

    // Load with default params
    const params = {
      hierarchy_user_id: selectedNode!.id,
      merchantId: isLeafNode ? merchantId : '',
      session_id: sessionId!,
      search_type: 'daily_dispute' as const,
      date_month: '',
      disputeType: '',
      page_number: '0',
      row_count: 10,
      startDate: '',
      endDate: '',
      searchKey: '',
    };
    fetchDisputes(params, currentNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

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

  // Handle dispute type tab change - immediately trigger search
  const handleDisputeTypeChange = useCallback(
    (type: string) => {
      const disputeType = type as DisputeType;
      setDisputeType(disputeType);
      setPage(0);

      const start = localStartDate
        ? localStartDate.format('YYYY-MM-DD')
        : storeStartDate;
      const end = localEndDate
        ? localEndDate.format('YYYY-MM-DD')
        : storeEndDate;
      const keyword = localSearchKey || storeSearchKey;

      loadDisputes(0, pageSize, start, end, disputeType, keyword);
    },
    [
      localStartDate,
      localEndDate,
      localSearchKey,
      storeStartDate,
      storeEndDate,
      storeSearchKey,
      setDisputeType,
      setPage,
      loadDisputes,
      pageSize,
    ],
  );

  // Execute search - actual API call
  const executeSearch = useCallback(() => {
    const start = localStartDate ? localStartDate.format('YYYY-MM-DD') : '';
    const end = localEndDate ? localEndDate.format('YYYY-MM-DD') : '';

    // Update store
    setStartDate(start);
    setEndDate(end);
    setSearchKey(localSearchKey);
    setPage(0);

    // Load disputes
    loadDisputes(0, pageSize, start, end, storeDisputeType, localSearchKey);
  }, [
    localStartDate,
    localEndDate,
    localSearchKey,
    storeDisputeType,
    setStartDate,
    setEndDate,
    setSearchKey,
    setPage,
    loadDisputes,
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

  // Handle CSV download
  const handleDownloadCSV = useCallback(async () => {
    if (!selectedNode?.id || !sessionId) return;

    setDownloadingCSV(true);
    try {
      const response = await disputeApi.downloadDisputes({
        startDate: storeStartDate,
        endDate: storeEndDate,
        hierarchy_user_id: selectedNode.id,
        merchantId: isLeafNode ? merchantId : '',
        session_id: sessionId,
        search_type: 'daily_dispute',
        disputeType: storeDisputeType === 'all' ? 'all' : storeDisputeType,
        page_number: '0',
        row_count: 10,
        download: 'csv',
      });

      const csvContent = generateDisputeSummaryCSV(response);
      const filename = `DisputeSummary_${getDateTimeString()}.csv`;
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
    isLeafNode,
    merchantId,
    storeDisputeType,
    storeStartDate,
    storeEndDate,
    message,
  ]);

  // Handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!selectedNode?.id || !sessionId) return;

    setDownloadingPDF(true);
    try {
      const blob = await disputeApi.downloadDisputesPDF({
        startDate: storeStartDate,
        endDate: storeEndDate,
        hierarchy_user_id: selectedNode.id,
        merchantId: isLeafNode ? merchantId : '',
        session_id: sessionId,
        search_type: 'daily_dispute',
        disputeType: storeDisputeType === 'all' ? 'all' : storeDisputeType,
        page_number: '0',
        row_count: 10,
        download: 'pdf',
      });

      const filename = `DisputeSummary_${getDateTimeString()}.pdf`;
      downloadPDF(blob, filename);
      message.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download PDF');
    } finally {
      setDownloadingPDF(false);
    }
  }, [
    selectedNode?.id,
    sessionId,
    isLeafNode,
    merchantId,
    storeDisputeType,
    storeStartDate,
    storeEndDate,
    message,
  ]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      loadDisputes(
        newPage,
        pageSize,
        storeStartDate,
        storeEndDate,
        storeDisputeType,
        storeSearchKey,
      );
    },
    [
      setPage,
      loadDisputes,
      pageSize,
      storeStartDate,
      storeEndDate,
      storeDisputeType,
      storeSearchKey,
    ],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      loadDisputes(
        0,
        newPageSize,
        storeStartDate,
        storeEndDate,
        storeDisputeType,
        storeSearchKey,
      );
    },
    [
      setPageSize,
      loadDisputes,
      storeStartDate,
      storeEndDate,
      storeDisputeType,
      storeSearchKey,
    ],
  );

  // Build tab items from DISPUTE_TYPE_OPTIONS
  const tabItems = DISPUTE_TYPE_OPTIONS.map((option) => ({
    key: option.value,
    label: option.label,
  }));

  return (
    <div>
      <DisputeSummaryFilter
        startDate={localStartDate}
        endDate={localEndDate}
        searchKey={localSearchKey}
        onDateRangeChange={handleDateRangeChange}
        onSearchKeyChange={handleSearchKeyChange}
        onSearch={handleSearch}
        loading={loading}
      />
      <Tabs
        activeKey={storeDisputeType}
        onChange={handleDisputeTypeChange}
        items={tabItems}
        style={{ marginBottom: 0 }}
      />
      <DisputeSummaryTable
        data={disputeData}
        loading={loading}
        error={error}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onEvidenceSubmitted={handleEvidenceSubmitted}
        message={message}
      />
      <DownloadButtons
        hasData={Boolean(disputeData?.transactions?.length)}
        onDownloadCSV={handleDownloadCSV}
        downloadingCSV={downloadingCSV}
        onDownloadPDF={handleDownloadPDF}
        downloadingPDF={downloadingPDF}
      />
    </div>
  );
};
