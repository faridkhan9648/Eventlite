import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/rbac';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback = <Navigate to="/unauthorized" replace />
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Check if user is logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(user.role)) {
    return fallback;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
