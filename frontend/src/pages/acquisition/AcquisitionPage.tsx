import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Form, InputNumber, Button, message } from 'antd';
import { useCreateAcquisitionFromOrder } from '../../entities/acquisition/api';

export const AcquisitionPage: React.FC = () => {
  const [form] = Form.useForm();
  const create = useCreateAcquisitionFromOrder();

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      await create.mutateAsync(Number(values.orderId));
      message.success('Приобретение создано из заказа');
      form.resetFields();
    } catch (e) {
      message.error('Не удалось создать приобретение');
    }
  };

  return (
    <AppLayout>
      <Card title="Приобретения">
        <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
          <Form.Item name="orderId" label="ID заказа" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreate}>Создать из заказа</Button>
          </Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default AcquisitionPage;
