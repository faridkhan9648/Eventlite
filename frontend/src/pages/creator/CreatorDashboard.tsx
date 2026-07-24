import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Calendar, 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { 
  useEventCreatorStats,
  useEventCreatorEvents
} from '../../hooks/useEventCreator';

export const CreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // React Query hooks for data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useEventCreatorStats();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useEventCreatorEvents();
  
  const isLoading = statsLoading || eventsLoading;
  const hasError = statsError || eventsError;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Reload
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.publishedEvents || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-bold text-gray-900">{(stats?.totalRegistrations || 0).toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.upcomingEvents || 0}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Events</CardTitle>
                <Button
                  onClick={() => navigate('/creator/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{event.title || event.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location || 'TBD'}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.startDate ? formatDate(event.startDate) : 'TBD'}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {event.currentAttendees || 0}/{event.maxAttendees || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={event.status} />
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No events yet"
                  description="Create your first event to get started."
                  action={
                    <Button
                      onClick={() => navigate('/creator/create')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};
