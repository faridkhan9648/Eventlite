import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAPI } from '../services/api';

// Staff Stats Hook
export const useStaffStats = () => {
  return useQuery({
    queryKey: ['staff', 'stats'],
    queryFn: staffAPI.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Staff Events Hooks
export const useStaffEvents = () => {
  return useQuery({
    queryKey: ['staff', 'events'],
    queryFn: staffAPI.getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Staff Attendance Hooks
export const useStaffAttendance = () => {
  return useQuery({
    queryKey: ['staff', 'attendance'],
    queryFn: staffAPI.getAttendance,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for real-time data
  });
};

export const useStaffAttendanceStats = () => {
  return useQuery({
    queryKey: ['staff', 'attendance-stats'],
    queryFn: staffAPI.getAttendanceStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useScanQR = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: staffAPI.scanQR,
    onSuccess: () => {
      // Refresh attendance data after successful scan
      queryClient.invalidateQueries({ queryKey: ['staff', 'attendance'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'attendance-stats'] });
    },
  });
};
