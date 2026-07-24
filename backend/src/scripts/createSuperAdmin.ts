import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.username);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      username: 'admin',
      email: 'admin@eventlite.com',
      password: 'admin123456', // Change this in production
      role: 'super_admin'
    });

    await superAdmin.save();
    console.log('✅ Super admin created successfully!');
    console.log('Email: admin@eventlite.com');
    console.log('Password: admin123456');
    console.log('Role: super_admin');
    console.log('\n⚠️  IMPORTANT: Change the password in production!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
