import React, { memo } from 'react';
import { DatePicker, Button, Space, Typography } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useThemeStore } from '@/stores';
import './dashboard.css';

const { Text } = Typography;

interface DateFilterProps {
  /** Filter type: daily uses date picker, monthly uses month picker */
  type: 'daily' | 'monthly';
  /** Currently selected date */
  value: Dayjs | null;
  /** Date change callback */
  onChange: (date: Dayjs | null) => void;
  /** Search button click callback */
  onSearch: () => void;
  /** Whether loading */
  loading?: boolean;
}

export const DateFilter: React.FC<DateFilterProps> = memo(
  ({ type, value, onChange, onSearch, loading = false }) => {
    const { currentTheme } = useThemeStore();
    const primaryColor = currentTheme === 'dark' ? '#7c3aed' : '#1890ff';

    return (
      <div className="date-filter-container">
        <div className="date-filter-content">
          <Space size="middle" align="center">
            <Space size="small" align="center">
              <CalendarOutlined style={{ color: primaryColor }} />
              <Text strong style={{ fontSize: 13 }}>
                {type === 'daily' ? 'Date:' : 'Month:'}
              </Text>
            </Space>
            {type === 'daily' ? (
              <DatePicker
                value={value}
                onChange={onChange}
                placeholder="Select date"
                allowClear
                style={{ width: 150 }}
              />
            ) : (
              <DatePicker
                picker="month"
                value={value}
                onChange={onChange}
                placeholder="Select month"
                allowClear
                style={{ width: 150 }}
              />
            )}
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
  },
);

DateFilter.displayName = 'DateFilter';
