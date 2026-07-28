import axios from 'axios';
import AuthUtils from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use((response) => {
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
  return response;
});

// Super Admin APIs
export const superAdminAPI = {
  // Users
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getTenants: async () => {
    const response = await api.get('/admin/tenants');
    return response.data;
  },
  
  // Events
  getEvents: async () => {
    const response = await api.get('/admin/events');
    return response.data;
  },
  
  // Reports
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  
  // Stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};

// Event Creator APIs
export const eventCreatorAPI = {
  // Events (only their events)
  getEvents: async () => {
    const response = await api.get('/creator/events');
    return response.data;
  },
  
  createEvent: async (data: any) => {
    const response = await api.post('/creator/events', data);
    return response.data;
  },
  
  updateEvent: async (id: string, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },
  
  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  
  // Attendees for their events
  getAttendees: async () => {
    const response = await api.get('/creator/attendees');
    return response.data;
  },
  
  // Stats
  getStats: async () => {
    const response = await api.get('/creator/stats');
    return response.data;
  }
};

// Creator APIs
export const creatorAPI = {
  // Events (only their events)
  getEvents: async () => {
    const response = await api.get('/creator/events');
    return response.data;
  },
  
  createEvent: async (data: any) => {
    const response = await api.post('/creator/events', data);
    return response.data;
  },
  
  updateEvent: async (id: string, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },
  
  deleteEvent: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
  
  // Attendees for their events
  getAttendees: async () => {
    const response = await api.get('/creator/attendees');
    return response.data;
  },
  
  // Stats
  getStats: async () => {
    const response = await api.get('/creator/stats');
    return response.data;
  }
};

// Staff APIs
export const staffAPI = {
  // Events (assigned events)
  getEvents: async () => {
    const response = await api.get('/staff/events');
    return response.data;
  },
  
  // Attendance
  scanQR: async (qrCode: string) => {
    const response = await api.post('/attendance/checkin', { qrCode });
    return response.data;
  },
  
  getAttendance: async () => {
    const response = await api.get('/staff/attendance');
    return response.data;
  },
  
  getAttendanceStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  },
  
  // Stats
  getStats: async () => {
    const response = await api.get('/staff/stats');
    return response.data;
  }
};

// Attendee APIs
export const attendeeAPI = {
  // Events (available events)
  getEvents: async () => {
    const response = await api.get('/events/public-events');
    return response.data;
  },
  
  // Registrations
  getRegistrations: async () => {
    const response = await api.get('/registrations');
    return response.data;
  },
  
  // Profile
  getProfile: async () => {
    const response = await api.get('/attendee/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/attendee/profile', data);
    return response.data;
  },
  
  // Stats
  getStats: async () => {
    const response = await api.get('/attendee/stats');
    return response.data;
  },
  
  // Register for event (authenticated attendee)
  registerForEvent: async (eventId: string, customFields?: Record<string, unknown>) => {
    const user = AuthUtils.getUserFromToken(AuthUtils.getToken());
    if (!user?.id) {
      throw new Error('You must be logged in to register for events');
    }
    const response = await api.post('/registration/register', {
      eventId,
      userId: user.id,
      customFields: customFields || {},
    });
    return response.data;
  },

  // Cancel registration
  cancelRegistration: async (eventId: string) => {
    const response = await api.delete(`/registrations/${eventId}`);
    return response.data;
  },
};

// Public / Registration APIs
export const publicAPI = {
  getPublicEvents: async () => {
    const response = await api.get('/events/public-events');
    return response.data;
  },

  getEventDetails: async (eventId: string) => {
    const response = await api.get(`/registration/event-details/${eventId}`);
    const event = response.data;
    return {
      ...event,
      date: event.date || event.startDate,
    };
  },

  registerForEvent: async (eventId: string, customFields?: Record<string, unknown>) => {
    const user = AuthUtils.getUserFromToken(AuthUtils.getToken());
    if (!user?.id) {
      throw new Error('You must be logged in to register for events');
    }
    const response = await api.post('/registration/register', {
      eventId,
      userId: user.id,
      customFields: customFields || {},
    });
    return response.data;
  },
  
  getRegistrationQR: async (registrationId: string) => {
    const response = await api.get(`/registration/registration/${registrationId}`);
    return response.data;
  },
  
  downloadQR: async (registrationId: string) => {
    const response = await api.get(`/registration/qr-code/${registrationId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;
