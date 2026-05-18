import React from 'react';
import { Result, Button } from 'antd';
import { AppLayout } from '../../widgets/layout/AppLayout';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Result
        status="success"
        title="Добро пожаловать в систему управления библиотекой"
        subTitle="Управляйте библиотекой эффективно"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => navigate('/catalog')}
              style={{ marginRight: 8 }}
            >
              Перейти в каталог
            </Button>
            <Button onClick={() => navigate('/reports')}>
              Посмотреть отчёты
            </Button>
          </>
        }
      />
    </AppLayout>
  );
};
