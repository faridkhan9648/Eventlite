import type { User } from './rbac';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  qrCode?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  tags?: string[];
  imageUrl?: string;
}

export interface EventFilter {
  status?: EventStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  createdBy?: string;
  tags?: string[];
}

export interface EventListResponse {
  events: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
  checkedInAt?: string;
  registeredAt: string;
  user?: User;
}

export interface QRCodeData {
  eventId: string;
  qrCode: string;
  expiresAt: string;
}
