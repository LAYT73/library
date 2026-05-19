import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Table, Button, Modal, Form, Input, Space, Popconfirm, Spin, Empty, message } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useKnowledgeAreas, useCreateKnowledgeArea, useUpdateKnowledgeArea, useDeleteKnowledgeArea } from '../../entities/knowledgeArea/api';
import { useListQueryState } from '../../shared/hooks/useListQueryState';
import { TableToolbar } from '../../shared/ui/TableToolbar';
import { rules } from '../../shared/validation';

export const KnowledgeAreasPage: React.FC = () => {
  const list = useListQueryState();
  const { data, isLoading } = useKnowledgeAreas(list.params);
  const create = useCreateKnowledgeArea();
  const update = useUpdateKnowledgeArea();
  const remove = useDeleteKnowledgeArea();
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  if (isLoading) return <AppLayout><Spin size="large" /></AppLayout>;
  if (!data) return <AppLayout><Empty description="Области знаний не найдены" /></AppLayout>;

  return (
    <AppLayout>
      <Card title="Области знаний">
        <TableToolbar
          search={list.search}
          onSearchChange={list.setSearch}
          searchPlaceholder="Поиск по названию..."
          extra={<Button type="primary" onClick={() => setOpen(true)}>Создать область знаний</Button>}
        />

        <Table rowKey="id" dataSource={data.data} pagination={getServerPagination(data, list.setSkip)} columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Название', dataIndex: 'name', key: 'name' },
          { title: 'Действия', key: 'actions', render: (_v, record) => (
            <Space>
              <Button size="small" onClick={() => { setEditing(record); editForm.setFieldsValue(record); setEditOpen(true); }}>Изменить</Button>
              <Popconfirm title="Удалить область?" onConfirm={async () => { try { await remove.mutateAsync(record.id); message.success('Удалено'); } catch { message.error('Не удалось удалить'); } }}>
                <Button danger size="small">Удалить</Button>
              </Popconfirm>
            </Space>
          ) }
        ]} />

        <Modal title="Создать область" open={open} onCancel={() => setOpen(false)} onOk={async () => { try { const values = await form.validateFields(); await create.mutateAsync(values); message.success('Создано'); form.resetFields(); setOpen(false); } catch { message.error('Не удалось создать'); } }}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Название" rules={rules.knowledgeAreaName()}>
              <Input placeholder="Например: Математика" maxLength={100} showCount />
            </Form.Item>
          </Form>
        </Modal>

        <Modal title="Изменить область" open={editOpen} onCancel={() => { setEditOpen(false); setEditing(null); }} onOk={async () => { try { const values = await editForm.validateFields(); if (!editing) return; await update.mutateAsync({ id: editing.id, payload: values }); message.success('Обновлено'); setEditOpen(false); setEditing(null); } catch { message.error('Не удалось обновить'); } }}>
          <Form form={editForm} layout="vertical">
            <Form.Item name="name" label="Название" rules={rules.knowledgeAreaName()}>
              <Input placeholder="Например: Математика" maxLength={100} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </AppLayout>
  );
};

export default KnowledgeAreasPage;
