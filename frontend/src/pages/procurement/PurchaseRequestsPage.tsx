import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Button, Modal, Form, InputNumber } from 'antd';
import { useCreatePurchaseRequest } from '../../entities/purchaseRequest/api';

export const PurchaseRequestsPage: React.FC = () => {
  const create = useCreatePurchaseRequest();
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();

  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setOpen(true)}>Создать заявку на закупку</Button>
      </div>

      <p>Список заявок доступен через API; просматривайте заявки по ID.</p>

      <Modal title="Создать заявку на закупку" open={open} onCancel={() => setOpen(false)} onOk={async () => {
        const values = await form.validateFields();
        await create.mutateAsync({ items: [{ bookId: Number(values.bookId), quantity: Number(values.quantity) }] });
        form.resetFields();
        setOpen(false);
      }}>
        <Form form={form} layout="vertical">
          <Form.Item name="bookId" label="ID книги" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Количество" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default PurchaseRequestsPage;
