import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Button } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { Calendar, MapPin, Mail, Phone } from 'lucide-react';
import { useEventCreatorAttendees } from '../../hooks/useEventCreator';


export const AttendeesList: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'checked-in' | 'cancelled'>('all');
  const { data: attendees, isLoading, error } = useEventCreatorAttendees();

  const filteredAttendees = attendees && filter === 'all' 
    ? attendees 
    : attendees?.filter((a: any) => a.status === filter) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      'confirmed': 'success',
      'checked-in': 'info',
      'cancelled': 'danger'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Failed to load attendees. Please try again.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Reload
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Event Attendees</CardTitle>
            <CardDescription>
              Manage and view all event registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(['all', 'confirmed', 'checked-in', 'cancelled'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendees List */}
        <Card>
          <CardContent className="p-0">
            {filteredAttendees.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredAttendees.map((attendee: any) => (
                  <div key={attendee.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{attendee.attendeeName}</h3>
                          {getStatusBadge(attendee.status)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {attendee.attendeeEmail}
                          </div>
                          
                          {attendee.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {attendee.phone}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {attendee.eventName}
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            Registered: {formatDate(attendee.registrationDate)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No attendees found"
                description="No attendees match the current filter."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
