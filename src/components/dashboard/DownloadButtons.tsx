import React, { memo } from 'react';
import { Button, Space, Divider } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores';

interface DownloadButtonsProps {
  /** Whether there is data (buttons are not shown when no data) */
  hasData?: boolean;
  /** Download CSV click callback */
  onDownloadCSV?: () => void;
  /** Whether CSV is downloading */
  downloadingCSV?: boolean;
  /** Download PDF click callback */
  onDownloadPDF?: () => void;
  /** Whether PDF is downloading */
  downloadingPDF?: boolean;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = memo(
  ({
    hasData = true,
    onDownloadCSV,
    downloadingCSV = false,
    onDownloadPDF,
    downloadingPDF = false,
  }) => {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme === 'dark';
    const primaryColor = isDark ? '#7c3aed' : '#1890ff';

    const hasButtons = onDownloadCSV || onDownloadPDF;

    // If no buttons or no data, don't show
    if (!hasButtons || !hasData) return null;

    return (
      <>
        <Divider style={{ margin: '12px 0 0 0' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            padding: '12px 0',
          }}
        >
          <Space size="small">
            {onDownloadCSV && (
              <Button
                icon={<DownloadOutlined />}
                onClick={onDownloadCSV}
                loading={downloadingCSV}
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Download CSV
              </Button>
            )}
            {onDownloadPDF && (
              <Button
                icon={<FilePdfOutlined />}
                onClick={onDownloadPDF}
                loading={downloadingPDF}
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Download PDF
              </Button>
            )}
          </Space>
        </div>
      </>
    );
  },
);

DownloadButtons.displayName = 'DownloadButtons';
