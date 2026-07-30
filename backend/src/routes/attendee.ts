import { Router, Response } from 'express';
import { Registration } from '../models/Registration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { AuthRequest, UserRole } from '../types';

const router = Router();

// Get attendee profile (protected)
router.get('/profile', authenticateToken, requireRole(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Attendee Profile Request - User:', req.user!.username);
    
    const user = await User.findById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching attendee profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update attendee profile (protected)
router.put('/profile', authenticateToken, requireRole(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Update Attendee Profile Request - User:', req.user!.username);
    
    const { firstName, lastName, phone } = req.body;
    const userId = req.user!.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error updating attendee profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get attendee stats (protected)
router.get('/stats', authenticateToken, requireRole(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Attendee Stats Request - User:', req.user!.username);
    
    const userId = req.user!.id;
    
    const registrations = await Registration.find({
      userId,
      status: { $ne: 'cancelled' },
    }).populate('eventId');

    const now = new Date();
    const registeredEvents = registrations.length;
    const attendedEvents = registrations.filter((r) => r.status === 'checked-in').length;
    const upcomingEvents = registrations.filter((r) => {
      const event = r.eventId as any;
      const eventDate = event?.startDate || event?.date;
      return eventDate && new Date(eventDate) > now;
    }).length;
    const pastEvents = registrations.filter((r) => {
      const event = r.eventId as any;
      const eventDate = event?.startDate || event?.date;
      return eventDate && new Date(eventDate) <= now;
    }).length;

    const stats = {
      registeredEvents,
      attendedEvents,
      upcomingEvents,
      pastEvents,
      totalEvents: registeredEvents,
    };
    
    console.log('Attendee Stats Response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching attendee stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export { router as attendeeRoutes };
