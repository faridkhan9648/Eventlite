import React from 'react';
import { Users, Shield, BarChart3, Settings } from 'lucide-react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserRole, Permission } from '../types/rbac';

export const AdminDashboard: React.FC = () => {
  const adminSections = [
    {
      title: 'User Management',
      icon: Users,
      description: 'Manage system users and roles',
      requiredRoles: [UserRole.SUPER_ADMIN],
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: 'Role Management',
      icon: Shield,
      description: 'Assign and manage user roles',
      requiredPermissions: [Permission.ROLE_ASSIGN],
      color: 'bg-purple-500',
      href: '/admin/roles'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      description: 'View system analytics and reports',
      requiredPermissions: [Permission.ANALYTICS_VIEW],
      color: 'bg-green-500',
      href: '/admin/analytics'
    },
    {
      title: 'System Settings',
      icon: Settings,
      description: 'Configure system settings',
      requiredRoles: [UserRole.SUPER_ADMIN],
      color: 'bg-gray-500',
      href: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome to Admin Panel
            </h2>
            <p className="mt-2 text-gray-600">
              Manage your event system with powerful administrative tools
            </p>
          </div>

          {/* Admin Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section, index) => (
              <ProtectedRoute
                key={index}
                requiredRoles={section.requiredRoles}
                requiredPermissions={section.requiredPermissions}
                fallback={null}
              >
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                     onClick={() => window.location.href = section.href}>
                  <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-4`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {section.description}
                  </p>
                </div>
              </ProtectedRoute>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProtectedRoute requiredPermissions={[Permission.USER_LIST]}>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-sm font-medium text-gray-500">Total Users</h4>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
              </ProtectedRoute>
              
              <ProtectedRoute requiredPermissions={[Permission.ANALYTICS_VIEW]}>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-sm font-medium text-gray-500">Active Events</h4>
                  <p className="text-2xl font-bold text-gray-900">--</p>
                </div>
              </ProtectedRoute>
              
              <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="text-sm font-medium text-gray-500">System Status</h4>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
              </ProtectedRoute>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
