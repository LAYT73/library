import React from 'react';
import { Table as AntTable, Tag, Button } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import type { Copy } from '../../shared/types';
import { formatCopyStatus } from '../../shared/lib/formatters';

interface Props {
  copies: Copy[];
  loading?: boolean;
  onRowClick?: (c: Copy) => void;
  onChangeStatus?: (c: Copy) => void;
  pagination?: TablePaginationConfig | false;
}

export const CopyTable: React.FC<Props> = ({ copies, loading, onRowClick, onChangeStatus, pagination = false }) => {
  const columns: TableColumnsType<Copy> = [
    { title: 'Инв. №', dataIndex: 'inventoryNumber', key: 'inventoryNumber', width: 90 },
    {
      title: 'Книга',
      key: 'title',
      render: (_: unknown, record: Copy) => record.book?.title ?? `Книга #${record.bookId}`,
    },
    {
      title: 'ISBN',
      key: 'isbn',
      width: 140,
      render: (_: unknown, record: Copy) => record.book?.isbn ?? '—',
    },
    {
      title: 'Автор',
      key: 'author',
      width: 160,
      render: (_: unknown, record: Copy) => record.book?.author?.fullName ?? '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s: string) => <Tag>{formatCopyStatus(s)}</Tag>,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 140,
      render: (_v, record) => (
        <Button size="small" onClick={(e) => { e.stopPropagation(); onChangeStatus?.(record); }}>
          Изменить статус
        </Button>
      ),
    },
  ];

  return (
    <AntTable
      columns={columns}
      dataSource={copies}
      loading={loading}
      rowKey="id"
      scroll={{ x: 800 }}
      pagination={pagination}
      onRow={(record) => ({ onClick: () => onRowClick?.(record) })}
    />
  );
};

export default CopyTable;
