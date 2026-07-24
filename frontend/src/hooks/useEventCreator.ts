import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventCreatorAPI } from '../services/api';

// Event Creator Stats Hook
export const useEventCreatorStats = () => {
  return useQuery({
    queryKey: ['event-creator', 'stats'],
    queryFn: async () => {
      const data = await eventCreatorAPI.getStats();
      return data || {
        totalEvents: 0,
        publishedEvents: 0,
        draftEvents: 0,
        totalAttendees: 0,
        upcomingEvents: 0
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Event Creator Events Hooks
export const useEventCreatorEvents = () => {
  return useQuery({
    queryKey: ['event-creator', 'events'],
    queryFn: async () => {
      const data = await eventCreatorAPI.getEvents();
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventCreatorAPI.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-creator', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['event-creator', 'stats'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      eventCreatorAPI.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-creator', 'events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventCreatorAPI.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-creator', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['event-creator', 'stats'] });
    },
  });
};

// Event Creator Attendees Hooks
export const useEventCreatorAttendees = () => {
  return useQuery({
    queryKey: ['event-creator', 'attendees'],
    queryFn: async () => {
      const data = await eventCreatorAPI.getAttendees();
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
