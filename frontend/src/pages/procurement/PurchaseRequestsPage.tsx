import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Modal, Form, InputNumber, Table, Space, Spin, Empty, Popconfirm, message, Select, Tag } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import { usePurchaseRequests, useCreatePurchaseRequest, useUpdatePurchaseRequest, useDeletePurchaseRequest } from '../../entities/purchaseRequest/api';
import { useSuppliers } from '../../entities/supplier/api';
import { useCreateOrderFromRequest } from '../../entities/order/api';
import { useBooks } from '../../shared/hooks/useBooks';
import { formatDateTimeRu, formatPurchaseRequestStatus } from '../../shared/lib/formatters';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';
import { rules } from '../../shared/validation';

const prStatusOptions = [
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'APPROVED', label: 'Одобрена' },
  { value: 'REJECTED', label: 'Отклонена' },
  { value: 'ORDERED', label: 'В заказе' },
];

export const PurchaseRequestsPage: React.FC = () => {
  const list = useListQueryState<{ status?: string }>();
  const { data, isLoading } = usePurchaseRequests(list.params);
  const create = useCreatePurchaseRequest();
  const update = useUpdatePurchaseRequest();
  const remove = useDeletePurchaseRequest();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: booksData } = useBooks(DROPDOWN_LIST_PARAMS);
  const { data: suppliersData } = useSuppliers(DROPDOWN_LIST_PARAMS);
  const createOrder = useCreateOrderFromRequest();
  const [orderModalOpen, setOrderModalOpen] = React.useState(false);
  const [orderPrId, setOrderPrId] = React.useState<number | null>(null);
  const [orderForm] = Form.useForm();

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      await create.mutateAsync({ items: [{ bookId: Number(values.bookId), quantity: Number(values.quantity) }] });
      message.success('Заявка создана');
      form.resetFields();
      setCreateOpen(false);
    } catch (e) {
      message.error('Не удалось создать заявку');
    }
  };

  const openEdit = (record: { id: number; status: string }) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      const values = await form.validateFields();
      await update.mutateAsync({ id: editingId, payload: { status: values.status } });
      message.success('Заявка обновлена');
      form.resetFields();
      setEditingId(null);
      setEditOpen(false);
    } catch (e) {
      message.error('Не удалось обновить заявку');
    }
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Заявки не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск..."
        filters={
          <Select
            allowClear
            placeholder="Статус"
            style={{ width: 160 }}
            value={list.filters.status}
            options={prStatusOptions}
            onChange={(status) => list.setFilters({ ...list.filters, status: status ?? undefined })}
          />
        }
        extra={<Button type="primary" onClick={() => setCreateOpen(true)}>Создать заявку на закупку</Button>}
      />

      <Table
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: '№', dataIndex: 'id', key: 'id', width: 70 },
          {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            render: (v: string) => formatDateTimeRu(v),
          },
          {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (v: string) => {
              const color =
                v === 'APPROVED' ? 'green' : v === 'REJECTED' ? 'red' : v === 'COMPLETED' ? 'blue' : 'default';
              return <Tag color={color}>{formatPurchaseRequestStatus(v)}</Tag>;
            },
          },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить статус</Button>
                        <Button size="small" onClick={() => { setOrderPrId(record.id); setOrderModalOpen(true); }}>Создать заказ</Button>
                <Popconfirm title="Удалить заявку?" onConfirm={async () => { try { await remove.mutateAsync(record.id); message.success('Заявка удалена'); } catch { message.error('Не удалось удалить заявку'); } }}>
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title="Создать заявку на закупку" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="bookId" label="Книга" rules={rules.selectRequired('Выберите книгу')}>
            <Select placeholder="Выберите книгу">
              {booksData?.data?.map((b: any) => (<Select.Option key={b.id} value={b.id}>{b.title} (#{b.id})</Select.Option>))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Количество" rules={rules.positiveInt('Количество')}>
            <InputNumber style={{ width: '100%' }} min={1} precision={0} placeholder="3" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Создать заказ по заявке" open={orderModalOpen} onCancel={() => { setOrderModalOpen(false); setOrderPrId(null); }} onOk={async () => {
        try {
          const vals = await orderForm.validateFields();
          if (!orderPrId) return;
          await createOrder.mutateAsync({ requestId: orderPrId, supplierId: vals.supplierId });
          message.success('Заказ создан');
          setOrderModalOpen(false);
          setOrderPrId(null);
        } catch (e) {
          message.error('Не удалось создать заказ');
        }
      }}>
        <Form form={orderForm} layout="vertical">
          <Form.Item name="supplierId" label="Поставщик" rules={rules.selectRequired('Выберите поставщика')}>
            <Select placeholder="Выберите поставщика">
              {suppliersData?.data?.map((s: any) => (<Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить заявку" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Статус" rules={rules.selectRequired('Выберите статус')}>
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
