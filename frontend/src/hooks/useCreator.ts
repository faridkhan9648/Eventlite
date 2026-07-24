import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorAPI } from '../services/api';

// Creator Stats Hook
export const useCreatorStats = () => {
  return useQuery({
    queryKey: ['creator', 'stats'],
    queryFn: async () => {
      const data = await creatorAPI.getStats();
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

// Creator Events Hook
export const useCreatorEvents = () => {
  return useQuery({
    queryKey: ['creator', 'events'],
    queryFn: async () => {
      const data = await creatorAPI.getEvents();
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Creator Attendees Hook
export const useCreatorAttendees = () => {
  return useQuery({
    queryKey: ['creator', 'attendees'],
    queryFn: creatorAPI.getAttendees,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: creatorAPI.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['creator', 'stats'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      creatorAPI.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['creator', 'stats'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: creatorAPI.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['creator', 'stats'] });
    },
  });
};
