import React from 'react';
import { Table as AntTable } from 'antd';
import type { TableColumnsType } from 'antd';
import type { Book as BookType } from '../../shared/types';

interface BookTableProps {
  books: BookType[];
  loading?: boolean;
  onRowClick?: (book: BookType) => void;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  loading,
  onRowClick,
}) => {
  const columns: TableColumnsType<BookType> = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Publisher',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
  ];

  return (
    <AntTable
      columns={columns}
      dataSource={books}
      loading={loading}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
      })}
    />
  );
};
