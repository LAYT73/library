import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  BookOutlined,
  CopyOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  PlusOutlined,
  FileSearchOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../shared/lib/store';
import { UserRole } from '../../shared/types';
import { useNavigate } from 'react-router-dom';

const { Sider } = Layout;

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'catalog',
      icon: <BookOutlined />,
      label: 'Каталог',
      children: [
        { key: 'books', label: 'Книги', onClick: () => navigate('/catalog') },
        { key: 'authors', label: 'Авторы', onClick: () => navigate('/authors') },
      ],
    },
    {
      key: 'inventory',
      icon: <CopyOutlined />,
      label: 'Экземпляры',
      children: [
        { key: 'copies', label: 'Экземпляры книг', onClick: () => navigate('/inventory/copies') },
        { key: 'write-offs', label: 'Списания', onClick: () => navigate('/write-offs') },
      ],
      disabled: !hasRole([UserRole.ADMIN, UserRole.LIBRARIAN]),
    },
    {
      key: 'procurement',
      icon: <ShoppingOutlined />,
      label: 'Закупки',
      children: [
        { key: 'suppliers', label: 'Поставщики', onClick: () => navigate('/procurement/suppliers') },
        { key: 'purchase-requests', label: 'Заявки', onClick: () => navigate('/procurement/purchase-requests') },
        { key: 'orders', label: 'Заказы', onClick: () => navigate('/procurement/orders') },
      ],
      disabled: !hasRole([UserRole.ADMIN, UserRole.LIBRARIAN]),
    },
    {
      key: 'acquisitions',
      icon: <PlusOutlined />,
      label: 'Поступления',
      onClick: () => navigate('/acquisitions'),
      disabled: !hasRole([UserRole.ADMIN, UserRole.LIBRARIAN]),
    },
    {
      key: 'donations',
      icon: <FileTextOutlined />,
      label: 'Пожертвования',
      onClick: () => navigate('/donations'),
      disabled: !hasRole([UserRole.ADMIN, UserRole.LIBRARIAN]),
    },
    {
      key: 'coverage',
      icon: <FileSearchOutlined />,
      label: 'Книгообеспеченность',
      onClick: () => navigate('/coverage'),
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Отчёты',
      onClick: () => navigate('/reports'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Пользователи',
      onClick: () => navigate('/users'),
      disabled: !hasRole(UserRole.ADMIN),
    },
  ];

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} width={200}>
      <div
        style={{
          padding: '16px',
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '16px',
        }}
      >
        {!collapsed && 'Библиотека'}
      </div>
      <Menu theme="dark" mode="inline" items={menuItems} />
      <div style={{ padding: '16px', borderTop: '1px solid #434343' }}>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 8 }}>
          {!collapsed && `${user?.fullName} (${user?.role})`}
        </div>
        <Button
          type="primary"
          danger
          block
          onClick={handleLogout}
          icon={<LogoutOutlined />}
        >
          {!collapsed && 'Выйти'}
        </Button>
      </div>
    </Sider>
  );
};
