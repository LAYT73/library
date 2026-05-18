import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Form, Input, Modal, Pagination, Popconfirm, Space, Spin, Empty, Table, message, Select, InputNumber } from 'antd';
import { useDonations, useCreateDonation, useUpdateDonation, useDeleteDonation } from '../../entities/donation/api';
import { useBooks } from '../../shared/hooks/useBooks';

export const DonationsPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useDonations(skip, 25);
  const create = useCreateDonation();
  const update = useUpdateDonation();
  const remove = useDeleteDonation();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: booksData } = useBooks(0, 1000);

  const submitCreate = async () => {
    const values = await form.validateFields();
    const items = (values.items || []).map((it: any) => ({ bookId: Number(it.bookId), quantity: Number(it.quantity) }));
    await create.mutateAsync({ donorName: values.donorName, items });
    message.success('Пожертвование создано');
    form.resetFields();
    setCreateOpen(false);
  };

  const openEdit = (record: { id: number; donorName: string }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await update.mutateAsync({ id: editingId, payload: { donorName: values.donorName } });
    message.success('Пожертвование обновлено');
    form.resetFields();
    setEditingId(null);
    setEditOpen(false);
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Пожертвования не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Создать пожертвование</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data.data}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Донор', dataIndex: 'donorName', key: 'donorName' },
          { title: 'Дата', dataIndex: 'date', key: 'date' },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm title="Удалить пожертвование?" onConfirm={async () => { await remove.mutateAsync(record.id); message.success('Пожертвование удалено'); }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Pagination current={data.page} total={data.total} pageSize={data.pageSize} onChange={(page) => setSkip((page - 1) * data.pageSize)} style={{ marginTop: 16, textAlign: 'right' }} />

      <Modal title="Создать пожертвование" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="donorName" label="Имя донора" rules={[{ required: true }]}>
            <Input placeholder="Например: Иванов Иван" />
          </Form.Item>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                {fields.map((field) => (
                  <Space key={field.key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item name={[field.name, 'bookId']} rules={[{ required: true }]}> 
                      <Select style={{ width: 300 }} placeholder="Выберите книгу">
                        {booksData?.data?.map((b: any) => (<Select.Option key={b.id} value={b.id}>{b.title} (#{b.id})</Select.Option>))}
                      </Select>
                    </Form.Item>
                    <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}> 
                      <InputNumber min={1} placeholder="Кол-во" />
                    </Form.Item>
                    <Button onClick={() => remove(field.name)}>Удалить</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()}>Добавить позицию</Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal title="Изменить пожертвование" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="donorName" label="Имя донора" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default DonationsPage;
