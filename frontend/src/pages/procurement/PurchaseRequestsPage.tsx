import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Modal, Form, InputNumber, Table, Space, Pagination, Spin, Empty, Popconfirm, message, Select } from 'antd';
import { usePurchaseRequests, useCreatePurchaseRequest, useUpdatePurchaseRequest, useDeletePurchaseRequest } from '../../entities/purchaseRequest/api';
import { useBooks } from '../../shared/hooks/useBooks';

export const PurchaseRequestsPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = usePurchaseRequests(skip, 25);
  const create = useCreatePurchaseRequest();
  const update = useUpdatePurchaseRequest();
  const remove = useDeletePurchaseRequest();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: booksData } = useBooks(0, 1000);

  const submitCreate = async () => {
    const values = await form.validateFields();
    await create.mutateAsync({ items: [{ bookId: Number(values.bookId), quantity: Number(values.quantity) }] });
    message.success('Заявка создана');
    form.resetFields();
    setCreateOpen(false);
  };

  const openEdit = (record: { id: number; status: string }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await update.mutateAsync({ id: editingId, payload: { status: values.status } });
    message.success('Заявка обновлена');
    form.resetFields();
    setEditingId(null);
    setEditOpen(false);
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Заявки не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Создать заявку на закупку</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data.data}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Дата', dataIndex: 'date', key: 'date' },
          { title: 'Статус', dataIndex: 'status', key: 'status' },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить статус</Button>
                <Popconfirm title="Удалить заявку?" onConfirm={async () => { await remove.mutateAsync(record.id); message.success('Заявка удалена'); }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Pagination current={data.page} total={data.total} pageSize={data.pageSize} onChange={(page) => setSkip((page - 1) * data.pageSize)} style={{ marginTop: 16, textAlign: 'right' }} />

      <Modal title="Создать заявку на закупку" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="bookId" label="Книга" rules={[{ required: true }]}>
            <Select placeholder="Выберите книгу">
              {booksData?.data?.map((b: any) => (<Select.Option key={b.id} value={b.id}>{b.title} (#{b.id})</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Количество" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Например: 3" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить заявку" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
            <Select options={[
              { value: 'CREATED', label: 'Создана' },
              { value: 'APPROVED', label: 'Одобрена' },
              { value: 'REJECTED', label: 'Отклонена' },
              { value: 'COMPLETED', label: 'Выполнена' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default PurchaseRequestsPage;
