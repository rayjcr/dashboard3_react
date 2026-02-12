import React, { useState, useEffect } from 'react';
import { Popover, Button, Checkbox, Space, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import {
  CONFIGURABLE_COLUMNS,
  getDefaultVisibleColumns,
} from '@/types/dashboard';

interface ColumnConfigPopoverProps {
  visibleColumns: string[];
  onVisibleColumnsChange: (columns: string[]) => void;
}

export const ColumnConfigPopover: React.FC<ColumnConfigPopoverProps> = ({
  visibleColumns,
  onVisibleColumnsChange,
}) => {
  const [open, setOpen] = useState(false);
  const [localColumns, setLocalColumns] = useState<string[]>(visibleColumns);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalColumns(visibleColumns);
  }, [visibleColumns]);

  // Handle checkbox change
  const handleCheckboxChange = (columnKey: string, checked: boolean) => {
    if (checked) {
      setLocalColumns([...localColumns, columnKey]);
    } else {
      setLocalColumns(localColumns.filter((key) => key !== columnKey));
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    setLocalColumns(CONFIGURABLE_COLUMNS.map((col) => col.key));
  };

  // Handle clear all
  const handleClearAll = () => {
    setLocalColumns([]);
  };

  // Handle reset to default
  const handleResetDefault = () => {
    setLocalColumns(getDefaultVisibleColumns());
  };

  // Handle apply
  const handleApply = () => {
    onVisibleColumnsChange(localColumns);
    setOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setLocalColumns(visibleColumns);
    setOpen(false);
  };

  const content = (
    <div style={{ width: 280 }}>
      <div style={{ marginBottom: 8 }}>
        <Space size="small">
          <Button size="small" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="small" onClick={handleClearAll}>
            Clear All
          </Button>
          <Button size="small" onClick={handleResetDefault}>
            Reset
          </Button>
        </Space>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div
        style={{
          maxHeight: 300,
          overflowY: 'auto',
          paddingRight: 8,
        }}
      >
        {CONFIGURABLE_COLUMNS.map((column) => (
          <div key={column.key} style={{ marginBottom: 6 }}>
            <Checkbox
              checked={localColumns.includes(column.key)}
              onChange={(e) =>
                handleCheckboxChange(column.key, e.target.checked)
              }
            >
              {column.title}
            </Checkbox>
          </div>
        ))}
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'right' }}>
        <Space size="small">
          <Button size="small" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="small" type="primary" onClick={handleApply}>
            Apply
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Column Settings"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Button icon={<SettingOutlined />}>Columns</Button>
    </Popover>
  );
};
