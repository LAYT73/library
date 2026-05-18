import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Form, Button, message, Table, Spin, Empty, Space, Popconfirm, Modal, Select, Tag, Input } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import type { OrderListItem } from '../../entities/order/api';
import { useOrders, useCreateOrderFromRequest, useUpdateOrder, useDeleteOrder } from '../../entities/order/api';
import { usePurchaseRequests } from '../../entities/purchaseRequest/api';
import { useSuppliers } from '../../entities/supplier/api';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';

const statusLabels: Record<string, string> = {
  CREATED: 'Создан',
  SENT: 'Отправлен',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

export const OrdersPage: React.FC = () => {
  const list = useListQueryState<{ status?: string; supplierId?: number }>();
  const { data, isLoading } = useOrders(list.params);
  const create = useCreateOrderFromRequest();
  const update = useUpdateOrder();
  const remove = useDeleteOrder();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: requestsData } = usePurchaseRequests(DROPDOWN_LIST_PARAMS);
  const { data: suppliersData } = useSuppliers(DROPDOWN_LIST_PARAMS);

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      await create.mutateAsync({
        requestId: Number(values.requestId),
        supplierId: Number(values.supplierId),
        expectedDate: values.expectedDate ? new Date(values.expectedDate).toISOString() : undefined,
      });
      message.success('Заказ создан');
      form.resetFields();
      setCreateOpen(false);
    } catch {
      message.error('Не удалось создать заказ');
    }
  };

  const openEdit = (record: {
    id: number;
    status: string;
    supplierId: number;
    purchaseRequestId?: number | null;
    expectedDate?: string | null;
  }) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      expectedDate: record.expectedDate ? record.expectedDate.slice(0, 10) : undefined,
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      const values = await form.validateFields();
      await update.mutateAsync({
        id: editingId,
        payload: {
          status: values.status,
          supplierId: values.supplierId,
          purchaseRequestId: values.purchaseRequestId,
          expectedDate: values.expectedDate ? new Date(values.expectedDate).toISOString() : null,
        },
      });
      message.success('Заказ обновлён');
      form.resetFields();
      setEditingId(null);
      setEditOpen(false);
    } catch {
      message.error('Не удалось обновить заказ');
    }
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Заказы не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск по поставщику..."
        filters={
          <>
            <Select
              allowClear
              placeholder="Статус"
              style={{ width: 160 }}
              value={list.filters.status}
              onChange={(status) => list.setFilters({ ...list.filters, status: status ?? undefined })}
              options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            />
            <Select
              allowClear
              placeholder="Поставщик"
              style={{ width: 200 }}
              value={list.filters.supplierId}
              onChange={(supplierId) =>
                list.setFilters({ ...list.filters, supplierId: supplierId ?? undefined })
              }
              options={suppliersData?.data?.map((s) => ({ value: s.id, label: s.name }))}
            />
          </>
        }
        extra={<Button type="primary" onClick={() => setCreateOpen(true)}>Создать заказ из заявки</Button>}
      />

      <Table<OrderListItem>
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
          {
            title: 'Дата заказа',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (v: string) => (v ? new Date(v).toLocaleDateString('ru-RU') : '—'),
          },
          {
            title: 'Ожидаемая поставка',
            dataIndex: 'expectedDate',
            key: 'expectedDate',
            render: (v: string | null, record: OrderListItem) =>
              v ? (
                <Space>
                  {new Date(v).toLocaleDateString('ru-RU')}
                  {record.isOverdue && <Tag color="red">Просрочен</Tag>}
                </Space>
              ) : (
                '—'
              ),
          },
          {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (v: string) => statusLabels[v] ?? v,
          },
          {
            title: 'Поставщик',
            key: 'supplier',
            render: (_: unknown, record: OrderListItem) =>
              record.supplier?.name ?? `#${record.supplierId}`,
          },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm
                  title="Удалить заказ?"
                  onConfirm={async () => {
                    try {
                      await remove.mutateAsync(record.id);
                      message.success('Заказ удалён');
                    } catch {
                      message.error('Не удалось удалить заказ');
                    }
                  }}
                >
                  <Button danger size="small">Удалить</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title="Создать заказ из заявки" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="requestId" label="Заявка" rules={[{ required: true }]}>
            <Select placeholder="Выберите заявку">
              {requestsData?.data?.map((r) => (
                <Select.Option key={r.id} value={r.id}>Заявка #{r.id} — {r.status}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="supplierId" label="Поставщик" rules={[{ required: true }]}>
            <Select placeholder="Выберите поставщика">
              {suppliersData?.data?.map((s) => (
                <Select.Option key={s.id} value={s.id}>{s.name} (#{s.id})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="expectedDate" label="Ожидаемая дата поставки">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить заказ" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Статус" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'CREATED', label: 'Создан' },
                { value: 'SENT', label: 'Отправлен' },
                { value: 'DELIVERED', label: 'Доставлен' },
                { value: 'CANCELLED', label: 'Отменён' },
              ]}
            />
          </Form.Item>
          <Form.Item name="expectedDate" label="Ожидаемая дата поставки">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="supplierId" label="Поставщик">
            <Select placeholder="Выберите поставщика">
              {suppliersData?.data?.map((s) => (
                <Select.Option key={s.id} value={s.id}>{s.name} (#{s.id})</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="purchaseRequestId" label="Заявка">
            <Select placeholder="Выберите заявку (или оставьте пустым)" allowClear>
              {requestsData?.data?.map((r) => (
                <Select.Option key={r.id} value={r.id}>Заявка #{r.id} — {r.status}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default OrdersPage;
