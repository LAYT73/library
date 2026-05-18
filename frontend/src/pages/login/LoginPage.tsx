import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/AuthPage';
import { useAuthStore } from '../../shared/lib/store';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return <AuthPage onSuccess={() => navigate('/dashboard')} />;
};
