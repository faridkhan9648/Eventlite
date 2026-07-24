import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  QrCode, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin,
  UserCheck
} from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { 
  useStaffStats,
  useStaffEvents
} from '../../hooks/useStaff';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // React Query hooks for data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useStaffStats();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useStaffEvents();
  
  const isLoading = statsLoading || eventsLoading;
  const hasError = statsError || eventsError;

  const handleScanQR = (eventId: string) => {
    navigate(`/staff/scan?eventId=${eventId}`);
  };


  // Render loading state
  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.STAFF]}>
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
      <RoleProtectedRoute allowedRoles={[UserRole.STAFF]}>
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
    <RoleProtectedRoute allowedRoles={[UserRole.STAFF]}>
      <DashboardLayout>
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Assigned Events</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.assignedEvents || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalCheckIns || 0}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today&apos;s Check-ins</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.todayCheckIns || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.pendingCheckIns || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* QR Scanner Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">QR Scanner</h3>
                    <p className="text-sm text-gray-600">Quick scan for event check-in</p>
                  </div>
                  <Button
                    onClick={() => navigate('/checkin')}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Open Scanner
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-center mb-4">
                    Click &quot;Open Scanner&quot; to start scanning QR codes for event check-in
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Assigned Events</h3>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/staff/attendance')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event: any) => (
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
                                <Users className="w-4 h-4 mr-1" />
                                {event.checkedInAttendees || 0}/{event.currentAttendees || 0}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">
                              {event.currentAttendees && event.checkedInAttendees 
                                ? Math.round((event.checkedInAttendees / event.currentAttendees) * 100)
                                : 0}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={event.status === 'active' ? 'success' : 'default'}>
                            {event.status}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleScanQR(event.id)}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No assigned events"
                    description="You haven&apos;t been assigned to any events yet."
                  />
                )}
              </CardContent>
            </Card>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default StaffDashboard;
