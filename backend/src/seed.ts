import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { UserRole } from './types/rbac';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create test users for each role
    const users = [
      {
        username: 'superadmin',
        email: 'superadmin@eventlite.com',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.SUPER_ADMIN,
        name: 'Super Admin',
        isVerified: true
      },
      {
        username: 'eventcreator1',
        email: 'creator1@eventlite.com',
        password: await bcrypt.hash('creator123', 10),
        role: UserRole.EVENT_CREATOR,
        name: 'Event Creator 1',
        isVerified: true
      },
      {
        username: 'eventcreator2',
        email: 'creator2@eventlite.com',
        password: await bcrypt.hash('creator123', 10),
        role: UserRole.EVENT_CREATOR,
        name: 'Event Creator 2',
        isVerified: true
      },
      {
        username: 'staff1',
        email: 'staff1@eventlite.com',
        password: await bcrypt.hash('staff123', 10),
        role: UserRole.STAFF,
        name: 'Staff Member 1',
        isVerified: true
      },
      {
        username: 'staff2',
        email: 'staff2@eventlite.com',
        password: await bcrypt.hash('staff123', 10),
        role: UserRole.STAFF,
        name: 'Staff Member 2',
        isVerified: true
      },
      {
        username: 'attendee1',
        email: 'attendee1@eventlite.com',
        password: await bcrypt.hash('attendee123', 10),
        role: UserRole.ATTENDEE,
        name: 'Attendee 1',
        isVerified: true
      },
      {
        username: 'attendee2',
        email: 'attendee2@eventlite.com',
        password: await bcrypt.hash('attendee123', 10),
        role: UserRole.ATTENDEE,
        name: 'Attendee 2',
        isVerified: true
      },
      {
        username: 'attendee3',
        email: 'attendee3@eventlite.com',
        password: await bcrypt.hash('attendee123', 10),
        role: UserRole.ATTENDEE,
        name: 'Attendee 3',
        isVerified: true
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log('✅ Created test users:');

    createdUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}): ${user.email}`);
    });

    console.log('\n📝 Login Credentials:');
    console.log('   Super Admin: superadmin / admin123');
    console.log('   Event Creator: eventcreator1 / creator123');
    console.log('   Staff: staff1 / staff123');
    console.log('   Attendee: attendee1 / attendee123');

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
