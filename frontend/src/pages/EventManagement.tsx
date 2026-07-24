import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Event, EventFormData, EventFilter, EventStatus } from '../types/event';
import { EventTable } from '../components/EventTable';
import { EventForm } from '../components/EventForm';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Plus, Search, Filter, Calendar, Users, BarChart3 } from 'lucide-react';
import EventAPI from '../services/eventAPI';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../types/rbac';

export const EventManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState<EventFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await EventAPI.getEvents(
        {
          ...filters,
          search: searchTerm
        },
        currentPage,
        10
      );
      setEvents(response.events);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, filters, searchTerm]);

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await EventAPI.createEvent(data);
      setShowCreateForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleEditEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      await EventAPI.updateEvent(editingEvent.id, data);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await EventAPI.deleteEvent(id);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handlePublishEvent = async (id: string) => {
    try {
      await EventAPI.publishEvent(id);
      fetchEvents();
    } catch (error) {
      console.error('Failed to publish event:', error);
    }
  };

  const handleCloseEvent = async (id: string) => {
    try {
      await EventAPI.closeEvent(id);
      fetchEvents();
    } catch (error) {
      console.error('Failed to close event:', error);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <ProtectedRoute requiredPermission={Permission.EVENT_CREATE}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600">Create and manage your events</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Events
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, description, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value as EventStatus })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      placeholder="Start date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="mt-4">
                <Button onClick={fetchEvents} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <EventForm
                  onSubmit={handleCreateEvent}
                  onCancel={() => setShowCreateForm(false)}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {/* Edit Event Modal */}
          {editingEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <EventForm
                  event={editingEvent}
                  onSubmit={handleEditEvent}
                  onCancel={() => setEditingEvent(null)}
                  loading={loading}
                />
              </div>
            </div>
          )}

          {/* Events Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Events ({events.length})</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Total Attendees: {events.reduce((sum, event) => sum + event.currentAttendees, 0)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EventTable
                events={events}
                onEdit={(event) => setEditingEvent(event)}
                onDelete={handleDeleteEvent}
                onView={(event) => navigate(`/events/${event.id}`)}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
