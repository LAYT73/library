import React from 'react';
import { Table as AntTable } from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import type { Book as BookType } from '../../shared/types';

interface BookTableProps {
  books: BookType[];
  loading?: boolean;
  onRowClick?: (book: BookType) => void;
  pagination?: TablePaginationConfig | false;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  loading,
  onRowClick,
  pagination = false,
}) => {
  const columns: TableColumnsType<BookType> = [
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Автор',
      key: 'author',
      width: 180,
      ellipsis: true,
      render: (_: unknown, record: BookType) => record.author?.fullName ?? '—',
    },
    {
      title: 'Издатель',
      dataIndex: 'publisher',
      key: 'publisher',
    },
    {
      title: 'Год',
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
      pagination={pagination}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
      })}
    />
  );
};
