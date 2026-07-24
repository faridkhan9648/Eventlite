import { Router, Response } from 'express';
import { User } from '../models/User';
import { Event } from '../models/Event';
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
    
    // Find and update user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
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
    
    // Get user's registered events
    const registeredEvents = await Event.find({
      'registrations.attendeeId': userId
    });
    
    // Calculate stats
    const totalEvents = registeredEvents.length;
    const upcomingEvents = registeredEvents.filter(event => 
      new Date(event.date) > new Date()
    ).length;
    const pastEvents = registeredEvents.filter(event => 
      new Date(event.date) <= new Date()
    ).length;
    
    // Get next event
    const nextEvent = registeredEvents
      .filter(event => new Date(event.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    
    const stats = {
      totalEvents,
      upcomingEvents,
      pastEvents,
      nextEvent: nextEvent ? {
        id: nextEvent._id,
        name: nextEvent.name,
        date: nextEvent.date,
        location: nextEvent.location
      } : null
    };
    
    console.log('Attendee Stats Response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching attendee stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export { router as attendeeRoutes };
