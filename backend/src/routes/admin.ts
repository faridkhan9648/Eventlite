import { Router, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { AuthRequest, UserRole, Permission } from '../types';
import { 
  authenticateToken, 
  requireSuperAdmin, 
  requirePermission,
  requireRole 
} from '../middleware/rbac';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// GET /admin/stats - Get comprehensive platform statistics
router.get('/stats', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 Admin Stats Request - User:', req.user!.username);
    
    // Get total users by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalTenants = await User.countDocuments({ role: 'event_creator' });
    
    // Get events statistics
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ status: 'published' });
    const draftEvents = await Event.countDocuments({ status: 'draft' });
    const closedEvents = await Event.countDocuments({ status: 'closed' });
    
    // Get registrations statistics
    const registrationStats = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: '$currentAttendees' },
          totalCapacity: { $sum: '$maxAttendees' }
        }
      }
    ]);
    
    const totalRegistrations = registrationStats[0]?.totalRegistrations || 0;
    const totalCapacity = registrationStats[0]?.totalCapacity || 0;
    
    // Get recent activity (last 7 days)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const recentEvents = await Event.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const stats = {
      totalTenants,
      totalUsers,
      totalEvents,
      totalRegistrations,
      publishedEvents,
      draftEvents,
      closedEvents,
      activeUsers,
      totalCapacity,
      recentActivity: {
        newUsers: recentUsers,
        newEvents: recentEvents
      },
      roleDistribution: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>)
    };
    
    console.log('✅ Admin Stats Response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /admin/users - Get all users with filtering and pagination
router.get('/users', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('👥 Admin Users Request - User:', req.user!.username);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Add tenant information for users
    const usersWithTenantInfo = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        // For event creators, count their users
        if (user.role === 'event_creator') {
          userObj.userCount = await User.countDocuments({ 
            isActive: true 
          });
        }
        
        // For non-super_admin users, find their tenant
        if (user.role !== 'super_admin') {
          userObj.tenantName = user.username; // For now, use username as tenant name
        } else {
          userObj.tenantName = 'System';
        }
        
        return userObj;
      })
    );
    
    console.log('✅ Admin Users Response:', usersWithTenantInfo.length, 'users');
    res.json({
      users: usersWithTenantInfo,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /admin/users/:id - Update user status or role
router.patch('/users/:id', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔧 Admin User Update Request - User:', req.user!.username, 'Target:', req.params.id);
    
    const { isActive, role } = req.body;
    const userId = req.params.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent super admin from modifying themselves
    if (user._id.toString() === req.user!.id) {
      return res.status(403).json({ error: 'Cannot modify your own account' });
    }
    
    // Update user
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    if (role !== undefined) {
      user.role = role;
    }
    
    await user.save();
    
    console.log('✅ Admin User Updated:', user.email);
    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /admin/events - Get all events with filtering and pagination
router.get('/events', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📅 Admin Events Request - User:', req.user!.username);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get events with pagination and populate creator info
    const events = await Event.find(query)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Event.countDocuments(query);
    
    // Format events with tenant names
    const formattedEvents = events.map(event => ({
      id: event._id,
      name: event.title,
      tenantName: (event.createdBy as any)?.username || 'Unknown',
      date: event.startDate,
      status: event.status,
      registrations: event.currentAttendees,
      maxAttendees: event.maxAttendees
    }));
    
    console.log('✅ Admin Events Response:', formattedEvents.length, 'events');
    res.json({
      events: formattedEvents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /admin/tenants - Get all tenants (event creators) with pagination
router.get('/tenants', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🏢 Admin Tenants Request - User:', req.user!.username);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get event creators (tenants)
    const tenants = await User.find({ role: 'event_creator' })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await User.countDocuments({ role: 'event_creator' });
    
    // Get user count and events count for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const userCount = await User.countDocuments({ 
          isActive: true 
        });
        
        const eventCount = await Event.countDocuments({ 
          createdBy: tenant._id 
        });
        
        return {
          id: tenant._id,
          name: tenant.username,
          logo: '', // TODO: Add logo field to user schema
          primaryColor: '#3B82F6', // Default color
          contactInfo: {
            email: tenant.email,
            phone: '+1-555-0000' // TODO: Add phone field to user schema
          },
          isActive: tenant.isActive,
          createdAt: tenant.createdAt,
          userCount,
          eventCount
        };
      })
    );
    
    console.log('✅ Admin Tenants Response:', tenantsWithStats.length, 'tenants');
    res.json({
      tenants: tenantsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// POST /admin/tenants - Create new tenant
router.post('/tenants', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('➕ Admin Create Tenant Request - User:', req.user!.username);
    
    const { name, email, password, primaryColor = '#3B82F6', contactInfo } = req.body;
    
    // Check if tenant already exists
    const existingTenant = await User.findOne({ email });
    if (existingTenant) {
      return res.status(400).json({ error: 'Tenant with this email already exists' });
    }
    
    // Create new tenant (event creator)
    const tenant = new User({
      username: name,
      email,
      password,
      role: 'event_creator',
      isActive: true
    });
    
    await tenant.save();
    
    console.log('✅ Admin Tenant Created:', tenant.email);
    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: tenant._id,
        name: tenant.username,
        email: tenant.email,
        role: tenant.role,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Error creating admin tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// PATCH /admin/tenants/:id - Update tenant status
router.patch('/tenants/:id', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔧 Admin Tenant Update Request - User:', req.user!.username, 'Target:', req.params.id);
    
    const { isActive } = req.body;
    const tenantId = req.params.id;
    
    // Find tenant
    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    if (tenant.role !== 'event_creator') {
      return res.status(400).json({ error: 'User is not a tenant' });
    }
    
    // Update tenant status
    tenant.isActive = isActive;
    await tenant.save();
    
    console.log('✅ Admin Tenant Updated:', tenant.email);
    res.json({
      message: 'Tenant updated successfully',
      tenant: {
        id: tenant._id,
        name: tenant.username,
        email: tenant.email,
        isActive: tenant.isActive
      }
    });
  } catch (error) {
    console.error('❌ Error updating admin tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// GET /admin/reports - Get all reports summary
router.get('/reports', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('Reports Request - User:', req.user!.username);
    
    // Get basic statistics for reports
    const stats = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalRegistrations: { $sum: '$currentAttendees' },
          totalCapacity: { $sum: '$maxAttendees' },
          publishedEvents: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          draftEvents: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          closedEvents: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }
      }
    ]);
    
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const reports = {
      summary: stats[0] || { totalEvents: 0, totalRegistrations: 0, totalCapacity: 0, publishedEvents: 0, draftEvents: 0, closedEvents: 0 },
      userDistribution: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      availableReports: [
        { name: 'Registrations', endpoint: '/admin/reports/registrations', description: 'Registration statistics and trends' },
        { name: 'Attendance', endpoint: '/admin/reports/attendance', description: 'Event attendance reports' },
        { name: 'Revenue', endpoint: '/admin/reports/revenue', description: 'Revenue and financial reports' }
      ]
    };
    
    console.log('Reports Response:', reports);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /admin/reports/registrations - Get registration report
router.get('/reports/registrations', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 Admin Registration Report Request - User:', req.user!.username);
    
    // Get registration statistics
    const registrationStats = await Event.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: '$currentAttendees' },
          totalCapacity: { $sum: '$maxAttendees' },
          averageRegistrations: { $avg: '$currentAttendees' }
        }
      }
    ]);
    
    // Get monthly registrations
    const monthlyRegistrations = await Event.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          registrations: { $sum: '$currentAttendees' },
          events: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    const stats = registrationStats[0] || { totalRegistrations: 0, totalCapacity: 0, averageRegistrations: 0 };
    
    const report = {
      totalRegistrations: stats.totalRegistrations,
      totalCapacity: stats.totalCapacity,
      averageRegistrations: Math.round(stats.averageRegistrations),
      occupancyRate: stats.totalCapacity > 0 ? Math.round((stats.totalRegistrations / stats.totalCapacity) * 100) : 0,
      monthlyData: monthlyRegistrations.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        registrations: item.registrations,
        events: item.events
      }))
    };
    
    console.log('✅ Admin Registration Report Response');
    res.json(report);
  } catch (error) {
    console.error('❌ Error fetching registration report:', error);
    res.status(500).json({ error: 'Failed to fetch registration report' });
  }
});

