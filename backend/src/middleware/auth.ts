import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { AuthRequest, UserRole, Permission } from '../types';

// Enhanced authentication middleware with role and permissions
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('🔐 Auth Debug - Headers:', req.headers);
  console.log('🔐 Auth Debug - Auth Header:', authHeader);
  console.log('🔐 Auth Debug - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ Auth Error: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token);
    console.log('🔐 Auth Debug - Token decoded:', decoded);
    
    const user = await User.findById(decoded.sub);
    console.log('🔐 Auth Debug - User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ Auth Error: User not found for ID:', decoded.sub);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.getPermissions()
    };
    
    console.log('✅ Auth Success: User authenticated:', req.user.username);
    next();
  } catch (error) {
    console.log('❌ Auth Error: Invalid token -', error);
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
};

// Alias for authenticateToken
export const authenticate = authenticateToken;
