import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, Input, Pagination } from 'antd';
import { useAuthors, useCreateAuthor } from '../../entities/author/api';
import { AuthorTable } from '../../entities/author/AuthorTable';

export const AuthorsPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useAuthors(skip, 25);
  const create = useCreateAuthor();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  if (isLoading) return (
    <AppLayout>
      <Spin size="large" />
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <Empty description="Авторы не найдены" />
    </AppLayout>
  );

  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>Добавить автора</Button>
      </div>

      <AuthorTable authors={data.data} loading={isLoading} onRowClick={() => {}} />

      <Pagination
        current={data.page}
        total={data.total}
        pageSize={data.pageSize}
        onChange={(page) => setSkip((page - 1) * data.pageSize)}
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Modal title="Создать автора" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        const values = await form.validateFields();
        await create.mutateAsync({ fullName: values.fullName });
        form.resetFields();
        setOpen(false);
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
            <Input placeholder="Например: Иванов Иван" />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default AuthorsPage;
