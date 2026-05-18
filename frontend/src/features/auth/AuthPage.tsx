import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Library</h1>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'login',
              label: 'Login',
              children: <LoginForm onSuccess={onSuccess} />,
            },
            {
              key: 'register',
              label: 'Register',
              children: <RegisterForm onSuccess={onSuccess} />,
            },
          ]}
        />
      </Card>
    </div>
  );
};
