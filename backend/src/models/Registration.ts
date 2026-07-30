import mongoose, { Schema, Types } from 'mongoose';

export interface IRegistration {
  eventId?: string;
  userId?: Types.ObjectId;
  customFields?: Record<string, any>;
  qrCode?: string;
  registrationId?: string;
  registeredAt?: Date;
  checkedInAt?: Date;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'checked-in';
}

const registrationSchema = new Schema<IRegistration>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  customFields: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  },
  qrCode: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'checked-in'],
    default: 'pending'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  checkedInAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate unique QR code for registration
registrationSchema.pre('save', async function(next) {
  if (!this.qrCode) {
    const crypto = await import('crypto');
    const uniqueData = `${this.registrationId}-${this.userId}-${Date.now()}`;
    this.qrCode = crypto.createHash('sha256').update(uniqueData).digest('hex');
  }
  next();
});

export const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);
