const API_BASE_URL = 'http://localhost:5001/api/registrations';

class RegistrationAPI {
  // Register for event (Attendee only)
  static async registerForEvent(eventId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ eventId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to register for event');
    }

    return response.json();
  }

  // Get user's event registrations
  static async getMyRegistrations(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/my-registrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registrations');
    }

    return response.json();
  }

  // Cancel event registration
  static async cancelRegistration(eventId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to cancel registration');
    }

    return response.json();
  }
}

export default RegistrationAPI;
