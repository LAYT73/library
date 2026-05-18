import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, Input, Pagination, Table, Space, Popconfirm, message } from 'antd';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../../entities/supplier/api';

export const SuppliersPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useSuppliers(skip, 25);
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const remove = useDeleteSupplier();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();

  const submitCreate = async () => {
    const values = await form.validateFields();
    await create.mutateAsync({ name: values.name, contactInfo: values.contactInfo });
    message.success('Поставщик создан');
    form.resetFields();
    setCreateOpen(false);
  };

  const openEdit = (record: { id: number; name: string; contactInfo: string }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await update.mutateAsync({ id: editingId, payload: { name: values.name, contactInfo: values.contactInfo } });
    message.success('Поставщик обновлён');
    form.resetFields();
    setEditingId(null);
    setEditOpen(false);
  };

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
        <Empty description="Поставщики не найдены" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Добавить поставщика</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data.data}
        columns={[
          { title: 'Название', dataIndex: 'name', key: 'name' },
          { title: 'Контакты', dataIndex: 'contactInfo', key: 'contactInfo' },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm title="Удалить поставщика?" onConfirm={async () => { await remove.mutateAsync(record.id); message.success('Поставщик удалён'); }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Pagination
        current={data.page}
        total={data.total}
        pageSize={data.pageSize}
        onChange={(page) => setSkip((page - 1) * data.pageSize)}
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Modal title="Создать поставщика" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactInfo" label="Контактная информация" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить поставщика" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
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
