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
        title="Welcome to Library Management System"
        subTitle="Manage your library efficiently"
        extra={
          <>
            <Button
              type="primary"
              onClick={() => navigate('/catalog')}
              style={{ marginRight: 8 }}
            >
              Browse Catalog
            </Button>
            <Button onClick={() => navigate('/reports')}>
              View Reports
            </Button>
          </>
        }
      />
    </AppLayout>
  );
};
