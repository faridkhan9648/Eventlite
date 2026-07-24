import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Home,
  QrCode,
  UserCheck,
  Search,
  LogOut,
  Menu,
  X,
  Building,
  BarChart3,
  Plus
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems: MenuItem[] = [
    {
      label: 'Overview',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/super-admin',
      roles: ['super_admin']
    },
    {
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/creator',
      roles: ['event_creator']
    },
    {
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/staff',
      roles: ['staff']
    },
    {
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/attendee',
      roles: ['attendee']
    },
    {
      label: 'Tenants',
      icon: <Building className="h-5 w-5" />,
      path: '/super-admin/tenants',
      roles: ['super_admin']
    },
    {
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
      path: '/super-admin/users',
      roles: ['super_admin']
    },
    {
      label: 'Events',
      icon: <Calendar className="h-5 w-5" />,
      path: '/super-admin/events',
      roles: ['super_admin']
    },
    {
      label: 'My Events',
      icon: <Calendar className="h-5 w-5" />,
      path: '/creator/events',
      roles: ['event_creator']
    },
    {
      label: 'Create Event',
      icon: <Plus className="h-5 w-5" />,
      path: '/creator/create',
      roles: ['event_creator']
    },
    {
      label: 'Attendees',
      icon: <Users className="h-5 w-5" />,
      path: '/creator/attendees',
      roles: ['event_creator']
    },
    {
      label: 'Scan QR',
      icon: <QrCode className="h-5 w-5" />,
      path: '/checkin',
      roles: ['staff']
    },
    {
      label: 'Attendance List',
      icon: <UserCheck className="h-5 w-5" />,
      path: '/staff/attendance',
      roles: ['staff']
    },
    {
      label: 'Browse Events',
      icon: <Search className="h-5 w-5" />,
      path: '/public-events',
      roles: ['attendee']
    },
    {
      label: 'My Registrations',
      icon: <FileText className="h-5 w-5" />,
      path: '/attendee/registration',
      roles: ['attendee']
    },
    {
      label: 'Profile',
      icon: <UserCheck className="h-5 w-5" />,
      path: '/attendee/profile',
      roles: ['attendee']
    },
    {
      label: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/super-admin/reports',
      roles: ['super_admin']
    },
    {
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/super-admin/settings',
      roles: ['super_admin']
    }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-200 flex flex-col
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:static lg:inset-0 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">EventLite</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="h-4 w-4" />}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Right Section */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600 mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Welcome back, <span className="font-medium text-gray-900">{user?.username}</span>
            </div>
            
            {/* User info in topbar for mobile */}
            <div className="lg:hidden flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
