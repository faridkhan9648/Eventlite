import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendeeAPI } from '../services/api';

// Attendee Stats Hook
export const useAttendeeStats = () => {
  return useQuery({
    queryKey: ['attendee', 'stats'],
    queryFn: async () => {
      console.log('Fetching attendee stats...');
      try {
        const result = await attendeeAPI.getStats();
        console.log('Attendee stats result:', result);
        return result;
      } catch (error) {
        console.error('Attendee stats error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Attendee Events Hooks
export const useAttendeeEvents = () => {
  return useQuery({
    queryKey: ['attendee', 'events'],
    queryFn: attendeeAPI.getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Attendee Registrations Hooks
export const useAttendeeRegistrations = () => {
  return useQuery({
    queryKey: ['attendee', 'registrations'],
    queryFn: async () => {
      console.log('Fetching attendee registrations...');
      try {
        const result = await attendeeAPI.getRegistrations();
        console.log('Attendee registrations result:', result);
        return result;
      } catch (error) {
        console.error('Attendee registrations error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, customFields }: { eventId: string; customFields: any }) => 
      attendeeAPI.registerForEvent(eventId, customFields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee', 'registrations'] });
      queryClient.invalidateQueries({ queryKey: ['attendee', 'stats'] });
    },
  });
};

// Attendee Profile Hooks
export const useAttendeeProfile = () => {
  return useQuery({
    queryKey: ['attendee', 'profile'],
    queryFn: attendeeAPI.getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateAttendeeProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: attendeeAPI.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendee', 'profile'] });
    },
  });
};
