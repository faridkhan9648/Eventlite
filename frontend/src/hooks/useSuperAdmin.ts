import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminAPI } from '../services/api';

// Super Admin Stats Hook
export const useSuperAdminStats = () => {
  return useQuery({
    queryKey: ['super-admin', 'stats'],
    queryFn: superAdminAPI.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Super Admin Tenants Hooks
export const useSuperAdminTenants = () => {
  return useQuery({
    queryKey: ['super-admin', 'tenants'],
    queryFn: superAdminAPI.getTenants,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: superAdminAPI.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'tenants'] });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      superAdminAPI.updateTenant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'tenants'] });
    },
  });
};

export const useDeleteTenant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: superAdminAPI.deleteTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'tenants'] });
    },
  });
};

// Super Admin Users Hooks
export const useSuperAdminUsers = () => {
  return useQuery({
    queryKey: ['super-admin', 'users'],
    queryFn: superAdminAPI.getUsers,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: superAdminAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      superAdminAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: superAdminAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'users'] });
    },
  });
};

// Super Admin Events Hooks
export const useSuperAdminEvents = () => {
  return useQuery({
    queryKey: ['super-admin', 'events'],
    queryFn: superAdminAPI.getEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Super Admin Reports Hooks
export const useSuperAdminReports = () => {
  return useQuery({
    queryKey: ['super-admin', 'reports'],
    queryFn: superAdminAPI.getReports,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Super Admin Settings Hooks
export const useSuperAdminSettings = () => {
  return useQuery({
    queryKey: ['super-admin', 'settings'],
    queryFn: superAdminAPI.getSettings,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: superAdminAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'settings'] });
    },
  });
};
