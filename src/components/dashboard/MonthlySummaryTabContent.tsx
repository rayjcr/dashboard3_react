import React, { memo } from 'react';
import type { Dayjs } from 'dayjs';
import type { SummaryResponse } from '@/types/dashboard';
import { DateFilter } from './DateFilter';
import { MonthlySummaryTable } from './MonthlySummaryTable';
import { DownloadButtons } from './DownloadButtons';

interface MonthlySummaryTabContentProps {
  /** Whether to show date filter and enable download (false = multi-currency parent node) */
  shouldShowContent: boolean;
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
  /** Merchant ID (only for leaf nodes) */
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

export const MonthlySummaryTabContent: React.FC<MonthlySummaryTabContentProps> =
  memo(
    ({
      shouldShowContent,
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
      merchantId,
      onDownloadCSV,
      downloadingCSV,
      onDownloadPDF,
      downloadingPDF,
    }) => (
      <>
        {shouldShowContent && (
          <DateFilter
            type="monthly"
            value={date}
            onChange={onDateChange}
            onSearch={onSearch}
            loading={loading}
          />
        )}
        <MonthlySummaryTable
          data={data}
          loading={loading}
          error={error}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          merchantId={merchantId}
        />
        <DownloadButtons
          hasData={Boolean(data?.transactions?.length) && shouldShowContent}
          onDownloadCSV={onDownloadCSV}
          downloadingCSV={downloadingCSV}
          onDownloadPDF={onDownloadPDF}
          downloadingPDF={downloadingPDF}
        />
      </>
    ),
  );

MonthlySummaryTabContent.displayName = 'MonthlySummaryTabContent';
