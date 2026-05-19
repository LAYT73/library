import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, Input, message } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useAuthors, useCreateAuthor } from '../../entities/author/api';
import { AuthorTable } from '../../entities/author/AuthorTable';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import { rules, maskPersonName } from '../../shared/validation';

export const AuthorsPage: React.FC = () => {
  const list = useListQueryState();
  const { data, isLoading } = useAuthors(list.params);
  const create = useCreateAuthor();
  const [open, setOpen] = React.useState(false);
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
        <Empty description="Авторы не найдены" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск по ФИО..."
        extra={<Button type="primary" onClick={() => setOpen(true)}>Добавить автора</Button>}
      />

      <AuthorTable
        authors={data.data}
        loading={isLoading}
        onRowClick={() => {}}
        pagination={getServerPagination(data, list.setSkip)}
      />

      <Modal
        title="Создать автора"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            await create.mutateAsync({ fullName: values.fullName });
            message.success('Автор создан');
            form.resetFields();
            setOpen(false);
          } catch {
            message.error('Не удалось создать автора');
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="ФИО" rules={rules.personName(150)}>
            <Input
              placeholder="Например: Иванов Иван"
              maxLength={150}
              showCount
              onChange={(e) => form.setFieldValue('fullName', maskPersonName(e.target.value))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default AuthorsPage;
