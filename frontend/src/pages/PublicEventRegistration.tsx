import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui';
import { Container } from '../components/ui';
import { Button } from '../components/ui';
import { LoadingSpinner } from '../components/ui/Loader';
import { useEventDetails } from '../hooks/usePublic';
import { useRegisterForEvent } from '../hooks/useAttendee';

interface CustomFieldValue {
  [key: string]: string | number | boolean;
}

export const PublicEventRegistration: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomFieldValue>({});
  const [success, setSuccess] = useState(false);
  
  const { data: event, isLoading, error } = useEventDetails(eventId || '');
  const registerMutation = useRegisterForEvent();

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event?._id) return;
    
    try {
      await registerMutation.mutateAsync({
        eventId: event._id,
        customFields: formData
      });
      setSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading event details...</p>
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
                <p className="text-red-600">Failed to load event details</p>
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                <p className="text-gray-600 mb-6">You have successfully registered for this event.</p>
                <Button onClick={() => navigate('/attendee')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600">Event not found</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Container size="sm">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Event Registration</CardTitle>
            <CardDescription>
              Register for {event.title}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {event.location}
                  </div>
                  <div>
                    <span className="font-medium">Attendees:</span> {event.currentAttendees || 0}/{event.maxAttendees || '∞'}
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              {event.customFields && event.customFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    {event.customFields.map((field: any, index: number) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {field.type === 'text' && (
                          <input
                            type="text"
                            required={field.required}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                        
                        {field.type === 'email' && (
                          <input
                            type="email"
                            required={field.required}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                        
                        {field.type === 'phone' && (
                          <input
                            type="tel"
                            required={field.required}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                        
                        {field.type === 'number' && (
                          <input
                            type="number"
                            required={field.required}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          />
                        )}
                        
                        {field.type === 'select' && (
                          <select
                            required={field.required}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option: string, optionIndex: number) => (
                              <option key={optionIndex} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        
                        {field.type === 'checkbox' && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              required={field.required}
                              className="mr-2"
                              onChange={(e) => handleInputChange(field.name, e.target.checked)}
                            />
                            <span>{field.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {registerMutation.isPending ? 'Registering...' : 'Register for Event'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
