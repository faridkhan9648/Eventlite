import { Router, Response } from 'express';
import { z } from 'zod';
import { Registration } from '../models/Registration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuthRequest } from '../types';

const router = Router();

// Validation schema
const checkInSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required')
});

// QR Code check-in endpoint
router.post('/checkin', async (req: AuthRequest, res: Response) => {
  try {
    const { qrCode } = checkInSchema.parse(req.body);
    
    // Find registration by QR code or registration ID
    const registration = await Registration.findOne({
      $or: [
        { qrCode: qrCode },
        { registrationId: qrCode }
      ]
    }).populate('eventId userId');
    
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        error: 'Registration not found' 
      });
    }
    
    // Check if already checked in
    if (registration.checkedInAt) {
      return res.status(409).json({ 
        success: false, 
        error: 'Already checked in',
        registrationId: registration.registrationId
      });
    }
    
    // Validate event is active
    const event = registration.eventId as any;
    const now = new Date();
    
    if (event.status !== 'published') {
      return res.status(400).json({ 
        success: false, 
        error: 'Event is not active' 
      });
    }
    
    // Check if event has started and not ended
    if (now < event.startDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Event has not started yet' 
      });
    }
    
    if (now > event.endDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Event has already ended' 
      });
    }
    
    // Mark as checked in
    await Registration.findByIdAndUpdate(registration._id, {
      checkedInAt: now,
      status: 'checked-in'
    });
    
    // Get user details
    const user = registration.userId as any;
    
    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      registrationId: registration.registrationId,
      attendeeName: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      eventTitle: event.title,
      checkedInAt: now
    });
    
  } catch (error) {
    console.error('Check-in error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: error.errors[0]?.message || 'Invalid request' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Check-in failed' 
    });
  }
});

// Get check-in statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ 
        error: 'Event ID is required' 
      });
    }
    
    // Get total registrations
    const totalRegistrations = await Registration.countDocuments({ 
      eventId: eventId as string 
    });
    
    // Get checked-in registrations
    const checkedInCount = await Registration.countDocuments({ 
      eventId: eventId as string,
      checkedInAt: { $exists: true }
    });
    
    // Get recent check-ins
    const recentCheckIns = await Registration.find({ 
      eventId: eventId as string,
      checkedInAt: { $exists: true }
    })
    .populate('userId')
    .sort({ checkedInAt: -1 })
    .limit(10);
    
    res.json({
      eventId,
      totalRegistrations,
      checkedInCount,
      checkInRate: totalRegistrations > 0 ? (checkedInCount / totalRegistrations * 100).toFixed(1) : 0,
      recentCheckIns: recentCheckIns.map(reg => ({
        registrationId: reg.registrationId,
        attendeeName: (reg.userId as any).username || 'Unknown',
        checkedInAt: reg.checkedInAt
      }))
    });
    
  } catch (error) {
    console.error('Check-in stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch check-in statistics' 
    });
  }
});

// Get attendee check-in history
router.get('/history/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const checkInHistory = await Registration.find({ 
      userId 
    })
    .populate('eventId')
    .sort({ checkedInAt: -1 });
    
    res.json({
      history: checkInHistory.map(reg => ({
        registrationId: reg.registrationId,
        eventTitle: (reg.eventId as any).title,
        eventDate: (reg.eventId as any).startDate,
        checkedInAt: reg.checkedInAt,
        status: reg.status
      }))
    });
    
  } catch (error) {
    console.error('Check-in history error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch check-in history' 
    });
  }
});

export { router as attendanceRoutes };
