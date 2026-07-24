import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthUtils from '../utils/auth';
import { Permission, UserRole } from '../types/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
  requireAll?: boolean;
  permissions?: Permission[];
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = <Navigate to="/login" replace />,
  requireAll = false,
  permissions = [],
  requiredRoles = []
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !AuthUtils.hasRole(user, requiredRole)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Check multiple roles
  if (requiredRoles.length > 0 && !AuthUtils.hasAnyRole(user, requiredRoles)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Check single permission
  if (requiredPermission && !AuthUtils.hasPermission(user, requiredPermission)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasPermissions = requireAll 
      ? AuthUtils.hasAllPermissions(user, permissions)
      : AuthUtils.hasAnyPermission(user, permissions);
    
    if (!hasPermissions) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Higher-order component for role-based protection
export const withRoleProtection = (
  WrappedComponent: React.ComponentType,
  requiredRoles: UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};

// Higher-order component for permission-based protection
export const withPermissionProtection = (
  WrappedComponent: React.ComponentType,
  requiredPermissions: Permission[],
  requireAll = false
) => {
  return (props: any) => (
    <ProtectedRoute 
      permissions={requiredPermissions} 
      requireAll={requireAll}
    >
      <WrappedComponent {...props} />
    </ProtectedRoute>
  );
};