// GET /admin/reports/attendance - Get attendance report
router.get('/reports/attendance', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 Admin Attendance Report Request - User:', req.user!.username);
    
    // Mock attendance data for now
    const report = {
      totalAttendees: 8456,
      attendanceRate: 87.3,
      noShowRate: 12.7,
      monthlyData: [
        { month: '2024-01', attendees: 1234, rate: 85.2 },
        { month: '2024-02', attendees: 1456, rate: 88.1 },
        { month: '2024-03', attendees: 1678, rate: 89.5 },
        { month: '2024-04', attendees: 1890, rate: 91.2 }
      ]
    };
    
    console.log('✅ Admin Attendance Report Response');
    res.json(report);
  } catch (error) {
    console.error('❌ Error fetching attendance report:', error);
    res.status(500).json({ error: 'Failed to fetch attendance report' });
  }
});

// GET /admin/reports/revenue - Get revenue report
router.get('/reports/revenue', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('💰 Admin Revenue Report Request - User:', req.user!.username);
    
    // Mock revenue data for now
    const report = {
      totalRevenue: 124500,
      thisMonth: 18750,
      growthRate: 23.4,
      monthlyData: [
        { month: '2024-01', revenue: 28900 },
        { month: '2024-02', revenue: 32100 },
        { month: '2024-03', revenue: 35750 },
        { month: '2024-04', revenue: 27750 }
      ]
    };
    
    console.log('✅ Admin Revenue Report Response');
    res.json(report);
  } catch (error) {
    console.error('❌ Error fetching revenue report:', error);
    res.status(500).json({ error: 'Failed to fetch revenue report' });
  }
});

// Legacy routes (keeping existing functionality)
router.get('/users-legacy', requireSuperAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/role', 
  requireSuperAdmin,
  requirePermission(Permission.ROLE_ASSIGN),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Prevent self-role modification for super admin
      if (req.user!.id === id && req.user!.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
        return res.status(400).json({ error: 'Cannot modify your own super admin role' });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
      ).select('-password -refreshToken');

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User role updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

router.delete('/users/:id', 
  requireSuperAdmin,
  requirePermission(Permission.USER_DELETE),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (req.user!.id === id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

router.post('/create-default-admin', async (req: AuthRequest, res: Response) => {
  try {
    await User.createDefaultSuperAdmin();
    res.json({ message: 'Default super admin check completed' });
  } catch (error) {
    console.error('Create default admin error:', error);
    res.status(500).json({ error: 'Failed to create default admin' });
  }
});

export { router as adminRoutes };
