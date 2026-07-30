import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { Button } from '../../components/ui';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin,
  Search,
  Ticket
} from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { 
  useAttendeeStats,
  useAttendeeRegistrations
} from '../../hooks/useAttendee';
import { runAttendeeDiagnostics } from '../../debug/test-attendee';

export const AttendeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // React Query hooks for data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useAttendeeStats();
  const { data: registrations, isLoading: registrationsLoading, error: registrationsError } = useAttendeeRegistrations();
  
  const isLoading = statsLoading || registrationsLoading;
  const hasError = statsError || registrationsError;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const handleViewQRCode = (registrationId: string) => {
    navigate(`/registration-qr/${registrationId}`);
  };

  // Render loading state
  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
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
      <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
              <div className="mt-4 space-x-4">
                <Button onClick={() => window.location.reload()}>
                  Reload
                </Button>
                <Button onClick={() => runAttendeeDiagnostics()} variant="outline">
                  Run Diagnostics
                </Button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
      <DashboardLayout>
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Registered Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.registeredEvents || 0}</p>
                    </div>
                    <Ticket className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Attended Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.attendedEvents || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
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
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Past Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.pastEvents || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Browse Events Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Browse Events</h3>
                    <p className="text-sm text-gray-600">Discover and register for upcoming events</p>
                  </div>
                  <Button
                    onClick={() => navigate('/public-events')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Events</h3>
                  <p className="text-gray-500 mb-6">Browse and register for events that match your interests</p>
                  <Button
                    onClick={() => navigate('/public-events')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Events
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* My Registrations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">My Registrations</h3>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/attendee/registrations')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {registrations && registrations.length > 0 ? (
                  <div className="space-y-4">
                    {registrations.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.event?.title || event.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {event.event?.startDate ? formatDate(event.event.startDate) : 'TBD'}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {event.event?.location || 'TBD'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={event.status} />
                          {event.registrationId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewQRCode(event.registrationId)}
                            >
                              QR Code
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No registrations yet"
                    description="Browse events and register to attend them."
                    action={
                      <Button
                        onClick={() => navigate('/public-events')}
                        icon={<Search className="h-4 w-4" />}
                      >
                        Browse Events
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

export default AttendeeDashboard;
