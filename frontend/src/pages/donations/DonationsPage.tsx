import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Form, Input, Button, InputNumber, message } from 'antd';
import { apiClient } from '../../shared/api/client';

export const DonationsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      await apiClient.getClient().post('/donations', {
        donorName: values.donorName,
        items: [{ bookId: Number(values.bookId), quantity: Number(values.quantity) }],
      });
      message.success('Пожертвование создано');
      form.resetFields();
    } catch (e) {
      message.error('Не удалось создать пожертвование');
    }
  };

  return (
    <AppLayout>
      <Card title="Пожертвования">
        <Form form={form} layout="vertical" style={{ maxWidth: 640 }}>
          <Form.Item name="donorName" label="Имя донора" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="bookId" label="ID книги" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Количество" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreate}>Создать пожертвование</Button>
          </Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default DonationsPage;
