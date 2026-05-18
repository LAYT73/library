import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Form, InputNumber, Button, message } from 'antd';
import { apiClient } from '../../shared/api/client';

export const OrdersPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      await apiClient.getClient().post(`/orders/from-request/${values.requestId}`, { supplierId: values.supplierId });
      message.success('Заказ создан');
      form.resetFields();
    } catch (e) {
      message.error('Не удалось создать заказ');
    }
  };

  return (
    <AppLayout>
      <Form layout="vertical" form={form} style={{ maxWidth: 480 }}>
        <Form.Item name="requestId" label="ID заявки" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="supplierId" label="ID поставщика" rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleCreate}>Создать заказ из заявки</Button>
        </Form.Item>
      </Form>
    </AppLayout>
  );
};

export default OrdersPage;
