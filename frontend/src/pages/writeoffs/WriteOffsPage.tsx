import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Form, Input, Modal, Pagination, Popconfirm, Space, Spin, Empty, Table, message, Select } from 'antd';
import { useWriteOffs, useCreateWriteOff, useUpdateWriteOff, useDeleteWriteOff } from '../../entities/writeOff/api';
import { useCopies } from '../../entities/copy/api';

export const WriteOffsPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useWriteOffs(skip, 25);
  const create = useCreateWriteOff();
  const update = useUpdateWriteOff();
  const remove = useDeleteWriteOff();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: copiesData } = useCopies(0, 1000);

  const submitCreate = async () => {
    const values = await form.validateFields();
    const copyIds = values.copyIds || [];
    await create.mutateAsync({ reason: values.reason, copyIds });
    message.success('Списание создано');
    form.resetFields();
    setCreateOpen(false);
  };

  const openEdit = (record: { id: number; reason: string }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    const payload: { reason?: string; copyIds?: number[] } = { reason: values.reason };
    if (values.copyIds) payload.copyIds = values.copyIds.split(',').map((s: string) => Number(s.trim()));
    await update.mutateAsync({ id: editingId, payload });
    message.success('Списание обновлено');
    form.resetFields();
    setEditingId(null);
    setEditOpen(false);
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Списания не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Создать списание</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data.data}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Причина', dataIndex: 'reason', key: 'reason' },
          { title: 'Дата', dataIndex: 'date', key: 'date' },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm title="Удалить списание?" onConfirm={async () => { await remove.mutateAsync(record.id); message.success('Списание удалено'); }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Pagination current={data.page} total={data.total} pageSize={data.pageSize} onChange={(page) => setSkip((page - 1) * data.pageSize)} style={{ marginTop: 16, textAlign: 'right' }} />

      <Modal title="Создать списание" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Причина" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Например: износ, повреждение" />
          </Form.Item>
          <Form.Item name="copyIds" label="Экземпляры" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Выберите экземпляры для списания">
              {copiesData?.data?.map((c: any) => (<Select.Option key={c.id} value={c.id}>Экз. #{c.id} — книга #{c.bookId}</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить списание" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Причина" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Например: износ, повреждение" />
          </Form.Item>
          <Form.Item name="copyIds" label="Экземпляры">
            <Select mode="multiple" placeholder="Выберите экземпляры для списания">
              {copiesData?.data?.map((c: any) => (<Select.Option key={c.id} value={c.id}>Экз. #{c.id} — книга #{c.bookId}</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default WriteOffsPage;
