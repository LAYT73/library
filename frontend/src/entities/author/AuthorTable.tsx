import React from 'react';
import { Table as AntTable } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Author } from '../../shared/types';

interface Props {
  authors: Author[];
  loading?: boolean;
  onRowClick?: (a: Author) => void;
}

export const AuthorTable: React.FC<Props> = ({ authors, loading, onRowClick }) => {
  const columns: TableColumnsType<Author> = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'ФИО', dataIndex: 'fullName', key: 'fullName' },
  ];

  return (
    <AntTable
      columns={columns}
      dataSource={authors}
      loading={loading}
      rowKey="id"
      onRow={(record) => ({ onClick: () => onRowClick?.(record) })}
    />
  );
};

export default AuthorTable;
