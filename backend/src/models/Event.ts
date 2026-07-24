import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  date: Date;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  assignedStaff: mongoose.Types.ObjectId[];
  qrCode?: string;
  tags: string[];
  imageUrl?: string;
  isPublic: boolean;
  requireApproval: boolean;
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'email' | 'phone' | 'select' | 'checkbox';
    required: boolean;
    options?: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1,
    max: 10000
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  requireApproval: {
    type: Boolean,
    default: false
  },
  customFields: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'email', 'phone', 'select', 'checkbox'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      type: String
    }]
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedStaff: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  qrCode: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better performance
EventSchema.index({ title: 'text', description: 'text', location: 'text' });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDate: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ date: 1 });

// Validation: endDate must be after startDate
EventSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
