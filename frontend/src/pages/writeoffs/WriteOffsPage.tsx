import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Form, Input, Button, message } from 'antd';
import { apiClient } from '../../shared/api/client';

export const WriteOffsPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleCreate = async () => {
    const values = await form.validateFields();
    try {
      const copyIds = values.copyIds.split(',').map((s: string) => Number(s.trim()));
      await apiClient.getClient().post('/write-offs', { reason: values.reason, copyIds });
      message.success('Списание создано');
      form.resetFields();
    } catch (e) {
      message.error('Не удалось создать списание');
    }
  };

  return (
    <AppLayout>
      <Card title="Списания">
        <Form form={form} layout="vertical" style={{ maxWidth: 640 }}>
          <Form.Item name="reason" label="Причина" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="copyIds" label="ID экземпляров (через запятую)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreate}>Создать списание</Button>
          </Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default WriteOffsPage;
