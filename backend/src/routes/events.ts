import { Router, Response } from 'express';
import { z } from 'zod';
import { Event } from '../models/Event';
import { AuthRequest, UserRole } from '../types';
import { authenticate } from '../middleware/auth';
import { allowRoles } from '../middleware/rbac';

const router = Router();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().min(1).max(200),
  maxAttendees: z.number().min(1).max(10000),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional()
});

const updateEventSchema = createEventSchema.partial();

const eventFilterSchema = z.object({
  status: z.enum(['draft', 'published', 'closed', 'cancelled']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().optional(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()).optional()
});

// Get public events (no authentication required)
router.get('/public-events', async (req: AuthRequest, res: Response) => {
  try {
    // Include published events that are upcoming or ongoing (or started within the last 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const events = await Event.find({ 
      status: 'published',
      $or: [
        { endDate: { $gte: new Date() } },
        { startDate: { $gte: yesterday } }
      ]
    }).sort({ startDate: 1 });

    res.json(events.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.startDate || event.date,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      isPublic: event.isPublic !== undefined ? event.isPublic : true,
      requireApproval: event.requireApproval || false,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    })));
  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({ error: 'Failed to fetch public events' });
  }
});

// Get all events with filters and pagination
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = eventFilterSchema.parse(req.query);

    // Build query
    const query: any = {};
    
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } }
      ];
    }
    if (filters.startDate) query.startDate = { $gte: new Date(filters.startDate) };
    if (filters.endDate) query.endDate = { $lte: new Date(filters.endDate) };
    if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
    if (filters.createdBy) query.createdBy = filters.createdBy;
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    // Staff can only see events assigned to them
    if (req.user?.role === UserRole.STAFF) {
      query.assignedStaff = req.user.id;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Event.countDocuments(query)
    ]);

    res.json({
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
        status: event.status,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        qrCode: event.qrCode,
        tags: event.tags,
        imageUrl: event.imageUrl
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Search events (separate endpoint)
router.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { query, ...filters } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchQuery = query as string;
    const validatedFilters = eventFilterSchema.parse(filters);

    const searchRegex = { $regex: searchQuery, $options: 'i' };
    const queryObj: any = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    };

    // Apply filters
    if (validatedFilters.status) queryObj.status = validatedFilters.status;
    if (validatedFilters.startDate) queryObj.startDate = { $gte: new Date(validatedFilters.startDate) };
    if (validatedFilters.endDate) queryObj.endDate = { $lte: new Date(validatedFilters.endDate) };

    const events = await Event.find(queryObj).sort({ createdAt: -1 });

    res.json(events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      qrCode: event.qrCode,
      tags: event.tags,
      imageUrl: event.imageUrl
    })));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Search events error:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// Get single event
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Staff can only see events assigned to them
    if (req.user?.role === UserRole.STAFF && !event.assignedStaff.some(staffId => staffId.toString() === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      qrCode: event.qrCode,
      tags: event.tags,
      imageUrl: event.imageUrl
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (Event Creator only)
router.post('/', authenticate, allowRoles(UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createEventSchema.parse(req.body);

    const event = new Event({
      ...validatedData,
      createdBy: req.user!.id,
      status: 'draft'
    });

    await event.save();

    res.status(201).json({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      qrCode: event.qrCode,
      tags: event.tags,
      imageUrl: event.imageUrl
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (Event Creator only)
router.put('/:id', authenticate, allowRoles(UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateEventSchema.parse(req.body);

    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Event Creator can only update their own events
    if (req.user?.role === UserRole.EVENT_CREATOR && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.assign(event, validatedData);
    event.updatedAt = new Date();
    await event.save();

    res.json({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      qrCode: event.qrCode,
      tags: event.tags,
      imageUrl: event.imageUrl
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (Event Creator only)
router.delete('/:id', authenticate, allowRoles(UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Event Creator can only delete their own events
    if (req.user?.role === UserRole.EVENT_CREATOR && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Publish event (Event Creator only)
router.post('/:id/publish', authenticate, allowRoles(UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Event Creator can only publish their own events
    if (req.user?.role === UserRole.EVENT_CREATOR && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    event.status = 'published';
    event.updatedAt = new Date();
    await event.save();

    res.json({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      qrCode: event.qrCode,
      tags: event.tags,
      imageUrl: event.imageUrl
    });
  } catch (error) {
    console.error('Publish event error:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
});

// Close event (Event Creator only)
router.post('/:id/close', authenticate, allowRoles(UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Event Creator can only close their own events
    if (req.user?.role === UserRole.EVENT_CREATOR && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    event.status = 'closed';
    event.updatedAt = new Date();
    await event.save();

    res.json({
      id: event._id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      status: event.status,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      qrCode: event.qrCode,
      tags: event.tags,
      imageUrl: event.imageUrl
    });
  } catch (error) {
    console.error('Close event error:', error);
    res.status(500).json({ error: 'Failed to close event' });
  }
});

// Generate QR code for event
router.get('/:id/qrcode', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Staff can only access QR codes for assigned events
    if (req.user?.role === UserRole.STAFF && !event.assignedStaff.some(staffId => staffId.toString() === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate QR code data (mock implementation)
    const qrCodeData = `EVENT_${event._id}_${Date.now()}`;
    
    // Update event with QR code
    event.qrCode = qrCodeData;
    await event.save();

    res.json({
      eventId: event._id,
      qrCode: qrCodeData,
      expiresAt: event.endDate
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export { router as eventRoutes };
