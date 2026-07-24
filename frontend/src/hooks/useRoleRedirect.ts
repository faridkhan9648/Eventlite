import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/rbac';

export const useRoleRedirect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case UserRole.SUPER_ADMIN:
          navigate('/admin');
          break;
        case UserRole.EVENT_CREATOR:
          navigate('/creator');
          break;
        case UserRole.STAFF:
          navigate('/staff');
          break;
        case UserRole.ATTENDEE:
          navigate('/attendee');
          break;
        default:
          navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);
};
