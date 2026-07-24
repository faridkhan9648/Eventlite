import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Button } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { Users, Calendar, MapPin, Clock, Search } from 'lucide-react';
import { useStaffAttendance } from '../../hooks/useStaff';

export const AttendanceList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'this-week'>('all');
  
  const { data: attendance, isLoading, error } = useStaffAttendance();

  const filteredAttendance = attendance && attendance.filter((record: any) => {
    const matchesSearch = record.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const today = new Date();
    const recordDate = new Date(record.eventDate);
    
    switch (filter) {
      case 'today':
        return recordDate.toDateString() === today.toDateString();
      case 'this-week':
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return recordDate >= weekStart && recordDate <= weekEnd;
      default:
        return true;
    }
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      'confirmed': 'success',
      'checked-in': 'info'
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
            <p className="text-red-600">Failed to load attendance data. Please try again.</p>
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
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              View and manage event check-ins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by attendee or event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'today' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('today')}
                >
                  Today
                </Button>
                <Button
                  variant={filter === 'this-week' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('this-week')}
                >
                  This Week
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card>
          <CardContent className="p-0">
            {filteredAttendance.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredAttendance.map((record: any) => (
                  <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{record.attendeeName}</h3>
                          {getStatusBadge(record.status)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {record.eventName}
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            {formatDate(record.eventDate)}
                          </div>
                          
                          {record.checkInTime && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Checked in: {formatDate(record.checkInTime)}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            ID: {record.registrationId}
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
                title="No attendance records found"
                description="No attendance records match the current filters."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
