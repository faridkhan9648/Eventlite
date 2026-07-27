import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import { Input } from '../../components/ui';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useCreatorEvents } from '../../hooks/useCreator';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';

export const EventsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: events, isLoading, error } = useCreatorEvents();

  const filteredEvents = events?.filter((event: any) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      'draft': 'secondary',
      'published': 'success'
    };
    
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

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

  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load events. Please try again.</p>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event: any) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <CardHeader>
                            <CardTitle>{event.title}</CardTitle>
                            <div className="flex space-x-2">
                              {getStatusBadge(event.status)}
                            <Badge variant="outline">
                              {event.currentAttendees || 0} / {event.maxAttendees || 0}
                            </Badge>
                          </div>
                        </CardHeader>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-gray-600 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{event.location}</span>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="No events found" 
                  description={searchTerm ? "No events match your search criteria." : "You haven't created any events yet."}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};
