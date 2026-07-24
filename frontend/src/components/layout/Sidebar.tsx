import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  Shield,
  X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePermissions } from '../../hooks/usePermissions';
import { UserRole } from '../../types/rbac';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = true, 
  onClose, 
  className 
}) => {
  const location = useLocation();
  const { hasRole, hasPermission } = usePermissions();

  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: 'Events',
      href: '/events',
      icon: <Calendar className="h-5 w-5" />,
      requiredRoles: [UserRole.ATTENDEE, UserRole.STAFF, UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      requiredRoles: [UserRole.SUPER_ADMIN]
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      requiredPermissions: ['analytics:view']
    },
    {
      label: 'Admin Panel',
      href: '/admin',
      icon: <Shield className="h-5 w-5" />,
      requiredRoles: [UserRole.STAFF, UserRole.EVENT_CREATOR, UserRole.SUPER_ADMIN]
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    }
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (item.requiredRoles && !hasRole(item.requiredRoles)) {
      return false;
    }
    if (item.requiredPermissions && !hasPermission(item.requiredPermissions as any)) {
      return false;
    }
    return true;
  });

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-150 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Navigation</h2>
          
          <button
            className="lg:hidden p-1 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                )}
              >
                <span className={cn(
                  'mr-3 h-5 w-5',
                  active ? 'text-primary-600' : 'text-neutral-400'
                )}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4">
          <div className="text-xs text-neutral-500">
            EventLite v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};

export { Sidebar };
