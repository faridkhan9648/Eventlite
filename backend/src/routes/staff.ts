import { Router, Response } from 'express';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { AuthRequest, UserRole } from '../types';

const router = Router();

// Get staff stats (protected)
router.get('/stats', authenticateToken, requireRole(UserRole.STAFF), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Staff Stats Request - User:', req.user!.username);
    
    // Get all events
    const totalEvents = await Event.countDocuments();
    
    // Get upcoming events
    const upcomingEvents = await Event.countDocuments({
      date: { $gt: new Date() }
    });
    
    // Get today's events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEvents = await Event.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Get total attendees across all events
    const events = await Event.find({});
    const totalAttendees = events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
    
    const stats = {
      totalEvents,
      upcomingEvents,
      todayEvents,
      totalAttendees
    };
    
    console.log('Staff Stats Response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get staff events (protected)
router.get('/events', authenticateToken, requireRole(UserRole.STAFF), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Staff Events Request - User:', req.user!.username);
    
    const events = await Event.find({})
      .select('title description date location maxAttendees currentAttendees status createdAt')
      .sort({ date: 1 });
    
    console.log('Staff Events Response:', events.length, 'events');
    res.json(events);
  } catch (error) {
    console.error('Error fetching staff events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get staff attendance (protected)
router.get('/attendance', authenticateToken, requireRole(UserRole.STAFF), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Staff Attendance Request - User:', req.user!.username);
    
    // Get all events with their registrations
    const events = await Event.find({})
      .select('title date location registrations')
      .sort({ date: -1 });
    
    // Flatten all registrations from all events
    const attendanceRecords = [];
    
    for (const event of events) {
      if (event.registrations && event.registrations.length > 0) {
        for (const registration of event.registrations) {
          // Get user details for each registration
          const user = await User.findById(registration.attendeeId);
          if (user) {
            attendanceRecords.push({
              id: registration._id || `${event._id}-${registration.attendeeId}`,
              attendeeName: user.name || user.username,
              attendeeEmail: user.email,
              eventName: event.title,
              eventDate: event.date,
              eventLocation: event.location,
              registrationDate: registration.registrationDate || event.createdAt,
              checkedIn: registration.checkedIn || false,
              checkInTime: registration.checkInTime || null,
              qrCode: registration.qrCode || null,
              status: registration.checkedIn ? 'checked-in' : 'confirmed'
            });
          }
        }
      }
    }
    
    console.log('Staff Attendance Response:', attendanceRecords.length, 'records');
    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance data' });
  }
});

export { router as staffRoutes };
