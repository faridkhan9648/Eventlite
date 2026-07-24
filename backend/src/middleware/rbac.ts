import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { AuthRequest, UserRole, Permission } from '../types';

// Enhanced authentication middleware with role and permissions
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.getPermissions()
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
};

// Simple authentication middleware (alias for authenticateToken)
export const authenticate = authenticateToken;

// Role-based access control middleware
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Allow roles middleware (alias for requireRole)
export const allowRoles = requireRole;

// Permission-based access control middleware
export const requirePermission = (permissions: Permission | Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    const userPermissions = req.user.permissions || [];
    
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermissions,
        current: userPermissions
      });
    }

    next();
  };
};

// Multiple permissions check (all required)
export const requireAllPermissions = (permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissions,
        current: userPermissions
      });
    }

    next();
  };
};

// Self-access or role-based access middleware
export const requireSelfOrRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const targetUserId = req.params.id || req.params.userId;
    
    // Allow access if user is accessing their own data
    if (req.user.id === targetUserId) {
      return next();
    }

    // Allow access if user has required role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Insufficient permissions',
      message: 'You can only access your own data or need elevated permissions'
    });
  };
};

// Super admin only middleware
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

// Event creator or higher middleware
export const requireEventCreatorOrHigher = requireRole([UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN]);

// Staff or higher middleware
export const requireStaffOrHigher = requireRole([UserRole.STAFF, UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN]);
