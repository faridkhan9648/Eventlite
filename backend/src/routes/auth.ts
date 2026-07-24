import { Router, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest, LoginRequest, RegisterRequest, AuthResponse, UserRole } from '../types';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

// Register
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body) as RegisterRequest;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: validatedData.email }, { username: validatedData.username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Set default role and validate role assignment
    let userRole = validatedData.role || UserRole.ATTENDEE;
    
    // Only allow super admin role assignment if no super admin exists
    if (userRole === UserRole.SUPER_ADMIN) {
      const existingSuperAdmin = await User.findOne({ role: UserRole.SUPER_ADMIN });
      if (existingSuperAdmin) {
        userRole = UserRole.ATTENDEE; // Default to attendee if super admin already exists
      }
    }

    // Create new user
    const user = new User({
      ...validatedData,
      role: userRole
    });
    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    const response: AuthResponse = {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔐 Login Debug - Request body:', req.body);
    const validatedData = loginSchema.parse(req.body) as LoginRequest;
    console.log('🔐 Login Debug - Validated data:', validatedData);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    console.log('🔐 Login Debug - User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('🔐 Login Debug - User email:', user.email);
      console.log('🔐 Login Debug - User ID:', user._id);
    }
    
    if (!user) {
      console.log('❌ Login Debug: User not found for email:', validatedData.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    console.log('🔐 Login Debug - Checking password...');
    const isPasswordValid = await user.comparePassword(validatedData.password);
    console.log('🔐 Login Debug - Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Login Debug: Invalid password for user:', validatedData.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Login Debug: Authentication successful for:', user.username);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    const response: AuthResponse = {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Reset user password (for development)
router.post('/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    console.log('🔧 Resetting password for:', email);
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    console.log('✅ Password reset successful for:', email);
    res.json({ 
      message: 'Password reset successful',
      credentials: {
        email: email,
        password: newPassword
      }
    });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Create test admin (for development)
router.post('/create-test-admin', async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔧 Creating test admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@eventlite.com' });
    if (existingAdmin) {
      console.log('🔧 Admin already exists, updating password...');
      // Update password to known value
      existingAdmin.password = 'admin123456';
      existingAdmin.username = 'admin'; // Ensure username is set
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully');
      return res.json({ message: 'Admin password updated to: admin123456' });
    }
    
    // Create new admin
    const admin = new User({
      username: 'admin',
      email: 'admin@eventlite.com',
      password: 'admin123456',
      role: 'super_admin'
    });
    
    await admin.save();
    console.log('✅ Test admin created successfully');
    res.json({ 
      message: 'Test admin created',
      credentials: {
        email: 'admin@eventlite.com',
        password: 'admin123456'
      }
    });
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    res.status(500).json({ error: 'Failed to create test admin' });
  }
});

// Refresh token
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Token refresh error:', error);
    res.status(403).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Find user and remove refresh token
    await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export { router as authRoutes };
