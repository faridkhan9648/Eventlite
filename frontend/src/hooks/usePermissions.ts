import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Permission, UserRole, ROLE_PERMISSIONS } from '../types/rbac';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const permissions = useMemo(() => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const allowedRoles = Array.isArray(role) ? role : [role];
    return allowedRoles.includes(user.role);
  };

  const isSuperAdmin = (): boolean => {
    return hasRole(UserRole.SUPER_ADMIN);
  };

  const isEventCreator = (): boolean => {
    return hasRole([UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN]);
  };

  const isStaff = (): boolean => {
    return hasRole([UserRole.STAFF, UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN]);
  };

  const isAttendee = (): boolean => {
    return hasRole(UserRole.ATTENDEE);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
    isEventCreator,
    isStaff,
    isAttendee
  };
};
