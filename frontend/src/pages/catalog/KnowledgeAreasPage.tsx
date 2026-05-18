import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Table, Button, Modal, Form, Input, Space, Popconfirm, Spin, Empty, message } from 'antd';
import { getServerPagination } from '../../shared/lib/pagination';
import { useKnowledgeAreas, useCreateKnowledgeArea, useUpdateKnowledgeArea, useDeleteKnowledgeArea } from '../../entities/knowledgeArea/api';

export const KnowledgeAreasPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useKnowledgeAreas(skip, 25);
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
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={() => setOpen(true)}>Создать область знаний</Button>
        </div>

        <Table rowKey="id" dataSource={data.data} pagination={getServerPagination(data, setSkip)} columns={[
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
            <Form.Item name="name" label="Название" rules={[{ required: true }]}>
              <Input placeholder="Например: Математика" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal title="Изменить область" open={editOpen} onCancel={() => { setEditOpen(false); setEditing(null); }} onOk={async () => { try { const values = await editForm.validateFields(); if (!editing) return; await update.mutateAsync({ id: editing.id, payload: values }); message.success('Обновлено'); setEditOpen(false); setEditing(null); } catch { message.error('Не удалось обновить'); } }}>
          <Form form={editForm} layout="vertical">
            <Form.Item name="name" label="Название" rules={[{ required: true }]}>
              <Input placeholder="Например: Математика" />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </AppLayout>
  );
};

export default KnowledgeAreasPage;
