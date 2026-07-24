import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { adminRoutes } from './routes/admin';
import { eventRoutes } from './routes/events';
import { registrationRoutes } from './routes/registration';
import { attendanceRoutes } from './routes/attendance';
import { attendeeRoutes } from './routes/attendee';
import { staffRoutes } from './routes/staff';
import { creatorRoutes } from './routes/creator';
import { User } from './models/User';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.198.1:3000', 'http://192.168.40.1:3000', 'http://192.168.63.177:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle pre-flight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/registration', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendee', attendeeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/creator', creatorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Create default super admin if none exists
    await User.createDefaultSuperAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
