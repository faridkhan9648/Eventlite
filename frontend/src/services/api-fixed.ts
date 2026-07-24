import { api } from './api';

// Event Creator APIs
export const eventCreatorAPI = {
  // Events (only their events)
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  
  createEvent: async (data: any) => {
    const response = await api.post('/events', data);
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
