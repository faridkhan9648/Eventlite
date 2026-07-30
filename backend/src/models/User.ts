import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';
import { UserRole, ROLE_PERMISSIONS } from '../types/rbac';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.ATTENDEE,
    required: true
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  primaryColor: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshToken: {
    type: String,
    default: null
  },
  registeredEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }],
  assignedEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user permissions
userSchema.methods.getPermissions = function(): string[] {
  return ROLE_PERMISSIONS[this.role] || [];
};

// Check if user has specific permission
userSchema.methods.hasPermission = function(permission: string): boolean {
  const permissions = this.getPermissions();
  return permissions.includes(permission);
};

// Check if user has any of the specified permissions
userSchema.methods.hasAnyPermission = function(permissions: string[]): boolean {
  const userPermissions = this.getPermissions();
  return permissions.some(permission => userPermissions.includes(permission));
};

// Check if user has all specified permissions
userSchema.methods.hasAllPermissions = function(permissions: string[]): boolean {
  const userPermissions = this.getPermissions();
  return permissions.every(permission => userPermissions.includes(permission));
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

// Create default super admin if none exists
userSchema.statics.createDefaultSuperAdmin = async function() {
  const existingSuperAdmin = await this.findOne({ role: UserRole.SUPER_ADMIN });
  if (!existingSuperAdmin) {
    const superAdminData = {
      username: 'superadmin',
      email: 'admin@eventlite.com',
      password: 'admin123456', // Change this in production
      role: UserRole.SUPER_ADMIN
    };
    
    const superAdmin = new this(superAdminData);
    await superAdmin.save();
    console.log('Default super admin created:', { username: superAdminData.username, email: superAdminData.email });
  }
};

// Add static method to the model interface
interface UserModel extends mongoose.Model<IUser> {
  createDefaultSuperAdmin(): Promise<void>;
}

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
