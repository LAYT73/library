import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, InputNumber, Pagination, Table, Space, Popconfirm, message, Select } from 'antd';
import { useAcquisitions, useCreateAcquisitionFromOrder, useUpdateAcquisition, useDeleteAcquisition } from '../../entities/acquisition/api';
import { useOrders } from '../../entities/order/api';
import { useSuppliers } from '../../entities/supplier/api';

export const AcquisitionPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useAcquisitions(skip, 25);
  const create = useCreateAcquisitionFromOrder();
  const update = useUpdateAcquisition();
  const remove = useDeleteAcquisition();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: ordersData } = useOrders(0, 1000);
  const { data: suppliersData } = useSuppliers(0, 1000);

  const submitCreate = async () => {
    const values = await form.validateFields();
    await create.mutateAsync(Number(values.orderId));
    message.success('Приобретение создано из заказа');
    form.resetFields();
    setCreateOpen(false);
  };

  const openEdit = (record: { id: number; totalCost: string; supplierId: number; orderId?: number | null }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    const values = await form.validateFields();
    await update.mutateAsync({ id: editingId, payload: { totalCost: values.totalCost, supplierId: values.supplierId, orderId: values.orderId } });
    message.success('Приобретение обновлено');
    form.resetFields();
    setEditingId(null);
    setEditOpen(false);
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Приобретения не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setCreateOpen(true)}>Создать из заказа</Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={data.data}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Дата', dataIndex: 'date', key: 'date' },
          { title: 'Стоимость', dataIndex: 'totalCost', key: 'totalCost' },
          { title: 'ID поставщика', dataIndex: 'supplierId', key: 'supplierId' },
          { title: 'ID заказа', dataIndex: 'orderId', key: 'orderId' },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm title="Удалить приобретение?" onConfirm={async () => { await remove.mutateAsync(record.id); message.success('Приобретение удалено'); }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Pagination current={data.page} total={data.total} pageSize={data.pageSize} onChange={(page) => setSkip((page - 1) * data.pageSize)} style={{ marginTop: 16, textAlign: 'right' }} />

      <Modal title="Создать приобретение из заказа" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="orderId" label="Заказ" rules={[{ required: true }]}>
            <Select placeholder="Выберите заказ">
              {ordersData?.data?.map((o: any) => (<Select.Option key={o.id} value={o.id}>Заказ #{o.id} — {o.status}</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить приобретение" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="totalCost" label="Стоимость">
            <InputNumber style={{ width: '100%' }} placeholder="Например: 1234.56" />
          </Form.Item>
          <Form.Item name="supplierId" label="Поставщик" rules={[{ required: true }]}>
            <Select placeholder="Выберите поставщика">
              {suppliersData?.data?.map((s: any) => (<Select.Option key={s.id} value={s.id}>{s.name} (#{s.id})</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="orderId" label="Заказ">
            <Select placeholder="Выберите заказ (если есть)">
              {ordersData?.data?.map((o: any) => (<Select.Option key={o.id} value={o.id}>Заказ #{o.id} — {o.status}</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default AcquisitionPage;
