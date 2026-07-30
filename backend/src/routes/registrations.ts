import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuthRequest, UserRole } from '../types';
import { authenticate } from '../middleware/auth';
import { allowRoles } from '../middleware/rbac';

const router = Router();

// Validation schemas
const registerForEventSchema = z.object({
  eventId: z.string()
});

// Register for event (Attendee only)
router.post('/', authenticate, allowRoles(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = registerForEventSchema.parse(req.body);

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ error: 'Event is not available for registration' });
    }

    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if user is already registered
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.registeredEvents?.some(id => id.toString() === eventId)) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Register user for event
    event.currentAttendees += 1;
    await event.save();

    user.registeredEvents = user.registeredEvents || [];
    user.registeredEvents.push(new mongoose.Types.ObjectId(eventId));
    await user.save();

    res.json({
      message: 'Successfully registered for event',
      eventId,
      currentAttendees: event.currentAttendees,
      maxAttendees: event.maxAttendees
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Event registration error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Get user's event registrations
router.get('/my-registrations', authenticate, allowRoles(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).populate('registeredEvents');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const registeredEvents = await Event.find({
      _id: { $in: user.registeredEvents || [] }
    }).sort({ startDate: 1 });

    res.json({
      registrations: registeredEvents.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
        status: event.status,
        registrationDate: event.createdAt,
        qrCode: event.qrCode
      }))
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Cancel event registration (Attendee only)
router.delete('/:eventId', authenticate, allowRoles(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!user.registeredEvents?.some(id => id.toString() === eventId)) {
      return res.status(400).json({ error: 'Not registered for this event' });
    }

    // Remove registration
    event.currentAttendees = Math.max(0, event.currentAttendees - 1);
    await event.save();

    user.registeredEvents = user.registeredEvents.filter(id => id.toString() !== eventId);
    await user.save();

    res.json({
      message: 'Registration cancelled successfully',
      eventId,
      currentAttendees: event.currentAttendees
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

export { router as registrationRoutes };
