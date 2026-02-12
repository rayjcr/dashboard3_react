import React from 'react';
import { DatePicker, Button, Space, Typography } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useThemeStore } from '@/stores';
import '../dashboard.css';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface AliDirectFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const AliDirectFilter: React.FC<AliDirectFilterProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  onSearch,
  loading = false,
}) => {
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

  return (
    <div className="date-filter-container">
      <div
        className="date-filter-content"
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
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
