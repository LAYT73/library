import React, { useState } from 'react';
import { Layout } from 'antd';
import { Sidebar } from '../sidebar/Sidebar';
import { AppHeader } from '../header/Header';

const { Content } = Layout;

interface LayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <Content
          style={{
            margin: '16px',
            padding: '16px',
            background: '#fff',
            borderRadius: '4px',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
