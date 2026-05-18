import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, Input, Pagination } from 'antd';
import { useSuppliers, useCreateSupplier } from '../../entities/supplier/api';
import { Table as AntTable } from 'antd';

export const SuppliersPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useSuppliers(skip, 25);
  const create = useCreateSupplier();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  if (isLoading) return (
    <AppLayout>
      <Spin size="large" />
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <Empty description="Поставщики не найдены" />
    </AppLayout>
  );

  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>Добавить поставщика</Button>
      </div>

      <AntTable dataSource={data.data} columns={[{ title: 'Название', dataIndex: 'name', key: 'name' }, { title: 'Контакты', dataIndex: 'contactInfo', key: 'contact' }]} rowKey="id" />

      <Pagination
        current={data.page}
        total={data.total}
        pageSize={data.pageSize}
        onChange={(page) => setSkip((page - 1) * data.pageSize)}
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Modal title="Создать поставщика" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        const values = await form.validateFields();
        await create.mutateAsync({ name: values.name, contactInfo: values.contactInfo });
        form.resetFields();
        setOpen(false);
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactInfo" label="Контактная информация" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default SuppliersPage;
