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
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import { rules, maskIsbn } from '../../shared/validation';

export const CatalogPage: React.FC = () => {
  const list = useListQueryState<{ authorId?: number; year?: number }>();
  const { data, isLoading } = useBooks(list.params);
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = React.useState(false);
  const createBook = useCreateBook();
  const [form] = Form.useForm();
  const { data: authorsData } = useAuthors(DROPDOWN_LIST_PARAMS);
  const { data: areasData } = useKnowledgeAreas(DROPDOWN_LIST_PARAMS);

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
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск: название, ISBN, издатель, автор..."
        filters={
          <>
            <Select
              allowClear
              placeholder="Автор"
              style={{ width: 200 }}
              value={list.filters.authorId}
              onChange={(authorId) =>
                list.setFilters({ ...list.filters, authorId: authorId ?? undefined })
              }
              options={authorsData?.data?.map((a) => ({
                value: a.id,
                label: a.fullName,
              }))}
            />
            <InputNumber
              placeholder="Год"
              style={{ width: 120 }}
              value={list.filters.year}
              onChange={(year) =>
                list.setFilters({
                  ...list.filters,
                  year: year != null ? Number(year) : undefined,
                })
              }
            />
          </>
        }
        extra={
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Добавить книгу
          </Button>
        }
      />

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
          <Form.Item name="isbn" label="ISBN" rules={rules.isbn()}>
            <Input
              placeholder="978-5-907123-45-6"
              maxLength={17}
              onChange={(e) => form.setFieldValue('isbn', maskIsbn(e.target.value))}
            />
          </Form.Item>
          <Form.Item name="title" label="Название" rules={rules.bookTitle()}>
            <Input placeholder="Например: Введение в алгоритмы" maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="publisher" label="Издатель" rules={rules.publisher()}>
            <Input placeholder="Например: O'Reilly" maxLength={300} showCount />
          </Form.Item>
          <Form.Item name="year" label="Год" rules={rules.year()}>
            <InputNumber style={{ width: '100%' }} placeholder="2020" min={1000} max={new Date().getFullYear() + 1} precision={0} />
          </Form.Item>
          <Form.Item name="authorId" label="Автор" rules={rules.selectRequired('Выберите автора')}>
            <Select placeholder="Выберите автора">
              {authorsData?.data?.map((a) => (
                <Select.Option key={a.id} value={a.id}>
                  {a.fullName} (#{a.id})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="knowledgeAreaIds" label="Области знаний">
            <Select mode="multiple" placeholder="Выберите области знаний (если есть)">
              {areasData?.data?.map((ar) => (
                <Select.Option key={ar.id} value={ar.id}>
                  {ar.name} (#{ar.id})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <BookTable
        books={data.data}
        loading={isLoading}
        onRowClick={(book) => navigate(`/catalog/${book.id}`)}
        pagination={getServerPagination(data, list.setSkip)}
      />
    </AppLayout>
  );
};
