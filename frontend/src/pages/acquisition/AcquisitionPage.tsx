import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, InputNumber, Table, Space, Popconfirm, message, Select, Descriptions } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import {
  useAcquisitions,
  useCreateAcquisitionFromOrder,
  useUpdateAcquisition,
  useDeleteAcquisition,
  type AcquisitionItem,
} from '../../entities/acquisition/api';
import { useOrders } from '../../entities/order/api';
import { useSuppliers } from '../../entities/supplier/api';
import { formatDateTimeRu, formatMoneyRu, formatOrderStatus } from '../../shared/lib/formatters';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';

export const AcquisitionPage: React.FC = () => {
  const list = useListQueryState<{ supplierId?: number }>();
  const { data, isLoading } = useAcquisitions(list.params);
  const create = useCreateAcquisitionFromOrder();
  const update = useUpdateAcquisition();
  const remove = useDeleteAcquisition();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<AcquisitionItem | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: ordersData } = useOrders(DROPDOWN_LIST_PARAMS);
  const { data: suppliersData } = useSuppliers(DROPDOWN_LIST_PARAMS);

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      await create.mutateAsync(Number(values.orderId));
      message.success('Приобретение создано из заказа');
      form.resetFields();
      setCreateOpen(false);
    } catch {
      message.error('Не удалось создать приобретение');
    }
  };

  const openEdit = (record: AcquisitionItem) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setEditOpen(true);
  };

  const openView = (record: AcquisitionItem) => {
    setViewing(record);
    setViewOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      const values = await form.validateFields();
      await update.mutateAsync({
        id: editingId,
        payload: { totalCost: values.totalCost, supplierId: values.supplierId, orderId: values.orderId },
      });
      message.success('Приобретение обновлено');
      form.resetFields();
      setEditingId(null);
      setEditOpen(false);
    } catch {
      message.error('Не удалось обновить приобретение');
    }
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Приобретения не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск по поставщику..."
        filters={
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
        }
        extra={<Button type="primary" onClick={() => setCreateOpen(true)}>Создать из заказа</Button>}
      />

      <Table<AcquisitionItem>
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: '№', dataIndex: 'id', key: 'id', width: 70 },
          {
            title: 'Дата поступления',
            dataIndex: 'date',
            key: 'date',
            render: (v: string) => formatDateTimeRu(v),
          },
          {
            title: 'Поставщик',
            key: 'supplier',
            render: (_: unknown, r) => r.supplier?.name ?? '—',
          },
          {
            title: 'Заказ',
            key: 'order',
            render: (_: unknown, r) =>
              r.order ? `№${r.order.id} (${formatOrderStatus(r.order.status)})` : '—',
          },
          {
            title: 'Стоимость',
            dataIndex: 'totalCost',
            key: 'totalCost',
            render: (v: string) => formatMoneyRu(v),
          },
          {
            title: 'Экземпляров',
            key: 'copiesCount',
            width: 110,
            render: (_: unknown, r) => r.copies?.length ?? 0,
          },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openView(record)}>Просмотр</Button>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm
                  title="Удалить приобретение?"
                  onConfirm={async () => {
                    try {
                      await remove.mutateAsync(record.id);
                      message.success('Приобретение удалено');
                    } catch {
                      message.error('Не удалось удалить приобретение');
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

      <Modal
        title={`Поступление №${viewing?.id ?? ''}`}
        open={viewOpen}
        onCancel={() => { setViewOpen(false); setViewing(null); }}
        footer={null}
        width={720}
      >
        {viewing && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Дата">{formatDateTimeRu(viewing.date)}</Descriptions.Item>
              <Descriptions.Item label="Поставщик">{viewing.supplier?.name ?? '—'}</Descriptions.Item>
              <Descriptions.Item label="Заказ">
                {viewing.order ? `№${viewing.order.id}, ${formatOrderStatus(viewing.order.status)}` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Стоимость">{formatMoneyRu(viewing.totalCost)}</Descriptions.Item>
            </Descriptions>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={viewing.copies ?? []}
              columns={[
                { title: 'Инв. №', dataIndex: 'inventoryNumber', width: 90 },
                { title: 'Книга', render: (_: unknown, c) => c.book?.title ?? '—' },
                { title: 'ISBN', render: (_: unknown, c) => c.book?.isbn ?? '—' },
                { title: 'Автор', render: (_: unknown, c) => c.book?.author?.fullName ?? '—' },
              ]}
            />
          </>
        )}
      </Modal>

      <Modal title="Создать приобретение из заказа" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="orderId" label="Заказ" rules={[{ required: true }]}>
            <Select
              placeholder="Выберите заказ"
              options={ordersData?.data?.map((o) => ({
                value: o.id,
                label: `Заказ №${o.id} — ${formatOrderStatus(o.status)}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить приобретение" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="totalCost" label="Стоимость">
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="Например: 1234.56" />
          </Form.Item>
          <Form.Item name="supplierId" label="Поставщик" rules={[{ required: true }]}>
            <Select
              placeholder="Выберите поставщика"
              options={suppliersData?.data?.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>
          <Form.Item name="orderId" label="Заказ">
            <Select
              allowClear
              placeholder="Выберите заказ (если есть)"
              options={ordersData?.data?.map((o) => ({
                value: o.id,
                label: `Заказ №${o.id} — ${formatOrderStatus(o.status)}`,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default AcquisitionPage;
