import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Spin, Empty } from 'antd';
import { useBook } from '../../shared/hooks/useBooks';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams();
  const bookId = Number(id);
  const { data, isLoading } = useBook(bookId);

  if (isLoading) return (
    <AppLayout>
      <Spin size="large" />
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <Empty description="Книга не найдена" />
    </AppLayout>
  );

  return (
    <AppLayout>
      <Card title={data.title}>
        <p><strong>ISBN:</strong> {data.isbn}</p>
        <p><strong>Издатель:</strong> {data.publisher}</p>
        <p><strong>Год:</strong> {data.year}</p>
        <p><strong>Автор:</strong> {data.author?.fullName || 'Неизвестен'}</p>
      </Card>
    </AppLayout>
  );
};

export default BookDetailsPage;
