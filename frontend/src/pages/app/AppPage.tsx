import React, { useEffect } from 'react';
import { Result, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/lib/store';
import { useProfile } from '../../shared/hooks/useAuth';

export const AppPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setUser } = useAuthStore();
  const { data: profile, isLoading } = useProfile();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        navigate('/login');
      }
    } else if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, setUser, navigate]);

  useEffect(() => {
    if (profile && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [profile, isAuthenticated, navigate]);

  if (isLoading) {
    return <Spin size="large" />;
  }

  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="The page you are looking for does not exist"
    />
  );
};
