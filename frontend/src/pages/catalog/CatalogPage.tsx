import React from 'react';
import { Spin, Empty, Button, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useBooks } from '../../shared/hooks/useBooks';
import { useAuthors } from '../../entities/author/api';
import { useKnowledgeAreas } from '../../entities/knowledgeArea/api';
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
  const { data: authorsData } = useAuthors(0, 1000);
  const { data: areasData } = useKnowledgeAreas(0, 1000);

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
          try {
            const values = await form.validateFields();
            await createBook.mutateAsync({
              isbn: values.isbn,
              title: values.title,
              publisher: values.publisher,
              year: values.year,
              authorId: Number(values.authorId),
              knowledgeAreaIds: values.knowledgeAreaIds?.map((id: number) => Number(id)),
            });
            message.success('Книга создана');
            form.resetFields();
            setModalOpen(false);
          } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string | string[] } } };
            const msg = err.response?.data?.message;
            message.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Не удалось создать книгу');
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="isbn" label="ISBN" rules={[{ required: true }]}> 
            <Input placeholder="Например: 978-5-907123-45-6" />
          </Form.Item>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}> 
            <Input placeholder="Например: Введение в алгоритмы" />
          </Form.Item>
          <Form.Item name="publisher" label="Издатель" rules={[{ required: true }]}> 
            <Input placeholder="Например: O'Reilly" />
          </Form.Item>
          <Form.Item name="year" label="Год" rules={[{ required: true }]}> 
            <InputNumber style={{ width: '100%' }} placeholder="Например: 2020" />
          </Form.Item>
          <Form.Item name="authorId" label="Автор" rules={[{ required: true }]}> 
            <Select placeholder="Выберите автора">
              {authorsData?.data?.map((a: any) => (<Select.Option key={a.id} value={a.id}>{a.fullName} (#{a.id})</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="knowledgeAreaIds" label="Области знаний">
            <Select mode="multiple" placeholder="Выберите области знаний (если есть)">
              {areasData?.data?.map((ar: any) => (<Select.Option key={ar.id} value={ar.id}>{ar.name} (#{ar.id})</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <BookTable
        books={data.data}
        loading={isLoading}
        onRowClick={(book) => navigate(`/catalog/${book.id}`)}
        pagination={getServerPagination(data, setSkip)}
      />
    </AppLayout>
  );
};
