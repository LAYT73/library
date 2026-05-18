import React from 'react';
import { Spin, Empty, Pagination, Button } from 'antd';
import { useBooks } from '../../shared/hooks/useBooks';
import { BookTable } from '../../entities/book/BookTable';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

export const CatalogPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useBooks(skip, 25);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <AppLayout>
        <Spin size="large" />
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <Empty description="No books found" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => navigate('/catalog/create')}>
          Add Book
        </Button>
      </div>

      <BookTable
        books={data.data}
        loading={isLoading}
        onRowClick={(book) => navigate(`/catalog/${book.id}`)}
      />

      <Pagination
        current={data.page}
        total={data.total}
        pageSize={data.pageSize}
        onChange={(page) => setSkip((page - 1) * data.pageSize)}
        style={{ marginTop: 16, textAlign: 'right' }}
      />
    </AppLayout>
  );
};
