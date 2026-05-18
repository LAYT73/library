import React from 'react';
import { Table as AntTable, Tag, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Copy } from '../../shared/types';

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Доступен',
  ISSUED: 'Выдан',
  WRITTEN_OFF: 'Списан',
  LOST: 'Утерян',
};

interface Props {
  copies: Copy[];
  loading?: boolean;
  onRowClick?: (c: Copy) => void;
  onChangeStatus?: (c: Copy) => void;
}

export const CopyTable: React.FC<Props> = ({ copies, loading, onRowClick, onChangeStatus }) => {
  const columns: TableColumnsType<Copy> = [
    { title: 'Инв. №', dataIndex: 'inventoryNumber', key: 'inventoryNumber' },
    { title: 'ID книги', dataIndex: 'bookId', key: 'bookId' },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (s: string) => <Tag>{statusLabels[s] ?? s}</Tag> },
    {
      title: 'Действия',
      key: 'actions',
      render: (_v, record) => (
        <Button size="small" onClick={() => onChangeStatus?.(record)}>Изменить статус</Button>
      ),
    },
  ];

  return (
    <AntTable
      columns={columns}
      dataSource={copies}
      loading={loading}
      rowKey="id"
      onRow={(record) => ({ onClick: () => onRowClick?.(record) })}
    />
  );
};

export default CopyTable;
