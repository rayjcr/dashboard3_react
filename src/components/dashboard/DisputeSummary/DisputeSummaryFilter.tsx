import React from 'react';
import { DatePicker, Input, Button, Space, Typography } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useThemeStore } from '@/stores';
import '../dashboard.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DisputeSummaryFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchKey: string;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onSearchKeyChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const DisputeSummaryFilter: React.FC<DisputeSummaryFilterProps> = ({
  startDate,
  endDate,
  searchKey,
  onDateRangeChange,
  onSearchKeyChange,
  onSearch,
  loading = false,
}) => {
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  return (
    <div className="date-filter-container">
      <div className="date-filter-content">
        <Space size="middle" align="center" wrap>
          {/* Date Range */}
          <Space size="small" align="center">
            <CalendarOutlined style={{ color: primaryColor }} />
            <Text strong style={{ fontSize: 13 }}>
              Date Range:
            </Text>
          </Space>
          <RangePicker
            value={[startDate, endDate]}
            onChange={(dates) =>
              onDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)
            }
            allowClear
            style={{ width: 280 }}
          />

          {/* Search Key */}
          <Space size="small" align="center">
            <Text strong style={{ fontSize: 13 }}>
              Keyword:
            </Text>
          </Space>
          <Input
            placeholder="Search case ID, transaction ID..."
            value={searchKey}
            onChange={(e) => onSearchKeyChange(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />

          {/* Search Button */}
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={onSearch}
            loading={loading}
          >
            Search
          </Button>
        </Space>
      </div>
    </div>
  );
};
