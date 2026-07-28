import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';
import { Calendar, MapPin, Users, Clock, Search } from 'lucide-react';
import { attendeeAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

interface PublicEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  isPublic?: boolean;
}

interface EventBrowserProps {
  onRegisterSuccess?: () => void;
}

export const EventBrowser: React.FC<EventBrowserProps> = ({ onRegisterSuccess }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await attendeeAPI.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  const handleRegister = async (eventId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegisteringId(eventId);
    try {
      const result = await attendeeAPI.registerForEvent(eventId);
      if (result.registrationId) {
        navigate(`/registration-qr/${result.registrationId}`);
      }
      onRegisterSuccess?.();
      fetchEvents();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to register for event';
      alert(message);
    } finally {
      setRegisteringId(null);
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

  const isEventFull = (event: PublicEvent) => {
    return event.currentAttendees >= event.maxAttendees;
  };

  const isEventUpcoming = (event: PublicEvent) => {
    return new Date(event.date) > new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.currentAttendees}/{event.maxAttendees} registered
                  </div>

                  {isEventUpcoming(event) && (
                    <div className="pt-3 border-t">
                      <Button
                        onClick={() => handleRegister(event._id)}
                        disabled={isEventFull(event) || registeringId === event._id}
                        className="w-full"
                        variant={isEventFull(event) ? 'outline' : 'default'}
                      >
                        {registeringId === event._id
                          ? 'Registering...'
                          : isEventFull(event)
                            ? 'Event Full'
                            : 'Register Now'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
