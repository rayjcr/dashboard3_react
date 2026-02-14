import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  useMemo,
} from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Card, Typography, Space, Tabs, Empty, App } from 'antd';
import {
  ShopOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  BarChartOutlined,
  SearchOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  AlipayCircleOutlined,
  DollarOutlined,
  SafetyOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import {
  useUIStore,
  useAuthStore,
  useDashboardStore,
  useThemeStore,
  useTransactionLookupStore,
  useDisputeStore,
} from '@/stores';
import { cancelAllDashboardRequests } from '@/stores/dashboardStore';
import { cancelDisputeRequests } from '@/stores/disputeStore';
import { cancelAliDirectRequests } from '@/stores/aliDirectStore';
import { cancelTransactionLookupRequests } from '@/stores/transactionLookupStore';
import { cancelMultiFundingsRequests } from '@/stores/multiFundingsStore';
import { cancelReserveSummaryRequests } from '@/stores/reserveSummaryStore';
import {
  DailySummaryTable,
  MonthlySummaryTable,
  DailySettleSummaryTable,
  DateFilter,
  DownloadButtons,
  TransactionLookup,
  DisputeSummary,
  AliDirectSettlement,
  MultiFundings,
  ReserveSummary,
} from '@/components/dashboard';
import { parseUserConfig } from '@/types/dashboard';
import { summaryApi } from '@/services/api/summaryApi';
import {
  downloadCSV,
  downloadPDF,
  generateDailySummaryCSV,
  generateMonthlySummaryCSV,
  generateDailySettleSummaryCSV,
  getDateTimeString,
} from '@/utils/download';
import '@/components/dashboard/dashboard.css';
import type { Dayjs } from 'dayjs';
import debounce from 'lodash/debounce';

const { Text } = Typography;

// Placeholder component for unimplemented features
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <Empty
    description={
      <span>
        <Text strong>{title}</Text>
        <br />
        <Text type="secondary">Coming Soon</Text>
      </span>
    }
    style={{ padding: '40px 0' }}
  />
);

