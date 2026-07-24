import { jwtDecode } from 'jwt-decode';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/rbac';
import type { User } from '../types/rbac';

export interface DecodedToken {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  exp: number;
}

export class AuthUtils {
  // Token validation
  static isTokenValid(token: string | null): boolean {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Get user from token
  static getUserFromToken(token: string | null): User | null {
    if (!token || !this.isTokenValid(token)) return null;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        id: decoded.sub,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || ROLE_PERMISSIONS[decoded.role],
      };
    } catch (error) {
      return null;
    }
  }

  // Check if user has specific permission
  static hasPermission(user: User | null, permission: Permission): boolean {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.some(permission => user.permissions?.includes(permission)) || false;
  }

  // Check if user has all specified permissions
  static hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.every(permission => user.permissions?.includes(permission)) || false;
  }

  // Check if user has specific role
  static hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    return user.role === role;
  }

  // Check if user has any of the specified roles
  static hasAnyRole(user: User | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  // Role-based access checks
  static canCreateEvents(user: User | null): boolean {
    return this.hasPermission(user, Permission.EVENT_CREATE);
  }

  static canEditEvents(user: User | null): boolean {
    return this.hasPermission(user, Permission.EVENT_UPDATE);
  }

  static canScanQR(user: User | null): boolean {
    return this.hasPermission(user, Permission.EVENT_CHECKIN);
  }

  static canManageAttendance(user: User | null): boolean {
    return this.hasPermission(user, Permission.EVENT_MANAGE_ATTENDEES);
  }

  static canViewEvents(user: User | null): boolean {
    return this.hasPermission(user, Permission.EVENT_READ);
  }

  static canRegisterForEvents(user: User | null): boolean {
    return this.hasPermission(user, Permission.EVENT_REGISTER);
  }

  static canViewOwnDataOnly(user: User | null): boolean {
    return this.hasRole(user, UserRole.ATTENDEE);
  }

  // Get token from localStorage
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // Store token in localStorage
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  // Remove token from localStorage
  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Refresh token logic
  static async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      this.setToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }
}

export default AuthUtils;
