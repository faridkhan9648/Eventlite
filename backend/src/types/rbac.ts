export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  EVENT_CREATOR = 'event_creator',
  STAFF = 'staff',
  ATTENDEE = 'attendee'
}

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_LIST = 'user:list',
  
  // Role Management
  ROLE_ASSIGN = 'role:assign',
  ROLE_UPDATE = 'role:update',
  
  // Event Management
  EVENT_CREATE = 'event:create',
  EVENT_READ = 'event:read',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  EVENT_LIST = 'event:list',
  EVENT_PUBLISH = 'event:publish',
  
  // Event Operations
  EVENT_REGISTER = 'event:register',
  EVENT_CHECKIN = 'event:checkin',
  EVENT_MANAGE_ATTENDEES = 'event:manage_attendees',
  
  // System Management
  SYSTEM_CONFIG = 'system:config',
  SYSTEM_MONITOR = 'system:monitor',
  
  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export'
}

export interface RolePermissions {
  [key: string]: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_LIST,
    Permission.ROLE_ASSIGN,
    Permission.ROLE_UPDATE,
    Permission.EVENT_CREATE,
    Permission.EVENT_READ,
    Permission.EVENT_UPDATE,
    Permission.EVENT_DELETE,
    Permission.EVENT_LIST,
    Permission.EVENT_PUBLISH,
    Permission.EVENT_REGISTER,
    Permission.EVENT_CHECKIN,
    Permission.EVENT_MANAGE_ATTENDEES,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITOR,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT
  ],
  
  [UserRole.EVENT_CREATOR]: [
    // Event management
    Permission.EVENT_CREATE,
    Permission.EVENT_READ,
    Permission.EVENT_UPDATE,
    Permission.EVENT_DELETE,
    Permission.EVENT_LIST,
    Permission.EVENT_PUBLISH,
    Permission.EVENT_MANAGE_ATTENDEES,
    Permission.EVENT_CHECKIN,
    Permission.ANALYTICS_VIEW,
    
    // Limited user access
    Permission.USER_READ,
    Permission.USER_LIST
  ],
  
  [UserRole.STAFF]: [
    // Event operations
    Permission.EVENT_READ,
    Permission.EVENT_LIST,
    Permission.EVENT_CHECKIN,
    Permission.EVENT_MANAGE_ATTENDEES,
    Permission.ANALYTICS_VIEW,
    
    // Limited user access
    Permission.USER_READ,
    Permission.USER_LIST
  ],
  
  [UserRole.ATTENDEE]: [
    // Basic access
    Permission.EVENT_READ,
    Permission.EVENT_LIST,
    Permission.EVENT_REGISTER,
    
    // Self access
    Permission.USER_READ
  ]
};

export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}
