import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/lib/store';
import type { UserRoleType } from '../../shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRoleType | UserRoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, hasRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
