import { Router, Response } from 'express';
import { Event } from '../models/Event';
import { Registration } from '../models/Registration';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { AuthRequest, UserRole } from '../types';

const router = Router();

router.get('/stats', authenticateToken, requireRole(UserRole.STAFF), async (req: AuthRequest, res: Response) => {
  try {
    const staffId = req.user!.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const assignedEvents = await Event.countDocuments({
      $or: [{ assignedStaff: staffId }, { status: 'published' }],
    });

    const totalCheckIns = await Registration.countDocuments({ status: 'checked-in' });

    const todayCheckIns = await Registration.countDocuments({
      status: 'checked-in',
      checkedInAt: { $gte: today, $lt: tomorrow },
    });

    const pendingCheckIns = await Registration.countDocuments({
      status: 'confirmed',
    });

    res.json({
      assignedEvents,
      totalCheckIns,
      todayCheckIns,
      pendingCheckIns,
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

router.get('/events', authenticateToken, requireRole(UserRole.STAFF), async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ status: 'published' })
      .select('title description startDate endDate location maxAttendees currentAttendees status createdAt')
      .sort({ startDate: 1 });

    const eventsWithCheckIns = await Promise.all(
      events.map(async (event) => {
        const checkedInAttendees = await Registration.countDocuments({
          eventId: event._id,
          status: 'checked-in',
        });

        return {
          id: event._id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          maxAttendees: event.maxAttendees,
          currentAttendees: event.currentAttendees,
          checkedInAttendees,
          status: event.status,
        };
      })
    );

    res.json(eventsWithCheckIns);
  } catch (error) {
    console.error('Error fetching staff events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/attendance', authenticateToken, requireRole(UserRole.STAFF), async (req: AuthRequest, res: Response) => {
  try {
    const registrations = await Registration.find({ status: { $ne: 'cancelled' } })
      .populate('eventId userId')
      .sort({ registeredAt: -1 });

    const attendanceRecords = registrations.map((registration) => {
      const event = registration.eventId as {
        title?: string;
        startDate?: Date;
        location?: string;
      } | null;
      const user = registration.userId as {
        username?: string;
        name?: string;
        email?: string;
      } | null;

      return {
        id: registration._id,
        registrationId: registration.registrationId,
        attendeeName: user?.name || user?.username || 'Unknown',
        attendeeEmail: user?.email || '',
        eventName: event?.title || 'Unknown Event',
        eventDate: event?.startDate,
        eventLocation: event?.location || '',
        registrationDate: registration.registeredAt,
        checkedIn: registration.status === 'checked-in',
        checkInTime: registration.checkedInAt || null,
        status: registration.status,
      };
    });

    res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching staff attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance data' });
  }
});

export { router as staffRoutes };
