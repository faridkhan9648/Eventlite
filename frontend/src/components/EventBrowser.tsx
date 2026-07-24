import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';
import { Calendar, MapPin, Users, Clock, Search, Filter } from 'lucide-react';
import EventAPI from '../services/eventAPI';
import RegistrationAPI from '../services/registrationAPI';
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types/event';

interface EventBrowserProps {
  onRegisterSuccess?: () => void;
}

export const EventBrowser: React.FC<EventBrowserProps> = ({ onRegisterSuccess }) => {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, filterStatus, page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (searchTerm) filters.search = searchTerm;

      const response = await EventAPI.getEvents(filters, page, 10);
      setEvents(response.events);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      await RegistrationAPI.registerForEvent(eventId);
      if (onRegisterSuccess) onRegisterSuccess();
      fetchEvents(); // Refresh events
    } catch (error: any) {
      alert(error.message || 'Failed to register for event');
    }
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

  const isEventFull = (event: Event) => {
    return event.currentAttendees >= event.maxAttendees;
  };

  const isEventUpcoming = (event: Event) => {
    return new Date(event.startDate) > new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900"
        >
          <option value="all">All Events</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events found</p>
          </div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(event.startDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.currentAttendees}/{event.maxAttendees} registered
                  </div>
                  
                  {event.status === 'published' && isEventUpcoming(event) && (
                    <div className="pt-3 border-t">
                      {user?.role === 'attendee' && (
                        <Button
                          onClick={() => handleRegister(event.id)}
                          disabled={isEventFull(event)}
                          className="w-full"
                          variant={isEventFull(event) ? "outline" : "default"}
                        >
                          {isEventFull(event) ? 'Event Full' : 'Register Now'}
                        </Button>
                      )}
                      {user?.role === 'staff' && (
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
