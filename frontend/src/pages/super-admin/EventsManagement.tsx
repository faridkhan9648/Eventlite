import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar } from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { useSuperAdminEvents } from '../../hooks/useSuperAdmin';

export const EventsManagement: React.FC = () => {
  const { data: eventsData, isLoading, error } = useSuperAdminEvents();
  
  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }
  
  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load events data. Please try again.</p>
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
    <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsData?.events?.length > 0 ? (
                <div className="space-y-4">
                  {eventsData.events.map((event: any) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-gray-600">{event.tenantName}</p>
                          <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={event.status} />
                        <Badge variant="outline">
                          {event.registrations}/{event.maxAttendees}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No events found" 
                  description="No events have been created yet."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default EventsManagement;
