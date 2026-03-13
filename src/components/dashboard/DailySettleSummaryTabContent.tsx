import React, { memo } from 'react';
import type { Dayjs } from 'dayjs';
import type { SummaryResponse } from '@/types/dashboard';
import { DateFilter } from './DateFilter';
import { DailySettleSummaryTable } from './DailySettleSummaryTable';
import { DownloadButtons } from './DownloadButtons';

interface DailySettleSummaryTabContentProps {
  /** Selected date */
  date: Dayjs | null;
  /** Date change handler */
  onDateChange: (date: Dayjs | null) => void;
  /** Search handler */
  onSearch: () => void;
  /** Summary data */
  data: SummaryResponse | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Current page */
  page: number;
  /** Page size */
  pageSize: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange: (pageSize: number) => void;
  /** Whether to show Method column */
  showMethodColumn: boolean;
  /** Merchant ID (optional, for detail page navigation) */
  merchantId?: string;
  /** CSV download handler */
  onDownloadCSV: () => void;
  /** CSV downloading state */
  downloadingCSV: boolean;
  /** PDF download handler */
  onDownloadPDF: () => void;
  /** PDF downloading state */
  downloadingPDF: boolean;
}

export const DailySettleSummaryTabContent: React.FC<DailySettleSummaryTabContentProps> =
  memo(
    ({
      date,
      onDateChange,
      onSearch,
      data,
      loading,
      error,
      page,
      pageSize,
      onPageChange,
      onPageSizeChange,
      showMethodColumn,
      merchantId,
      onDownloadCSV,
      downloadingCSV,
      onDownloadPDF,
      downloadingPDF,
    }) => (
      <>
        <DateFilter
          type="daily"
          value={date}
          onChange={onDateChange}
          onSearch={onSearch}
          loading={loading}
        />
        <DailySettleSummaryTable
          data={data}
          loading={loading}
          error={error}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          showMethodColumn={showMethodColumn}
          merchantId={merchantId}
        />
        <DownloadButtons
          hasData={Boolean(data?.transactions?.length)}
          onDownloadCSV={onDownloadCSV}
          downloadingCSV={downloadingCSV}
          onDownloadPDF={onDownloadPDF}
          downloadingPDF={downloadingPDF}
        />
      </>
    ),
  );

DailySettleSummaryTabContent.displayName = 'DailySettleSummaryTabContent';
