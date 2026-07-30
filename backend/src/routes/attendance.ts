import { Router, Response } from 'express';
import { z } from 'zod';
import { Registration } from '../models/Registration';
import { AuthRequest, UserRole } from '../types';
import { authenticateToken, requireRole } from '../middleware/rbac';

const router = Router();

const checkInSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required'),
});

function parseQrPayload(qrCode: string): { registrationId?: string; raw: string } {
  const trimmed = qrCode.trim();

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.registrationId && typeof parsed.registrationId === 'string') {
      return { registrationId: parsed.registrationId, raw: trimmed };
    }
  } catch {
    // Not JSON — fall through to plain registration ID handling
  }

  if (trimmed.startsWith('REG-')) {
    return { registrationId: trimmed, raw: trimmed };
  }

  return { raw: trimmed };
}

async function findRegistrationFromQr(qrCode: string) {
  const { registrationId, raw } = parseQrPayload(qrCode);
  const query: Record<string, unknown>[] = [];

  if (registrationId) {
    query.push({ registrationId });
  }

  query.push({ qrCode: raw });

  return Registration.findOne({ $or: query }).populate('eventId userId');
}

// QR Code check-in endpoint (staff only)
router.post(
  '/checkin',
  authenticateToken,
  requireRole(UserRole.STAFF, UserRole.SUPER_ADMIN, UserRole.EVENT_CREATOR),
  async (req: AuthRequest, res: Response) => {
    try {
      const { qrCode } = checkInSchema.parse(req.body);

      const registration = await findRegistrationFromQr(qrCode);

      if (!registration) {
        return res.status(404).json({
          success: false,
          error: 'Registration not found. Ask the attendee to show their registration QR code.',
        });
      }

      if (registration.status === 'checked-in' || registration.checkedInAt) {
        return res.status(409).json({
          success: false,
          error: 'Already checked in',
          registrationId: registration.registrationId,
        });
      }

      const event = registration.eventId as {
        title?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
      } | null;

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found for this registration',
        });
      }

      if (event.status === 'closed' || event.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Event is not active',
        });
      }

      const now = new Date();
      if (event.endDate && now > new Date(event.endDate)) {
        return res.status(400).json({
          success: false,
          error: 'Event has already ended',
        });
      }

      await Registration.findByIdAndUpdate(registration._id, {
        checkedInAt: now,
        status: 'checked-in',
      });

      const user = registration.userId as {
        username?: string;
        firstName?: string;
        lastName?: string;
      } | null;

      const attendeeName =
        user?.username ||
        `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
        'Attendee';

      res.status(200).json({
        success: true,
        message: 'Check-in successful',
        registrationId: registration.registrationId,
        attendeeName,
        eventTitle: event.title,
        checkedInAt: now,
      });
    } catch (error) {
      console.error('Check-in error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || 'Invalid request',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Check-in failed',
      });
    }
  }
);

// Get check-in statistics
router.get('/stats', authenticateToken, requireRole(UserRole.STAFF, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        error: 'Event ID is required',
      });
    }

    const totalRegistrations = await Registration.countDocuments({
      eventId: eventId as string,
      status: { $ne: 'cancelled' },
    });

    const checkedInCount = await Registration.countDocuments({
      eventId: eventId as string,
      status: 'checked-in',
    });

    const recentCheckIns = await Registration.find({
      eventId: eventId as string,
      status: 'checked-in',
    })
      .populate('userId')
      .sort({ checkedInAt: -1 })
      .limit(10);

    res.json({
      eventId,
      totalRegistrations,
      checkedInCount,
      checkInRate: totalRegistrations > 0 ? (checkedInCount / totalRegistrations * 100).toFixed(1) : 0,
      recentCheckIns: recentCheckIns.map((reg) => ({
        registrationId: reg.registrationId,
        attendeeName: (reg.userId as { username?: string })?.username || 'Unknown',
        checkedInAt: reg.checkedInAt,
      })),
    });
  } catch (error) {
    console.error('Check-in stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch check-in statistics',
    });
  }
});

// Get attendee check-in history
router.get('/history/:userId', authenticateToken, requireRole(UserRole.STAFF, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const checkInHistory = await Registration.find({
      userId,
      status: { $ne: 'cancelled' },
    })
      .populate('eventId')
      .sort({ checkedInAt: -1 });

    res.json({
      history: checkInHistory.map((reg) => ({
        registrationId: reg.registrationId,
        eventTitle: (reg.eventId as { title?: string })?.title,
        eventDate: (reg.eventId as { startDate?: Date })?.startDate,
        checkedInAt: reg.checkedInAt,
        status: reg.status,
      })),
    });
  } catch (error) {
    console.error('Check-in history error:', error);
    res.status(500).json({
      error: 'Failed to fetch check-in history',
    });
  }
});

export { router as attendanceRoutes };
