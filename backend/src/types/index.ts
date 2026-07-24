import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { UserRole, Permission } from './rbac';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  getPermissions(): Permission[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
}

// Re-export types for easier importing
export { UserRole, Permission };
