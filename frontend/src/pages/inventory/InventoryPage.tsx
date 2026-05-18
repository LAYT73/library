import React from 'react';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { Card, Typography, Space, Button, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

export const InventoryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Card title="Инвентарь">
        <Typography.Paragraph>
          Раздел для управления экземплярами книг, их статусами и списаниями.
        </Typography.Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" title="Экземпляры">
              <Space direction="vertical">
                <Typography.Text>
                  Просмотр, добавление и изменение статуса экземпляров книг.
                </Typography.Text>
                <Button type="primary" onClick={() => navigate('/inventory/copies')}>
                  Перейти к экземплярам
                </Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Списания">
              <Space direction="vertical">
                <Typography.Text>
                  Оформление списаний по причине утраты, износа или выбытия.
                </Typography.Text>
                <Button onClick={() => navigate('/write-offs')}>
                  Перейти к списаниям
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </AppLayout>
  );
};

export default InventoryPage;
