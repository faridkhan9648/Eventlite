import { Router, Response } from 'express';
import { z } from 'zod';
import { Registration } from '../models/Registration';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { authenticateToken, requireRole } from '../middleware/rbac';
import { UserRole } from '../types';
import QRCode from 'qrcode';

const router = Router();

// Validation schemas
const registrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  customFields: z.record(z.any()).optional()
});

// Get public events with custom fields
router.get('/public-events', async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ 
      isPublic: true, 
      status: 'published' 
    }).select('title description date location maxAttendees currentAttendees customFields createdBy createdAt');
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get event details with custom fields
router.get('/event-details/:eventId', async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Public registration endpoint
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = registrationSchema.parse(req.body);
    
    // Check if event exists and is public
    const event = await Event.findById(validatedData.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (!event.isPublic) {
      return res.status(403).json({ error: 'Event is not open for public registration' });
    }
    
    if (event.requireApproval) {
      return res.status(403).json({ error: 'Event requires approval' });
    }
    
    // Check if event is full
    const currentRegistrations = await Registration.countDocuments({ 
      eventId: validatedData.eventId,
      status: { $ne: 'cancelled' }
    });
    
    if (event.maxAttendees && currentRegistrations >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      eventId: validatedData.eventId,
      userId: validatedData.userId,
      status: { $ne: 'cancelled' },
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Validate custom fields
    const validatedCustomFields: Record<string, any> = {};
    if (event.customFields) {
      for (const field of event.customFields) {
        const fieldValue = validatedData.customFields?.[field.name];
        
        // Check required fields
        if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
          return res.status(400).json({ 
            error: `${field.name} is required` 
          });
        }
        
        // Validate field type
        if (fieldValue !== undefined && fieldValue !== null) {
          switch (field.type) {
            case 'email':
              const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
              if (!emailRegex.test(fieldValue)) {
                return res.status(400).json({ 
                  error: `${field.name} must be a valid email` 
                });
              }
              break;
            case 'phone':
              const phoneRegex = /^[\+]?[1-9][\d\s-]{7,15}$/;
              if (!phoneRegex.test(fieldValue.replace(/\s/g, ''))) {
                return res.status(400).json({ 
                  error: `${field.name} must be a valid phone number` 
                });
              }
              break;
            case 'number':
              if (isNaN(Number(fieldValue))) {
                return res.status(400).json({ 
                  error: `${field.name} must be a valid number` 
                });
              }
              break;
            case 'select':
              if (field.options && !field.options.includes(fieldValue)) {
                return res.status(400).json({ 
                  error: `${field.name} must be one of: ${field.options.join(', ')}` 
                });
              }
              break;
          }
        }
        
        validatedCustomFields[field.name] = fieldValue;
      }
    }
    
    // Create registration
    const registration = new Registration({
      eventId: validatedData.eventId,
      userId: validatedData.userId,
      customFields: validatedCustomFields,
      status: 'confirmed',
      registeredAt: new Date()
    });
    
    await registration.save();
    
    // Generate scannable QR code containing plain registration ID
    const qrCodeUrl = await QRCode.toDataURL(registration.registrationId!, {
      errorCorrectionLevel: 'M',
      margin: 2,
    });
    registration.qrCode = qrCodeUrl;
    await registration.save();
    
    // Update event attendee count
    await Event.findByIdAndUpdate(validatedData.eventId, {
      $inc: { currentAttendees: 1 }
    });
    
    res.status(201).json({
      message: 'Registration successful',
      registrationId: registration.registrationId,
      qrCode: qrCodeUrl,
      event: {
        title: event.title,
        date: event.startDate,
        location: event.location
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || 'Invalid registration data' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get registration details
router.get('/registration/:registrationId', async (req: AuthRequest, res: Response) => {
  try {
    const registration = await Registration.findOne({ 
      registrationId: req.params.registrationId 
    }).populate('eventId userId');
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Always regenerate from registration ID so QR payload stays simple and scannable
    registration.qrCode = await QRCode.toDataURL(registration.registrationId!, {
      errorCorrectionLevel: 'M',
      margin: 2,
    });
    await registration.save();
    
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// Download QR code
router.get('/qr-code/:registrationId', async (req: AuthRequest, res: Response) => {
  try {
    const registration = await Registration.findOne({ 
      registrationId: req.params.registrationId 
    });
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    let qrCode = registration.qrCode;

    if (!qrCode?.startsWith('data:image')) {
      qrCode = await QRCode.toDataURL(registration.registrationId!, {
        errorCorrectionLevel: 'M',
        margin: 2,
      });
      registration.qrCode = qrCode;
      await registration.save();
    }
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${registration.registrationId}.png"`);
    
    const base64Data = qrCode.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    res.send(imageBuffer);
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get attendee registrations (protected)
router.get('/', authenticateToken, requireRole(UserRole.ATTENDEE), async (req: AuthRequest, res: Response) => {
  try {
    console.log('Attendee Registrations Request - User:', req.user!.username);
    
    const userId = req.user!.id;
    
    const registrations = await Registration.find({
      userId,
      status: { $ne: 'cancelled' },
    })
      .populate('eventId')
      .sort({ registeredAt: -1 });
    
    const formattedRegistrations = registrations.map((registration) => {
      const event = registration.eventId as any;
      return {
        id: registration._id,
        registrationId: registration.registrationId,
        title: event?.title || 'Unknown Event',
        description: event?.description || '',
        date: event?.startDate || event?.date,
        location: event?.location || '',
        maxAttendees: event?.maxAttendees || 0,
        currentAttendees: event?.currentAttendees || 0,
        status: registration.status,
        registrationDate: registration.registeredAt,
        qrCode: registration.qrCode,
        checkedIn: registration.status === 'checked-in',
        event: event ? {
          title: event.title,
          startDate: event.startDate,
          location: event.location,
        } : null,
      };
    });
    
    console.log('Attendee Registrations Response:', formattedRegistrations.length, 'registrations');
    res.json(formattedRegistrations);
  } catch (error) {
    console.error('Error fetching attendee registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

export { router as registrationRoutes };
