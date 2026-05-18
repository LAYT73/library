import React from 'react';
import { Layout, Button, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../shared/lib/store';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuthStore();

  return (
    <Header
      style={{
        padding: '0 16px',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{ fontSize: '16px' }}
        />
      </Tooltip>
      <div style={{ fontSize: 14, color: '#666' }}>
        Welcome, {user?.fullName}
      </div>
    </Header>
  );
};