export const DashboardPage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedNode, setSelectedNode, setExpandedKeys } = useUIStore();
  const { sessionId, config, hierarchyTree } = useAuthStore();
  const { currentTheme } = useThemeStore();
  const { message } = App.useApp();
  const isDark = currentTheme === 'dark';
  const primaryColor = isDark ? '#7c3aed' : '#1890ff';

  // Parse user config
  const userConfig = useMemo(() => parseUserConfig(config), [config]);

  // Track if this is initial auto-selection of top node
  // Use a ref to track which node ID was auto-selected (not just a boolean flag)
  const autoSelectedNodeIdRef = useRef<number | null>(null);

  // Auto-select top-level node if no node is selected
  useEffect(() => {
    if (!selectedNode && hierarchyTree && hierarchyTree.length > 0) {
      const topNode = hierarchyTree[0];
      // Mark which node ID is being auto-selected
      autoSelectedNodeIdRef.current = topNode.id;
      setSelectedNode(topNode);
      // Use correct key format matching TreeMenu's getNodeKey function
      setExpandedKeys([`node-${topNode.id}`]);
    }
  }, [selectedNode, hierarchyTree, setSelectedNode, setExpandedKeys]);

  const {
    dailySummary,
    dailySummaryLoading,
    dailySummaryError,
    dailyPage,
    dailyPageSize,
    monthlySummary,
    monthlySummaryLoading,
    monthlySummaryError,
    monthlyPage,
    monthlyPageSize,
    dailySettleSummary,
    dailySettleSummaryLoading,
    dailySettleSummaryError,
    dailySettlePage,
    dailySettlePageSize,
    fetchDailySummary,
    fetchMonthlySummary,
    fetchDailySettleSummary,
    setDailyPage,
    setDailyPageSize,
    setMonthlyPage,
    setMonthlyPageSize,
    setDailySettlePage,
    setDailySettlePageSize,
    clearDashboard,
    nodeSharedInfo,
  } = useDashboardStore();

  // Get clear methods from TransactionLookup and Dispute stores for refresh
  const { clearTransactionLookup } = useTransactionLookupStore();
  const { clearDispute } = useDisputeStore();

  // Track active tab using URL parameter for back navigation support
  // Default to 'daily' tab after login
  // Initialize based on URL param, then existing data in store, then default to 'daily'
  // Only core tabs (daily/monthly/settle) are restored from URL on page refresh
  const getInitialTab = (): string => {
    const tabFromUrl = searchParams.get('tab');
    // Only restore core tabs from URL, other tabs should start from daily
    if (
      tabFromUrl &&
      (tabFromUrl === 'daily' ||
        tabFromUrl === 'monthly' ||
        tabFromUrl === 'settle')
    ) {
      return tabFromUrl;
    }
    // If dailySummary already has data in store, restore to daily tab
    if (useDashboardStore.getState().dailySummary) {
      return 'daily';
    }
    if (useDashboardStore.getState().monthlySummary) {
      return 'monthly';
    }
    // Default to daily tab
    return 'daily';
  };
  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  // On mount, if URL has a non-core tab, update URL to match activeTab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (
      tabFromUrl &&
      tabFromUrl !== 'daily' &&
      tabFromUrl !== 'monthly' &&
      tabFromUrl !== 'settle'
    ) {
      // URL has non-core tab, update URL to match the actual activeTab ('daily')
      setSearchParams({ tab: 'daily' }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Wrapper to update both state and URL param
  const setActiveTab = useCallback(
    (tab: string) => {
      setActiveTabState(tab);
      if (tab) {
        setSearchParams({ tab }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams],
  );

  const [dailyLoaded, setDailyLoaded] = useState<boolean>(() => {
    return !!useDashboardStore.getState().dailySummary;
  });
  const [monthlyLoaded, setMonthlyLoaded] = useState<boolean>(() => {
    return !!useDashboardStore.getState().monthlySummary;
  });
  const [dailySettleLoaded, setDailySettleLoaded] = useState<boolean>(() => {
    return !!useDashboardStore.getState().dailySettleSummary;
  });

  // Refresh keys for components that manage their own data loading
  const [lookupRefreshKey, setLookupRefreshKey] = useState<number>(0);
  const [disputeRefreshKey, setDisputeRefreshKey] = useState<number>(0);
  const [alipayRefreshKey, setAlipayRefreshKey] = useState<number>(0);
  const [multiFundingsRefreshKey, setMultiFundingsRefreshKey] =
    useState<number>(0);
  const [reserveRefreshKey, setReserveRefreshKey] = useState<number>(0);

  // Date filter state
  const [dailyDate, setDailyDate] = useState<Dayjs | null>(null);
  const [monthlyDate, setMonthlyDate] = useState<Dayjs | null>(null);
  const [dailySettleDate, setDailySettleDate] = useState<Dayjs | null>(null);

  // Download state
  const [downloadingDailyCSV, setDownloadingDailyCSV] = useState(false);
  const [downloadingDailyPDF, setDownloadingDailyPDF] = useState(false);
  const [downloadingMonthlyCSV, setDownloadingMonthlyCSV] = useState(false);
  const [downloadingMonthlyPDF, setDownloadingMonthlyPDF] = useState(false);
  const [downloadingDailySettleCSV, setDownloadingDailySettleCSV] =
    useState(false);
  const [downloadingDailySettlePDF, setDownloadingDailySettlePDF] =
    useState(false);

  // Ref to track if initial load has been done for current node
  // Initialize based on existing data to prevent reload when returning from detail page
  const getInitialLoadKey = (): string | null => {
    const state = useDashboardStore.getState();
    // If data exists in store, assume it was loaded for the current node
    if (state.dailySummary && selectedNode?.id && sessionId) {
      return `${selectedNode.id}-${sessionId}`;
    }
    return null;
  };
  const initialLoadRef = useRef<string | null>(getInitialLoadKey());

  // Check if selected node is a leaf node (no children)
  const isLeafNode = selectedNode && !selectedNode.children;

  // Check if should show Method column: only show when selectedNode.hasMultiFundings is truthy
  const showMethodColumn = Boolean(selectedNode?.hasMultiFundings);

  // Build base request params (without row_count, will be added dynamically)
  const getBaseParams = useCallback(() => {
    if (!selectedNode?.id || !sessionId) return null;
    return {
      hierarchy_user_id: selectedNode.id,
      merchantId: isLeafNode ? selectedNode.merchantId || '' : '',
      disputeType: 'all',
      session_id: sessionId,
    };
  }, [selectedNode, sessionId, isLeafNode]);

  // Load daily summary
  // Initial load: date_month is empty to get all data
  // Search: use selected date formatted as 'YYYY-MM-DD'
  const loadDailySummary = useCallback(
    (
      page: number = 0,
      dateMonth: string = '',
      rowCount: number = dailyPageSize,
    ) => {
      const baseParams = getBaseParams();
      if (!baseParams) return;

      fetchDailySummary({
        ...baseParams,
        row_count: rowCount,
        date_month: dateMonth,
        page_number: String(page),
      });
      setDailyLoaded(true);
    },
    [getBaseParams, fetchDailySummary, dailyPageSize],
  );

  // Load monthly summary
  // Initial load: date_month is empty to get all data
  // Search: use selected month formatted as 'YYYYMM'
  const loadMonthlySummary = useCallback(
    (
      page: number = 0,
      dateMonth: string = '',
      rowCount: number = monthlyPageSize,
    ) => {
      const baseParams = getBaseParams();
      if (!baseParams) return;

      fetchMonthlySummary({
        ...baseParams,
        row_count: rowCount,
        date_month: dateMonth,
        page_number: String(page),
      });
      setMonthlyLoaded(true);
    },
    [getBaseParams, fetchMonthlySummary, monthlyPageSize],
  );

  // Load daily settle summary
  // Initial load: date_month is empty to get all data
  // Search: use selected date formatted as 'YYYY-MM-DD'
  const loadDailySettleSummary = useCallback(
    (
      page: number = 0,
      dateMonth: string = '',
      rowCount: number = dailySettlePageSize,
    ) => {
      const baseParams = getBaseParams();
      if (!baseParams) return;

      fetchDailySettleSummary({
        ...baseParams,
        row_count: rowCount,
        date_month: dateMonth,
        page_number: String(page),
      });
      setDailySettleLoaded(true);
    },
    [getBaseParams, fetchDailySettleSummary, dailySettlePageSize],
  );

  // Load data when node changes - only load daily (default tab)
  useEffect(() => {
    const nodeKey = selectedNode?.id ? `${selectedNode.id}-${sessionId}` : null;
    const navigationTimestamp = (location.state as { timestamp?: number })
      ?.timestamp;

    // Skip if no node selected
    if (!nodeKey) {
      return;
    }

    // If navigated via menu (has timestamp in state), force reload even for same node
    const shouldForceReload =
      navigationTimestamp && initialLoadRef.current === nodeKey;

    // Skip if already loaded for this node and not forcing reload
    if (initialLoadRef.current === nodeKey && !shouldForceReload) {
      return;
    }

    // Mark as loading for this node
    initialLoadRef.current = nodeKey;

    clearDashboard();

    // Reset date filters when node changes
    setDailyDate(null);
    setMonthlyDate(null);
    setDailySettleDate(null);

    // If this is auto-selected top node, reset the flag and continue to load daily tab data
    // Check by comparing with the auto-selected node ID (more reliable than boolean flag)
    if (autoSelectedNodeIdRef.current === selectedNode?.id) {
      autoSelectedNodeIdRef.current = null; // Reset the flag
    }

    // When node changes, always reset to 'daily' tab
    // This ensures consistent behavior and prevents other tab components from loading data
    const targetTab = 'daily';

    // Mark as loaded BEFORE setting active tab to prevent double loading
    if (targetTab === 'daily') {
      setDailyLoaded(true);
      setMonthlyLoaded(false);
      setDailySettleLoaded(false);
    } else if (targetTab === 'monthly') {
      setDailyLoaded(false);
      setMonthlyLoaded(true);
      setDailySettleLoaded(false);
    } else if (targetTab === 'settle') {
      setDailyLoaded(false);
      setMonthlyLoaded(false);
      setDailySettleLoaded(true);
    } else {
      setDailyLoaded(true);
      setMonthlyLoaded(false);
      setDailySettleLoaded(false);
    }
    setActiveTab(targetTab);

    // Initial load with empty date_month to get all data
    const baseParams = {
      hierarchy_user_id: selectedNode!.id,
      merchantId: !selectedNode!.children ? selectedNode!.merchantId || '' : '',
      disputeType: 'all',
      row_count:
        targetTab === 'monthly'
          ? monthlyPageSize
          : targetTab === 'settle'
            ? dailySettlePageSize
            : dailyPageSize,
      session_id: sessionId!,
    };

    // Load data for the target tab
    if (targetTab === 'monthly') {
      fetchMonthlySummary({
        ...baseParams,
        date_month: '',
        page_number: '0',
      });
    } else if (targetTab === 'settle') {
      fetchDailySettleSummary({
        ...baseParams,
        date_month: '',
        page_number: '0',
      });
    } else {
      fetchDailySummary({
        ...baseParams,
        date_month: '',
        page_number: '0',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedNode?.id,
    sessionId,
    clearDashboard,
    fetchDailySummary,
    fetchMonthlySummary,
    fetchDailySettleSummary,
    dailyPageSize,
    monthlyPageSize,
    dailySettlePageSize,
    setActiveTab,
    searchParams,
  ]);

  // Internal tab change handler - performs the actual data loading
  const executeTabChange = useCallback(
    (key: string, isSameTab: boolean, previousTab: string) => {
      // Cancel requests from the previous tab only (not the new tab)
      // This prevents canceling requests that the new tab component will make
      if (
        previousTab === 'daily' ||
        previousTab === 'monthly' ||
        previousTab === 'settle'
      ) {
        cancelAllDashboardRequests();
      } else if (previousTab === 'transaction') {
        cancelTransactionLookupRequests();
      } else if (previousTab === 'dispute') {
        cancelDisputeRequests();
      } else if (previousTab === 'alipay') {
        cancelAliDirectRequests();
      } else if (previousTab === 'multiFundings') {
        cancelMultiFundingsRequests();
      } else if (previousTab === 'reserve') {
        cancelReserveSummaryRequests();
      }

      if (key === 'daily') {
        if (!dailyLoaded || isSameTab) {
          // Clear search condition when refreshing
          if (isSameTab) {
            setDailyDate(null);
          }
          loadDailySummary(0);
          setDailyLoaded(true);
        }
      } else if (key === 'monthly') {
        if (!monthlyLoaded || isSameTab) {
          // Clear search condition when refreshing
          if (isSameTab) {
            setMonthlyDate(null);
          }
          loadMonthlySummary(0);
          setMonthlyLoaded(true);
        }
      } else if (key === 'settle') {
        if (!dailySettleLoaded || isSameTab) {
          // Clear search condition when refreshing
          if (isSameTab) {
            setDailySettleDate(null);
          }
          loadDailySettleSummary(0);
          setDailySettleLoaded(true);
        }
      } else if (key === 'transaction') {
        // TransactionLookup manages its own data, increment refresh key to trigger reload
        if (isSameTab) {
          // Clear store data first so component will reload when remounted
          clearTransactionLookup();
          setLookupRefreshKey((prev) => prev + 1);
        }
      } else if (key === 'dispute') {
        // DisputeSummary manages its own data, increment refresh key to trigger reload
        if (isSameTab) {
          // Clear store data first so component will reload when remounted
          clearDispute();
          setDisputeRefreshKey((prev) => prev + 1);
        }
      } else if (key === 'alipay') {
        // AliDirectSettlement manages its own data, increment refresh key to trigger reload
        if (isSameTab) {
          setAlipayRefreshKey((prev) => prev + 1);
        }
      } else if (key === 'multiFundings') {
        // MultiFundings manages its own data, increment refresh key to trigger reload
        if (isSameTab) {
          setMultiFundingsRefreshKey((prev) => prev + 1);
        }
      } else if (key === 'reserve') {
        // ReserveSummary manages its own data, increment refresh key to trigger reload
        if (isSameTab) {
          setReserveRefreshKey((prev) => prev + 1);
        }
      }
    },
    [
      dailyLoaded,
      monthlyLoaded,
      dailySettleLoaded,
      loadDailySummary,
      loadMonthlySummary,
      loadDailySettleSummary,
      clearTransactionLookup,
      clearDispute,
    ],
  );

  // Debounced tab change handler - prevents rapid consecutive API calls
  const debouncedExecuteTabChange = useMemo(
    () =>
      debounce((key: string, isSameTab: boolean, previousTab: string) => {
        executeTabChange(key, isSameTab, previousTab);
      }, 300),
    [executeTabChange],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedExecuteTabChange.cancel();
    };
  }, [debouncedExecuteTabChange]);

  // Handle tab change - update UI immediately, debounce data loading
  const handleTabChange = useCallback(
    (key: string) => {
      const isSameTab = key === activeTab;
      const previousTab = activeTab;

      // Update active tab immediately for responsive UI
      setActiveTab(key);

      // Debounce the actual data loading, pass previousTab for selective cancellation
      debouncedExecuteTabChange(key, isSameTab, previousTab);
    },
    [activeTab, debouncedExecuteTabChange, setActiveTab],
  );

  // Execute daily search - actual API call
  const executeDailySearch = useCallback(() => {
    setDailyPage(0);
    const dateMonth = dailyDate ? dailyDate.format('YYYY-MM-DD') : '';
    loadDailySummary(0, dateMonth);
  }, [dailyDate, setDailyPage, loadDailySummary]);

  // Execute monthly search - actual API call
  const executeMonthlySearch = useCallback(() => {
    setMonthlyPage(0);
    const dateMonth = monthlyDate ? monthlyDate.format('YYYYMM') : '';
    loadMonthlySummary(0, dateMonth);
  }, [monthlyDate, setMonthlyPage, loadMonthlySummary]);

  // Execute daily settle search - actual API call
  const executeDailySettleSearch = useCallback(() => {
    setDailySettlePage(0);
    const dateMonth = dailySettleDate
      ? dailySettleDate.format('YYYY-MM-DD')
      : '';
    loadDailySettleSummary(0, dateMonth);
  }, [dailySettleDate, setDailySettlePage, loadDailySettleSummary]);

  // Debounced search handlers
  const debouncedDailySearch = useMemo(
    () => debounce(() => executeDailySearch(), 300),
    [executeDailySearch],
  );

  const debouncedMonthlySearch = useMemo(
    () => debounce(() => executeMonthlySearch(), 300),
    [executeMonthlySearch],
  );

  const debouncedDailySettleSearch = useMemo(
    () => debounce(() => executeDailySettleSearch(), 300),
    [executeDailySettleSearch],
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedDailySearch.cancel();
      debouncedMonthlySearch.cancel();
      debouncedDailySettleSearch.cancel();
    };
  }, [
    debouncedDailySearch,
    debouncedMonthlySearch,
    debouncedDailySettleSearch,
  ]);

  // Handle daily date search with debounce
  const handleDailySearch = useCallback(() => {
    debouncedDailySearch();
  }, [debouncedDailySearch]);

  // Handle monthly date search with debounce
  const handleMonthlySearch = useCallback(() => {
    debouncedMonthlySearch();
  }, [debouncedMonthlySearch]);

  // Handle daily settle date search with debounce
  const handleDailySettleSearch = useCallback(() => {
    debouncedDailySettleSearch();
  }, [debouncedDailySettleSearch]);

  // Handle Daily Summary CSV download
  const handleDailyCSVDownload = useCallback(async () => {
    const baseParams = getBaseParams();
    if (!baseParams) return;

    setDownloadingDailyCSV(true);
    try {
      // Keep date_month empty to download all data
      const response = await summaryApi.downloadSummary({
        hierarchy_user_id: baseParams.hierarchy_user_id,
        merchantId: baseParams.merchantId,
        session_id: baseParams.session_id,
        search_type: 'daily',
        date_month: '',
        page_number: '0',
        row_count: 'all',
      });

      const csvContent = generateDailySummaryCSV(response);
      const filename = `DailySummary_${getDateTimeString()}.csv`;
      downloadCSV(csvContent, filename);
      message.success('CSV downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download CSV');
    } finally {
      setDownloadingDailyCSV(false);
    }
  }, [getBaseParams, message]);

  // Handle Monthly Summary CSV download
  const handleMonthlyCSVDownload = useCallback(async () => {
    const baseParams = getBaseParams();
    if (!baseParams) return;

    setDownloadingMonthlyCSV(true);
    try {
      // Keep date_month empty to download all data
      const response = await summaryApi.downloadSummary({
        hierarchy_user_id: baseParams.hierarchy_user_id,
        merchantId: baseParams.merchantId,
        session_id: baseParams.session_id,
        search_type: 'monthly',
        date_month: '',
        page_number: '0',
        row_count: 'all',
      });

      const csvContent = generateMonthlySummaryCSV(response);
      const filename = `MonthlySummary_${getDateTimeString()}.csv`;
      downloadCSV(csvContent, filename);
      message.success('CSV downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download CSV');
    } finally {
      setDownloadingMonthlyCSV(false);
    }
  }, [getBaseParams, message]);

  // Handle Daily Summary PDF download
  const handleDailyPDFDownload = useCallback(async () => {
    const baseParams = getBaseParams();
    if (!baseParams) return;

    setDownloadingDailyPDF(true);
    try {
      const blob = await summaryApi.downloadSummaryPDF({
        hierarchy_user_id: baseParams.hierarchy_user_id,
        merchantId: baseParams.merchantId,
        session_id: baseParams.session_id,
        search_type: 'daily',
        date_month: '',
        page_number: '0',
        row_count: 'all',
        method: 'pdf',
      });

      const filename = `DailySummary_${getDateTimeString()}.pdf`;
      downloadPDF(blob, filename);
      message.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download PDF');
    } finally {
      setDownloadingDailyPDF(false);
    }
  }, [getBaseParams, message]);

  // Handle Monthly Summary PDF download
  const handleMonthlyPDFDownload = useCallback(async () => {
    const baseParams = getBaseParams();
    if (!baseParams) return;

    setDownloadingMonthlyPDF(true);
    try {
      const blob = await summaryApi.downloadSummaryPDF({
        hierarchy_user_id: baseParams.hierarchy_user_id,
        merchantId: baseParams.merchantId,
        session_id: baseParams.session_id,
        search_type: 'monthly',
        date_month: '',
        page_number: '0',
        row_count: 'all',
        method: 'pdf',
      });

      const filename = `MonthlySummary_${getDateTimeString()}.pdf`;
      downloadPDF(blob, filename);
      message.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download PDF');
    } finally {
      setDownloadingMonthlyPDF(false);
    }
  }, [getBaseParams, message]);

  // Handle Daily Settle Summary CSV download
  const handleDailySettleCSVDownload = useCallback(async () => {
    const baseParams = getBaseParams();
    if (!baseParams) return;

    setDownloadingDailySettleCSV(true);
    try {
      // Keep date_month empty to download all data
      const response = await summaryApi.downloadSummary({
        hierarchy_user_id: baseParams.hierarchy_user_id,
        merchantId: baseParams.merchantId,
        session_id: baseParams.session_id,
        search_type: 'daily_settle',
        date_month: '',
        page_number: '0',
        row_count: 'all',
      });

      const csvContent = generateDailySettleSummaryCSV(
        response,
        showMethodColumn,
      );
      const filename = `DailySettleSummary_${getDateTimeString()}.csv`;
      downloadCSV(csvContent, filename);
      message.success('CSV downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Failed to download CSV');
    } finally {
      setDownloadingDailySettleCSV(false);
    }
  }, [getBaseParams, showMethodColumn, message]);

  // Handle Daily Settle Summary PDF download (placeholder - to be implemented)
  const handleDailySettlePDFDownload = useCallback(async () => {
    setDownloadingDailySettlePDF(true);
    try {
      // TODO: Implement PDF generation
      message.info('PDF download feature coming soon');
    } finally {
      setDownloadingDailySettlePDF(false);
    }
  }, [message]);

  // Handle daily page change - use current filter date
  const handleDailyPageChange = useCallback(
    (page: number) => {
      setDailyPage(page);
      const dateMonth = dailyDate ? dailyDate.format('YYYY-MM-DD') : '';
      loadDailySummary(page, dateMonth);
    },
    [setDailyPage, loadDailySummary, dailyDate],
  );

  // Handle daily page size change - reset to first page
  const handleDailyPageSizeChange = useCallback(
    (pageSize: number) => {
      setDailyPageSize(pageSize);
      const dateMonth = dailyDate ? dailyDate.format('YYYY-MM-DD') : '';
      loadDailySummary(0, dateMonth, pageSize);
    },
    [setDailyPageSize, loadDailySummary, dailyDate],
  );

  // Handle monthly page change - use current filter date
  const handleMonthlyPageChange = useCallback(
    (page: number) => {
      setMonthlyPage(page);
      const dateMonth = monthlyDate ? monthlyDate.format('YYYYMM') : '';
      loadMonthlySummary(page, dateMonth);
    },
    [setMonthlyPage, loadMonthlySummary, monthlyDate],
  );

  // Handle monthly page size change - reset to first page
  const handleMonthlyPageSizeChange = useCallback(
    (pageSize: number) => {
      setMonthlyPageSize(pageSize);
      const dateMonth = monthlyDate ? monthlyDate.format('YYYYMM') : '';
      loadMonthlySummary(0, dateMonth, pageSize);
    },
    [setMonthlyPageSize, loadMonthlySummary, monthlyDate],
  );

  // Handle daily settle page change - use current filter date
  const handleDailySettlePageChange = useCallback(
    (page: number) => {
      setDailySettlePage(page);
      const dateMonth = dailySettleDate
        ? dailySettleDate.format('YYYY-MM-DD')
        : '';
      loadDailySettleSummary(page, dateMonth);
    },
    [setDailySettlePage, loadDailySettleSummary, dailySettleDate],
  );

  // Handle daily settle page size change - reset to first page
  const handleDailySettlePageSizeChange = useCallback(
    (pageSize: number) => {
      setDailySettlePageSize(pageSize);
      const dateMonth = dailySettleDate
        ? dailySettleDate.format('YYYY-MM-DD')
        : '';
      loadDailySettleSummary(0, dateMonth, pageSize);
    },
    [setDailySettlePageSize, loadDailySettleSummary, dailySettleDate],
  );

  // Get hasDisputeChild and hasReserve from node shared info (persisted)
  const { hasDisputeChild, hasReserve } = nodeSharedInfo;

  // Check if should show content for daily/monthly summary (not showing "go to node page" tip)
  // Logic: isMultiCurrency === false OR merchantId has value (isLeafNode)
  const shouldShowDailySummaryContent = useMemo(() => {
    if (isLeafNode) return true;
    if (dailySummary && dailySummary.isMultiCurrency === false) return true;
    return false;
  }, [dailySummary, isLeafNode]);

  const shouldShowMonthlySummaryContent = useMemo(() => {
    if (isLeafNode) return true;
    if (monthlySummary && monthlySummary.isMultiCurrency === false) return true;
    return false;
  }, [monthlySummary, isLeafNode]);

  // Filter tabs based on user config and node properties
  const tabItems = useMemo(() => {
    // Tab items with icons
    const allTabItems = [
      {
        key: 'daily',
        label: (
          <span>
            <CalendarOutlined style={{ marginRight: 6 }} />
            Daily Summary
          </span>
        ),
        children: (
          <>
            {shouldShowDailySummaryContent && (
              <DateFilter
                type="daily"
                value={dailyDate}
                onChange={setDailyDate}
                onSearch={handleDailySearch}
                loading={dailySummaryLoading}
              />
            )}
            <DailySummaryTable
              data={dailySummary}
              loading={dailySummaryLoading}
              error={dailySummaryError}
              page={dailyPage}
              pageSize={dailyPageSize}
              onPageChange={handleDailyPageChange}
              onPageSizeChange={handleDailyPageSizeChange}
              merchantId={isLeafNode ? selectedNode?.merchantId : undefined}
            />
            <DownloadButtons
              hasData={
                Boolean(dailySummary?.transactions?.length) &&
                shouldShowDailySummaryContent
              }
              onDownloadCSV={handleDailyCSVDownload}
              downloadingCSV={downloadingDailyCSV}
              onDownloadPDF={handleDailyPDFDownload}
              downloadingPDF={downloadingDailyPDF}
            />
          </>
        ),
      },
      {
        key: 'monthly',
        label: (
          <span>
            <BarChartOutlined style={{ marginRight: 6 }} />
            Monthly Summary
          </span>
        ),
        children: (
          <>
            {shouldShowMonthlySummaryContent && (
              <DateFilter
                type="monthly"
                value={monthlyDate}
                onChange={setMonthlyDate}
                onSearch={handleMonthlySearch}
                loading={monthlySummaryLoading}
              />
            )}
            <MonthlySummaryTable
              data={monthlySummary}
              loading={monthlySummaryLoading}
              error={monthlySummaryError}
              page={monthlyPage}
              pageSize={monthlyPageSize}
              onPageChange={handleMonthlyPageChange}
              onPageSizeChange={handleMonthlyPageSizeChange}
              merchantId={isLeafNode ? selectedNode?.merchantId : undefined}
            />
            <DownloadButtons
              hasData={
                Boolean(monthlySummary?.transactions?.length) &&
                shouldShowMonthlySummaryContent
              }
              onDownloadCSV={handleMonthlyCSVDownload}
              downloadingCSV={downloadingMonthlyCSV}
              onDownloadPDF={handleMonthlyPDFDownload}
              downloadingPDF={downloadingMonthlyPDF}
            />
          </>
        ),
      },
      {
        key: 'transaction',
        label: (
          <span>
            <SearchOutlined style={{ marginRight: 6 }} />
            Transaction Lookup
          </span>
        ),
        children: <TransactionLookup refreshKey={lookupRefreshKey} />,
      },
      {
        key: 'settle',
        label: (
          <span>
            <BankOutlined style={{ marginRight: 6 }} />
            Daily Settle Summary
          </span>
        ),
        children: (
          <>
            <DateFilter
              type="daily"
              value={dailySettleDate}
              onChange={setDailySettleDate}
              onSearch={handleDailySettleSearch}
              loading={dailySettleSummaryLoading}
            />
            <DailySettleSummaryTable
              data={dailySettleSummary}
              loading={dailySettleSummaryLoading}
              error={dailySettleSummaryError}
              page={dailySettlePage}
              pageSize={dailySettlePageSize}
              onPageChange={handleDailySettlePageChange}
              onPageSizeChange={handleDailySettlePageSizeChange}
              showMethodColumn={showMethodColumn}
              merchantId={selectedNode?.merchantId}
            />
            <DownloadButtons
              hasData={Boolean(dailySettleSummary?.transactions?.length)}
              onDownloadCSV={handleDailySettleCSVDownload}
              downloadingCSV={downloadingDailySettleCSV}
              onDownloadPDF={handleDailySettlePDFDownload}
              downloadingPDF={downloadingDailySettlePDF}
            />
          </>
        ),
      },
      {
        key: 'dispute',
        label: (
          <span>
            <ExclamationCircleOutlined style={{ marginRight: 6 }} />
            Dispute Summary
          </span>
        ),
        children: <DisputeSummary key={disputeRefreshKey} />,
      },
      {
        key: 'alipay',
        label: (
          <span>
            <AlipayCircleOutlined style={{ marginRight: 6 }} />
            Alipay Direct Settlement
          </span>
        ),
        children: <AliDirectSettlement key={alipayRefreshKey} />,
      },
      {
        key: 'multiFundings',
        label: (
          <span>
            <DollarOutlined style={{ marginRight: 6 }} />
            Multi Fundings
          </span>
        ),
        children: <MultiFundings refreshKey={multiFundingsRefreshKey} />,
      },
      {
        key: 'reserve',
        label: (
          <span>
            <SafetyOutlined style={{ marginRight: 6 }} />
            Reserve Summary
          </span>
        ),
        children: <ReserveSummary refreshKey={reserveRefreshKey} />,
      },
      {
        key: 'smartGateway',
        label: (
          <span>
            <ApiOutlined style={{ marginRight: 6 }} />
            Smart Gateway
          </span>
        ),
        children: <ComingSoon title="Smart Gateway" />,
      },
    ];

    return allTabItems.filter((tab) => {
      switch (tab.key) {
        case 'daily':
          // Shown by default, hidden when: userConfig.daily_summary_disable === true
          return userConfig.daily_summary_disable !== true;

        case 'monthly':
          // Shown by default, hidden when: userConfig.monthly_summary_disable === true
          return userConfig.monthly_summary_disable !== true;

        case 'transaction':
          // Shown by default, hidden when: merchantId is empty or userConfig.transactions_lookup_disable === true
          if (!selectedNode?.merchantId) return false;
          return userConfig.transactions_lookup_disable !== true;

        case 'settle':
          // Hidden when: merchantId is empty
          return Boolean(selectedNode?.merchantId);

        case 'dispute':
          // Display conditions:
          // 1. Node must have merchantId bound
          // 2. userConfig.daily_dispute_summary_disable === false AND hasDisputeChild === true
          // 3. OR userConfig.dispute_manage === true
          if (!selectedNode?.merchantId) return false;
          if (userConfig.dispute_manage === true) return true;
          if (
            userConfig.daily_dispute_summary_disable === false &&
            hasDisputeChild
          )
            return true;
          return false;

        case 'alipay':
          // Display condition: node's hasAliDirect property is not empty and not 0
          return Boolean(selectedNode?.hasAliDirect);

        case 'multiFundings':
          // Display condition: node's hasMultiFundings property is not empty and not 0
          return Boolean(selectedNode?.hasMultiFundings);

        case 'reserve':
          // Display condition: userConfig.reserve_summary_disable === false AND hasReserve === true
          if (userConfig.reserve_summary_disable === false && hasReserve)
            return true;
          return false;

        case 'smartGateway':
          // Temporarily hidden for all users
          return false;

        default:
          return true;
      }
    });
  }, [
    userConfig,
    selectedNode,
    hasDisputeChild,
    hasReserve,
    dailyDate,
    dailySummary,
    dailySummaryLoading,
    dailySummaryError,
    dailyPage,
    dailyPageSize,
    handleDailyPageChange,
    handleDailyPageSizeChange,
    handleDailySearch,
    handleDailyCSVDownload,
    handleDailyPDFDownload,
    downloadingDailyCSV,
    downloadingDailyPDF,
    isLeafNode,
    monthlyDate,
    monthlySummary,
    monthlySummaryLoading,
    monthlySummaryError,
    monthlyPage,
    monthlyPageSize,
    handleMonthlyPageChange,
    handleMonthlyPageSizeChange,
    handleMonthlySearch,
    handleMonthlyCSVDownload,
    handleMonthlyPDFDownload,
    downloadingMonthlyCSV,
    downloadingMonthlyPDF,
    lookupRefreshKey,
    dailySettleDate,
    dailySettleSummary,
    dailySettleSummaryLoading,
    dailySettleSummaryError,
    dailySettlePage,
    dailySettlePageSize,
    handleDailySettlePageChange,
    handleDailySettlePageSizeChange,
    handleDailySettleSearch,
    handleDailySettleCSVDownload,
    handleDailySettlePDFDownload,
    downloadingDailySettleCSV,
    downloadingDailySettlePDF,
    showMethodColumn,
    disputeRefreshKey,
    alipayRefreshKey,
    multiFundingsRefreshKey,
    reserveRefreshKey,
    shouldShowDailySummaryContent,
    shouldShowMonthlySummaryContent,
  ]);

  return (
    <div className="dashboard-page">
      {selectedNode ? (
        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
          {/* Node Info - Compact */}
          <Space size="small" align="center" wrap>
            {isLeafNode ? (
              <ShopOutlined style={{ fontSize: 16, color: primaryColor }} />
            ) : (
              <ApartmentOutlined style={{ fontSize: 16, color: '#52c41a' }} />
            )}
            <Text strong style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.85)' }}>
              {selectedNode.value}
            </Text>
            {selectedNode.merchantId && (
              <>
                <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>|</Text>
                <Text style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.65)' }}>
                  MID: {selectedNode.merchantId}
                </Text>
              </>
            )}
            <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>|</Text>
            <Text style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.65)' }}>
              {isLeafNode ? 'Merchant' : 'Group'}
            </Text>
          </Space>

          {/* Summary Tabs */}
          <Card size="small" styles={{ body: { padding: '12px' } }}>
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onTabClick={handleTabChange}
              size="middle"
              tabBarStyle={{ marginBottom: 16 }}
              destroyOnHidden={true}
            />
          </Card>
        </Space>
      ) : (
        <Card size="small">
          <Text style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
            Please select a merchant from the tree menu to view details.
          </Text>
        </Card>
      )}
    </div>
  );
};
