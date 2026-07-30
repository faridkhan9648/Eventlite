import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Input } from '../../components/ui';
import DashboardLayout from '../../components/DashboardLayout';
import { useCreateEvent } from '../../hooks/useEventCreator';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';

export const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    maxAttendees: '50',
    status: 'published'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.description.length < 10) {
        alert('Description must be at least 10 characters long.');
        return;
      }

      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        alert('End date must be after the start date.');
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxAttendees: parseInt(formData.maxAttendees) || 50,
        status: formData.status
      };
      
      await createEventMutation.mutateAsync(eventData);
      navigate('/creator/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInputChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Event</CardTitle>
            <CardDescription>
              Fill in the details below to create a new event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Event Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e)}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e)}
                    placeholder="Describe your event"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e)}
                    placeholder="Event location"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    label="Start Date & Time"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e)}
                    type="datetime-local"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    label="End Date & Time"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e)}
                    type="datetime-local"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    label="Max Attendees"
                    value={formData.maxAttendees}
                    onChange={(e) => handleInputChange('maxAttendees', e)}
                    type="number"
                    placeholder="Maximum number of attendees"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="mr-2 border rounded px-2 py-1"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <span className="text-sm font-medium text-gray-700">Event Status</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/creator')}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Event
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
