import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Spin, Empty, Button, Modal, Form, InputNumber, Pagination, message } from 'antd';
import { useCopies, useCreateCopy, useChangeCopyStatus } from '../../entities/copy/api';
import { CopyTable } from '../../entities/copy/CopyTable';
import type { Copy } from '../../shared/types';

export const CopiesPage: React.FC = () => {
  const [skip, setSkip] = React.useState(0);
  const { data, isLoading } = useCopies(skip, 25);
  const create = useCreateCopy();
  const changeStatus = useChangeCopyStatus();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  if (isLoading) return (
    <AppLayout>
      <Spin size="large" />
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <Empty description="Экземпляры не найдены" />
    </AppLayout>
  );

  const handleChangeStatus = async (c: Copy) => {
    const next = c.status === 'AVAILABLE' ? 'ISSUED' : 'AVAILABLE';
    try {
      await changeStatus.mutateAsync({ id: c.id, status: next });
      message.success('Статус обновлён');
    } catch (e) {
      message.error('Не удалось обновить статус');
    }
  };

  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>Добавить экземпляр</Button>
      </div>

      <CopyTable copies={data.data} loading={isLoading} onChangeStatus={handleChangeStatus} onRowClick={() => {}} />

      <Pagination
        current={data.page}
        total={data.total}
        pageSize={data.pageSize}
        onChange={(page) => setSkip((page - 1) * data.pageSize)}
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Modal title="Создать экземпляр" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        const values = await form.validateFields();
        await create.mutateAsync({ inventoryNumber: values.inventoryNumber, bookId: Number(values.bookId) });
        form.resetFields();
        setOpen(false);
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="inventoryNumber" label="Инвентарный номер" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="bookId" label="ID книги" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default CopiesPage;
