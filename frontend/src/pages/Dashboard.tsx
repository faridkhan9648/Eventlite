import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BarChart3, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Avatar } from '../components/ui';
import { Layout } from '../components/layout';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isEventCreator, isStaff, isSuperAdmin } = usePermissions();

  const quickActions = [
    {
      title: 'My Events',
      description: 'View and manage your events',
      icon: <Calendar className="h-5 w-5" />,
      href: '/events',
      color: 'bg-primary-50 text-primary-600 border-primary-200'
    },
    {
      title: 'Analytics',
      description: 'View performance metrics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/analytics',
      color: 'bg-accent-50 text-accent-600 border-accent-200',
      requiredRoles: ['event_creator', 'staff', 'super_admin']
    },
    {
      title: 'Users',
      description: 'Manage system users',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      color: 'bg-warning-50 text-warning-600 border-warning-200',
      requiredRoles: ['super_admin']
    }
  ].filter(action => {
    if (!action.requiredRoles) return true;
    return isEventCreator() || isStaff() || isSuperAdmin();
  });

  return (
    <Layout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-neutral-600">
          Here's what's happening with your events today.
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar size="lg" />
            <div>
              <CardTitle className="text-lg">{user?.username}</CardTitle>
              <CardDescription className="capitalize">
                {user?.role?.replace('_', ' ')} • {user?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(action.href)}
            >
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-lg border ${action.color} mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-neutral-600">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Events</p>
                <p className="text-2xl font-bold text-neutral-900">--</p>
              </div>
              <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Active Users</p>
                <p className="text-2xl font-bold text-neutral-900">--</p>
              </div>
              <div className="h-12 w-12 bg-accent-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Revenue</p>
                <p className="text-2xl font-bold text-neutral-900">--</p>
              </div>
              <div className="h-12 w-12 bg-warning-50 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates from your events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-neutral-500">
            <p>No recent activity to display</p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};
