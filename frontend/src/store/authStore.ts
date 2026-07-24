import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/rbac';
import AuthUtils from '../utils/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  getRoleBasedRedirect: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        const token = AuthUtils.getToken();
        if (token && AuthUtils.isTokenValid(token)) {
          const user = AuthUtils.getUserFromToken(token);
          if (user) {
            set({
              user,
              isAuthenticated: true,
              error: null,
            });
          }
        } else {
          AuthUtils.removeToken();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      getRoleBasedRedirect: () => {
        console.log('getRoleBasedRedirect called');
        const { user } = get();
        if (!user) return '/login';
        
        switch (user.role) {
          case 'super_admin':
            return '/super-admin';
          case 'event_creator':
            return '/creator';
          case 'staff':
            return '/staff';
          case 'attendee':
            return '/attendee';
          default:
            return '/dashboard';
        }
      },

      login: async (email: string, password: string) => {
        console.log('Starting login with:', { email });
        set({ isLoading: true, error: null });
        try {
          const requestBody = JSON.stringify({ email, password });
          console.log('Login request body being sent:', requestBody);
          const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          });

          console.log('Login response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Login error response:', errorData);
            throw new Error(errorData.error || 'Login failed');
          }

          const data = await response.json();
          console.log('Login success:', data);
          AuthUtils.setToken(data.accessToken);
          
          const user = AuthUtils.getUserFromToken(data.accessToken);
          console.log('User from token:', user);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Return the role-based redirect URL
          const redirectUrl = get().getRoleBasedRedirect();
          console.log('Login redirect URL:', redirectUrl);
          window.location.href = redirectUrl;
          
        } catch (error: any) {
          console.error('Login error:', error);
          set({
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      // Test backend connectivity
      testBackendConnection: async () => {
        try {
          const response = await fetch('http://localhost:5000/health');
          if (response.ok) {
            return { success: true, message: 'Backend is reachable' };
          } else {
            return { success: false, message: 'Backend responded with error' };
          }
        } catch (error) {
          return { success: false, message: 'Cannot reach backend - network error' };
        }
      },

      register: async (username: string, email: string, password: string, role?: string) => {
        console.log('Starting registration with:', { username, email, role });
        set({ isLoading: true, error: null });
        try {
          const requestBody = JSON.stringify({ username, email, password, role });
          console.log('Request body being sent:', requestBody);
          const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          });

          console.log('Registration response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Registration error response:', errorData);
            
            let errorMessage = errorData.error || 'Registration failed';
            if (errorData.error === 'User with this email or username already exists') {
              errorMessage = 'This email or username is already registered. Please use different credentials.';
            }
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw new Error(errorMessage);
          }

          const data = await response.json();
          console.log('Registration success:', data);
          AuthUtils.setToken(data.accessToken);
          
          const user = AuthUtils.getUserFromToken(data.accessToken);
          console.log('User from token:', user);
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Return the role-based redirect URL
          const redirectUrl = get().getRoleBasedRedirect();
          console.log('Redirect URL:', redirectUrl);
          window.location.href = redirectUrl;
          
        } catch (error: any) {
          console.error('Registration error:', error);
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${AuthUtils.getToken()}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          AuthUtils.removeToken();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
