import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Form, Input, Modal, Popconfirm, Space, Spin, Empty, Table, message, Select, Descriptions } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import {
  useWriteOffs,
  useCreateWriteOff,
  useUpdateWriteOff,
  useDeleteWriteOff,
  type WriteOffListItem,
} from '../../entities/writeOff/api';
import { useCopies } from '../../entities/copy/api';
import { formatCopyStatus, formatDateTimeRu } from '../../shared/lib/formatters';
import { DROPDOWN_LIST_PARAMS } from '../../shared/types/list';
import { rules } from '../../shared/validation';

export const WriteOffsPage: React.FC = () => {
  const list = useListQueryState();
  const { data, isLoading } = useWriteOffs(list.params);
  const create = useCreateWriteOff();
  const update = useUpdateWriteOff();
  const remove = useDeleteWriteOff();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<WriteOffListItem | null>(null);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form] = Form.useForm();
  const { data: copiesData } = useCopies(DROPDOWN_LIST_PARAMS);

  const copyLabel = (c: { id: number; inventoryNumber: number; bookId: number; book?: { title?: string } }) =>
    `Инв. №${c.inventoryNumber} — ${c.book?.title ?? `книга #${c.bookId}`}`;

  const submitCreate = async () => {
    try {
      const values = await form.validateFields();
      const copyIds = values.copyIds || [];
      await create.mutateAsync({ reason: values.reason, copyIds });
      message.success('Списание создано');
      form.resetFields();
      setCreateOpen(false);
    } catch {
      message.error('Не удалось создать списание');
    }
  };

  const openEdit = (record: WriteOffListItem) => {
    setEditingId(record.id);
    form.setFieldsValue({ reason: record.reason });
    setEditOpen(true);
  };

  const openView = (record: WriteOffListItem) => {
    setViewing(record);
    setViewOpen(true);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      const values = await form.validateFields();
      await update.mutateAsync({ id: editingId, payload: { reason: values.reason } });
      message.success('Списание обновлено');
      form.resetFields();
      setEditingId(null);
      setEditOpen(false);
    } catch {
      message.error('Не удалось обновить списание');
    }
  };

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Списания не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <TableToolbar
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Поиск по причине..."
        extra={<Button type="primary" onClick={() => setCreateOpen(true)}>Создать списание</Button>}
      />

      <Table<WriteOffListItem>
        rowKey="id"
        dataSource={data.data}
        pagination={getServerPagination(data, list.setSkip)}
        columns={[
          { title: '№', dataIndex: 'id', key: 'id', width: 70 },
          { title: 'Причина', dataIndex: 'reason', key: 'reason', ellipsis: true },
          {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            render: (v: string) => formatDateTimeRu(v),
          },
          {
            title: 'Экземпляров',
            key: 'count',
            width: 110,
            render: (_: unknown, r) => r.items.length,
          },
          {
            title: 'Действия',
            key: 'actions',
            render: (_value, record) => (
              <Space>
                <Button size="small" onClick={() => openView(record)}>Просмотр</Button>
                <Button size="small" onClick={() => openEdit(record)}>Изменить</Button>
                <Popconfirm
                  title="Удалить списание?"
                  onConfirm={async () => {
                    try {
                      await remove.mutateAsync(record.id);
                      message.success('Списание удалено');
                    } catch {
                      message.error('Не удалось удалить списание');
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
        title={`Акт списания №${viewing?.id ?? ''}`}
        open={viewOpen}
        onCancel={() => { setViewOpen(false); setViewing(null); }}
        footer={null}
        width={720}
      >
        {viewing && (
          <>
            <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Дата">{formatDateTimeRu(viewing.date)}</Descriptions.Item>
              <Descriptions.Item label="Причина">{viewing.reason}</Descriptions.Item>
              <Descriptions.Item label="Списано экземпляров">{viewing.items.length}</Descriptions.Item>
            </Descriptions>
            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={viewing.items}
              columns={[
                {
                  title: 'Инв. №',
                  render: (_: unknown, it) => it.copy?.inventoryNumber ?? it.copyId,
                  width: 90,
                },
                { title: 'Книга', render: (_: unknown, it) => it.copy?.book?.title ?? '—' },
                { title: 'ISBN', render: (_: unknown, it) => it.copy?.book?.isbn ?? '—' },
                { title: 'Автор', render: (_: unknown, it) => it.copy?.book?.author?.fullName ?? '—' },
                {
                  title: 'Статус',
                  render: (_: unknown, it) =>
                    it.copy?.status ? formatCopyStatus(it.copy.status) : '—',
                },
              ]}
            />
          </>
        )}
      </Modal>

      <Modal title="Создать списание" open={createOpen} onCancel={() => setCreateOpen(false)} onOk={submitCreate} okText="Создать" cancelText="Отмена" width={640}>
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Причина" rules={rules.reason()}>
            <Input.TextArea placeholder="Износ, повреждение..." rows={3} maxLength={300} showCount />
          </Form.Item>
          <Form.Item name="copyIds" label="Экземпляры" rules={rules.selectRequired('Выберите экземпляры')}>
            <Select
              mode="multiple"
              placeholder="Выберите экземпляры для списания"
              options={copiesData?.data
                ?.filter((c) => c.status === 'AVAILABLE')
                .map((c) => ({ value: c.id, label: copyLabel(c) }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="Изменить списание" open={editOpen} onCancel={() => setEditOpen(false)} onOk={submitEdit} okText="Сохранить" cancelText="Отмена">
        <Form form={form} layout="vertical">
          <Form.Item name="reason" label="Причина" rules={rules.reason()}>
            <Input.TextArea placeholder="Износ, повреждение..." rows={3} maxLength={300} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default WriteOffsPage;
