import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Calendar, Users, Search, QrCode, Clock, MapPin } from 'lucide-react';
import { EventBrowser } from '../../components/EventBrowser';
import { useAttendeeRegistrations } from '../../hooks/useAttendee';
import { attendeeAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';

export const EventRegistration: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'browse' | 'my-registrations'>('browse');
  const { data: registrations = [], isLoading, refetch } = useAttendeeRegistrations();

  const handleRegisterSuccess = () => {
    refetch();
    setActiveTab('my-registrations');
  };

  const handleCancelRegistration = async (eventId: string) => {
    try {
      await attendeeAPI.cancelRegistration(eventId);
      refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to cancel registration';
      alert(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'checked-in':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Event Registration</h1>
                  <p className="text-sm text-gray-500">Browse and register for events</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">Attendee</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Events
                </div>
              </button>
              <button
                onClick={() => setActiveTab('my-registrations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-registrations'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  My Registrations ({registrations.length})
                </div>
              </button>
            </nav>
          </div>

          {activeTab === 'browse' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Events</h2>
                <p className="text-gray-600">Discover and register for upcoming events</p>
              </div>
              <EventBrowser onRegisterSuccess={handleRegisterSuccess} />
            </div>
          )}

          {activeTab === 'my-registrations' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">My Event Registrations</h2>
                <p className="text-gray-600">View and manage your event registrations</p>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading registrations...</p>
                </div>
              ) : registrations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                    <p className="text-gray-600 mb-4">Start by browsing and registering for events</p>
                    <Button onClick={() => setActiveTab('browse')}>Browse Events</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registrations.map((registration: {
                    id: string;
                    registrationId: string;
                    title: string;
                    description: string;
                    date: string;
                    location: string;
                    maxAttendees: number;
                    currentAttendees: number;
                    status: string;
                  }) => (
                    <Card key={registration.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{registration.title}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{registration.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                            {registration.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {registration.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatDate(registration.date)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {registration.currentAttendees}/{registration.maxAttendees} registered
                          </div>

                          <div className="pt-3 border-t space-y-2">
                            {registration.registrationId && (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate(`/registration-qr/${registration.registrationId}`)}
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                View QR Code
                              </Button>
                            )}

                            {isEventUpcoming(registration.date) && (
                              <Button
                                variant="outline"
                                onClick={() => handleCancelRegistration(registration.id)}
                                className="w-full text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Cancel Registration
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
};
