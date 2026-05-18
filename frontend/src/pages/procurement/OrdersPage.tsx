import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Form, Button, message, Table, Pagination, Spin, Empty, Space, Popconfirm, Modal, Select } from 'antd';
import { useOrders, useCreateOrderFromRequest, useUpdateOrder, useDeleteOrder } from '../../entities/order/api';
import { usePurchaseRequests } from '../../entities/purchaseRequest/api';
import { useSuppliers } from '../../entities/supplier/api';

export const OrdersPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useOrders(skip, 25);
  const create = useCreateOrderFromRequest();
  const update = useUpdateOrder();
  const remove = useDeleteOrder();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: requestsData } = usePurchaseRequests(0, 1000);
  const { data: suppliersData } = useSuppliers(0, 1000);

  const submitCreate = async () => {
    const values = await form.validateFields();
    await create.mutateAsync({ requestId: Number(values.requestId), supplierId: Number(values.supplierId) });
    message.success('Заказ создан');
    form.resetFields();
    setCreateOpen(false);
  };

  const openEdit = (record: { id: number; status: string; supplierId: number; purchaseRequestId?: number | null }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await update.mutateAsync({ id: editingId, payload: { status: values.status, supplierId: values.supplierId, purchaseRequestId: values.purchaseRequestId } });
    message.success('Заказ обновлён');
    form.resetFields();
    setEditingId(null);
    setEditOpen(false);
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Заказы не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Создать заказ из заявки</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data.data}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Дата', dataIndex: 'orderDate', key: 'orderDate' },
          { title: 'Статус', dataIndex: 'status', key: 'status' },
          { title: 'ID поставщика', dataIndex: 'supplierId', key: 'supplierId' },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm title="Удалить заказ?" onConfirm={async () => { await remove.mutateAsync(record.id); message.success('Заказ удалён'); }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Pagination current={data.page} total={data.total} pageSize={data.pageSize} onChange={(page) => setSkip((page - 1) * data.pageSize)} style={{ marginTop: 16, textAlign: 'right' }} />

      <Modal title="Создать заказ из заявки" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="requestId" label="Заявка" rules={[{ required: true }]}>
            <Select placeholder="Выберите заявку">
              {requestsData?.data?.map((r: any) => (<Select.Option key={r.id} value={r.id}>Заявка #{r.id} — {r.status}</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="supplierId" label="Поставщик" rules={[{ required: true }]}>
            <Select placeholder="Выберите поставщика">
              {suppliersData?.data?.map((s: any) => (<Select.Option key={s.id} value={s.id}>{s.name} (#{s.id})</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить заказ" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
            <Select options={[
              { value: 'CREATED', label: 'Создан' },
              { value: 'SENT', label: 'Отправлен' },
              { value: 'DELIVERED', label: 'Доставлен' },
              { value: 'CANCELLED', label: 'Отменён' },
            ]} />
          </Form.Item>
          <Form.Item name="supplierId" label="Поставщик">
            <Select placeholder="Выберите поставщика">
              {suppliersData?.data?.map((s: any) => (<Select.Option key={s.id} value={s.id}>{s.name} (#{s.id})</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="purchaseRequestId" label="Заявка">
            <Select placeholder="Выберите заявку (или оставьте пустым)">
              {requestsData?.data?.map((r: any) => (<Select.Option key={r.id} value={r.id}>Заявка #{r.id} — {r.status}</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default OrdersPage;
