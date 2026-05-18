import React from 'react';
import { Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  extra?: React.ReactNode;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Поиск...',
  filters,
  extra,
}) => (
  <div
    style={{
      marginBottom: 16,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Space wrap>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 280 }}
      />
      {filters}
    </Space>
    {extra}
  </div>
);
