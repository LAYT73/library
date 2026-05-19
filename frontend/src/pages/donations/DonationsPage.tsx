import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Form, Input, Modal, Popconfirm, Space, Spin, Empty, Table, message, Select, InputNumber, Descriptions } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import {
  useDonations,
  useCreateDonation,
  useUpdateDonation,
  useDeleteDonation,
  type DonationListItem,
} from '../../entities/donation/api';
import { useBooks } from '../../shared/hooks/useBooks';
import { formatDateTimeRu } from '../../shared/lib/formatters';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';
import { rules, maskPersonName } from '../../shared/validation';

export const DonationsPage: React.FC = () => {
  const list = useListQueryState();
  const { data, isLoading } = useDonations(list.params);
  const create = useCreateDonation();
  const update = useUpdateDonation();
  const remove = useDeleteDonation();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<DonationListItem | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: booksData } = useBooks(DROPDOWN_LIST_PARAMS);

  const totalBooks = (items: DonationListItem['items']) =>
    items.reduce((sum, it) => sum + it.quantity, 0);

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      const items = (values.items || []).map((it: { bookId: number; quantity: number }) => ({
        bookId: Number(it.bookId),
        quantity: Number(it.quantity),
      }));
      await create.mutateAsync({ donorName: values.donorName, items });
      message.success('Пожертвование создано');
      form.resetFields();
      setCreateOpen(false);
    } catch {
      message.error('Не удалось создать пожертвование');
    }
  };

  const openEdit = (record: DonationListItem) => {
    setEditingId(record.id);
    form.setFieldsValue({ donorName: record.donorName });
    setEditOpen(true);
  };

  const openView = (record: DonationListItem) => {
    setViewing(record);
    setViewOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      const values = await form.validateFields();
      await update.mutateAsync({ id: editingId, payload: { donorName: values.donorName } });
      message.success('Пожертвование обновлено');
      form.resetFields();
      setEditingId(null);
      setEditOpen(false);
    } catch {
      message.error('Не удалось обновить пожертвование');
    }
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Пожертвования не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск по донору..."
        extra={<Button type="primary" onClick={() => setCreateOpen(true)}>Создать пожертвование</Button>}
      />

      <Table<DonationListItem>
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: '№', dataIndex: 'id', key: 'id', width: 70 },
          { title: 'Донор', dataIndex: 'donorName', key: 'donorName' },
          {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            render: (v: string) => formatDateTimeRu(v),
          },
          {
            title: 'Позиций / экз.',
            key: 'summary',
            render: (_: unknown, r) => `${r.items.length} / ${totalBooks(r.items)}`,
          },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openView(record)}>Просмотр</Button>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm
                  title="Удалить пожертвование?"
                  onConfirm={async () => {
                    try {
                      await remove.mutateAsync(record.id);
                      message.success('Пожертвование удалено');
                    } catch {
                      message.error('Не удалось удалить пожертвование');
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
        title={`Пожертвование №${viewing?.id ?? ''}`}
        open={viewOpen}
        onCancel={() => { setViewOpen(false); setViewing(null); }}
        footer={null}
        width={720}
      >
        {viewing && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Донор">{viewing.donorName}</Descriptions.Item>
              <Descriptions.Item label="Дата">{formatDateTimeRu(viewing.date)}</Descriptions.Item>
              <Descriptions.Item label="Всего экземпляров">{totalBooks(viewing.items)}</Descriptions.Item>
            </Descriptions>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={viewing.items}
              columns={[
                { title: 'Книга', render: (_: unknown, it) => it.book?.title ?? `Книга #${it.bookId}` },
                { title: 'ISBN', render: (_: unknown, it) => it.book?.isbn ?? '—' },
                { title: 'Автор', render: (_: unknown, it) => it.book?.author?.fullName ?? '—' },
                { title: 'Кол-во', dataIndex: 'quantity', width: 80 },
              ]}
            />
          </>
        )}
      </Modal>

      <Modal title="Создать пожертвование" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена" width={640}>
        <Form form={form} layout="vertical">
          <Form.Item name="donorName" label="Имя донора" rules={rules.donorName()}>
            <Input
              placeholder="Иванов Иван"
              maxLength={200}
              showCount
              onChange={(e) => form.setFieldValue('donorName', maskPersonName(e.target.value))}
            />
          </Form.Item>
          <Form.List name="items" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <div>
                {fields.map((field) => (
                  <Space key={field.key} align="start" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item name={[field.name, 'bookId']} rules={rules.selectRequired('Выберите книгу')} label={field.name === 0 ? 'Книга' : undefined}>
                      <Select
                        style={{ width: 280 }}
                        placeholder="Выберите книгу"
                        options={booksData?.data?.map((b) => ({ value: b.id, label: b.title }))}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'quantity']} rules={rules.positiveInt('Количество')} label={field.name === 0 ? 'Кол-во' : undefined}>
                      <InputNumber min={1} precision={0} placeholder="1" />
                    </Form.Item>
                    {fields.length > 1 && <Button onClick={() => remove(field.name)} style={{ marginTop: field.name === 0 ? 30 : 0 }}>Удалить</Button>}
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>Добавить позицию</Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal title="Изменить пожертвование" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="donorName" label="Имя донора" rules={rules.donorName()}>
            <Input maxLength={200} showCount onChange={(e) => form.setFieldValue('donorName', maskPersonName(e.target.value))} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default DonationsPage;
