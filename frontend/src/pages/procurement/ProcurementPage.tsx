import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Tabs, Empty, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export const ProcurementPage: React.FC = () => {
  const navigate = useNavigate();
  const items = [
    { key: 'requests', label: 'Заявки', children: <Empty description="Список заявок и создание доступны на отдельной странице" /> },
    { key: 'orders', label: 'Заказы', children: <Empty description="Создание заказов доступно на отдельной странице" /> },
    { key: 'suppliers', label: 'Поставщики', children: <Empty description="Поставщики доступны на отдельной странице" /> },
  ];

  return (
    <AppLayout>
      <Card title="Закупки">
        <Space wrap style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={() => navigate('/procurement/suppliers')}>Поставщики</Button>
          <Button onClick={() => navigate('/procurement/purchase-requests')}>Заявки</Button>
          <Button onClick={() => navigate('/procurement/orders')}>Заказы</Button>
          <Button onClick={() => navigate('/acquisitions')}>Приобретения</Button>
        </Space>
        <Tabs defaultActiveKey="requests" items={items} />
      </Card>
    </AppLayout>
  );
};

export default ProcurementPage;
