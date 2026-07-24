import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui';
import { Container } from '../components/ui';
import { Button } from '../components/ui';
import { LoadingSpinner } from '../components/ui/Loader';
import { usePublicEvents } from '../hooks/usePublic';


export const PublicEventsList: React.FC = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, error } = usePublicEvents();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600">Failed to load events</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-yellow-600 font-bold text-2xl">📅</span>
              </div>
              <CardTitle className="text-3xl text-gray-900 mb-2">No Public Events</CardTitle>
              <CardDescription className="text-base text-gray-600">
                There are currently no public events available.
              </CardDescription>
            </CardHeader>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Container size="lg">
        <div className="mb-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/attendee')}
              icon={<span className="text-lg">{"<"}</span>}
            >
              Back to Dashboard
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Public Events</h1>
            <p className="text-lg text-gray-600 mb-8">
              Browse and register for upcoming events
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event: any) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {formatDate(event.date)} • {event.location}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.isPublic ? 'Public' : 'Private'}
                    </span>
                    {event.requireApproval && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Approval Required
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {event.currentAttendees || 0} / {event.maxAttendees || '∞'} registered
                  </span>
                  {event.maxAttendees && (
                    <span className="ml-2">
                      {((event.maxAttendees - (event.currentAttendees || 0)) / event.maxAttendees * 100).toFixed(0)}% spots left
                    </span>
                  )}
                </div>

                {event.customFields && event.customFields.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Custom Registration Fields</h4>
                    <div className="space-y-1">
                      {event.customFields?.slice(0, 2).map((field: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-gray-600">{field.name}:</span>
                          <span className="text-gray-900">
                            {field.required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      ))}
                      {event.customFields.length > 2 && (
                        <span className="text-gray-500 text-xs">+{event.customFields.length - 2} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Link
                    to={`/event-registration/${event._id}`}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center font-medium"
                  >
                    Register Now
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
};
