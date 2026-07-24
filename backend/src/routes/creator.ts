import { Router, Response } from 'express';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { AuthRequest, UserRole } from '../types';

const router = Router();

// Get creator stats (protected)
router.get('/stats', authenticateToken, requireRole(UserRole.EVENT_CREATOR), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creator Stats Request - User:', req.user!.username);
    
    const userId = req.user!.id;
    
    // Get user's events
    const events = await Event.find({ createdBy: userId });
    
    // Calculate stats
    const totalEvents = events.length;
    const publishedEvents = events.filter(event => event.status === 'published').length;
    const draftEvents = events.filter(event => event.status === 'draft').length;
    const totalAttendees = events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
    const upcomingEvents = events.filter(event => new Date(event.date || new Date()) > new Date()).length;
    
    const stats = {
      totalEvents,
      publishedEvents,
      draftEvents,
      totalAttendees,
      upcomingEvents
    };
    
    console.log('Creator Stats Response:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get creator events (protected)
router.get('/events', authenticateToken, requireRole(UserRole.EVENT_CREATOR), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creator Events Request - User:', req.user!.username);
    
    const userId = req.user!.id;
    
    const events = await Event.find({ createdBy: userId })
      .select('title description date location maxAttendees currentAttendees status createdAt')
      .sort({ createdAt: -1 });
    
    console.log('Creator Events Response:', events.length, 'events');
    res.json(events);
  } catch (error) {
    console.error('Error fetching creator events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get creator attendees (protected)
router.get('/attendees', authenticateToken, requireRole(UserRole.EVENT_CREATOR), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Creator Attendees Request - User:', req.user!.username);
    
    const userId = req.user!.id;
    
    // Get user's events with their registrations
    const events = await Event.find({ createdBy: userId });
    
    // Flatten all registrations from all events
    const attendeeRecords = [];
    
    for (const event of events) {
      if (event.registrations && event.registrations.length > 0) {
        for (const registration of event.registrations) {
          // Get user details for each registration
          const user = await User.findById(registration.attendeeId);
          if (user) {
            attendeeRecords.push({
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
    
    console.log('Creator Attendees Response:', attendeeRecords.length, 'records');
    res.json(attendeeRecords);
  } catch (error) {
    console.error('Error fetching creator attendees:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

// Create event (protected)
router.post('/events', authenticateToken, requireRole(UserRole.EVENT_CREATOR), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Create Event Request - User:', req.user!.username);
    
    const { title, description, location, date, maxAttendees, status } = req.body;
    const userId = req.user!.id;
    
    // Validate required fields
    if (!title || !description || !location || !date || !maxAttendees) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    // Create new event
    const event = new Event({
      title,
      description,
      location,
      date: new Date(date),
      maxAttendees: parseInt(maxAttendees),
      status: status || 'draft',
      createdBy: userId,
      currentAttendees: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await event.save();
    
    console.log('Event Created:', event.title);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export { router as creatorRoutes };
