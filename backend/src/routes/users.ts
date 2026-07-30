import { Router, Response } from 'express';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { AuthRequest, UserRole } from '../types';

const router = Router();

// Get user profile (protected)
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile (protected)
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { username, email } = req.body;
    
    // Validate input
    if (!username && !email) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: req.user?.id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : [])
        ]
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username or email is already taken' 
        });
      }
    }

    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get attendee stats (protected)
router.get('/attendee/stats', authenticateToken, requireRole(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
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
        name: nextEvent.title,
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

export { router as userRoutes };
