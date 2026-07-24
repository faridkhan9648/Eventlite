import type { Event, EventFormData, EventFilter, EventListResponse, QRCodeData } from '../types/event';

const API_BASE_URL = 'http://localhost:5001/api/events';

class EventAPI {
  // Get all events with filters and pagination
  static async getEvents(
    filters: EventFilter = {},
    page: number = 1,
    limit: number = 10
  ): Promise<EventListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await fetch(`${API_BASE_URL}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return response.json();
  }

  // Get single event by ID
  static async getEvent(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }

    return response.json();
  }

  // Create new event
  static async createEvent(eventData: EventFormData): Promise<Event> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create event');
    }

    return response.json();
  }

  // Update existing event
  static async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update event');
    }

    return response.json();
  }

  // Delete event
  static async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete event');
    }
  }

  // Publish event
  static async publishEvent(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to publish event');
    }

    return response.json();
  }

  // Close event
  static async closeEvent(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/${id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to close event');
    }

    return response.json();
  }

  // Get QR code for event
  static async getQRCode(eventId: string): Promise<QRCodeData> {
    const response = await fetch(`${API_BASE_URL}/${eventId}/qrcode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    return response.json();
  }

  // Get event attendees
  static async getAttendees(eventId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/${eventId}/attendees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attendees');
    }

    return response.json();
  }

  // Search events
  static async searchEvents(query: string, filters: EventFilter = {}): Promise<Event[]> {
    const searchParams = new URLSearchParams({
      search: query,
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await fetch(`${API_BASE_URL}/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search events');
    }

    return response.json();
  }
}

export default EventAPI;
