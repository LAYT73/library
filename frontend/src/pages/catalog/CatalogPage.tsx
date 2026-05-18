import React from 'react';
import { Spin, Empty, Pagination, Button, Modal, Form, Input, InputNumber } from 'antd';
import { useBooks } from '../../shared/hooks/useBooks';
import { BookTable } from '../../entities/book/BookTable';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { useCreateBook } from '../../entities/book/api';
import { useNavigate } from 'react-router-dom';

export const CatalogPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useBooks(skip, 25);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = React.useState(false);
  const createBook = useCreateBook();
  const [form] = Form.useForm();

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
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Добавить книгу
        </Button>
      </div>

      <Modal
        title="Создать книгу"
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          await createBook.mutateAsync({
            isbn: values.isbn,
            title: values.title,
            publisher: values.publisher,
            year: values.year,
            authorId: Number(values.authorId),
          });
          form.resetFields();
          setModalOpen(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="isbn" label="ISBN" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="Издатель" rules={[{ required: true }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="year" label="Год" rules={[{ required: true }]}> 
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="authorId" label="ID автора" rules={[{ required: true }]}> 
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

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
