// Test attendee endpoints
import { attendeeAPI } from '../services/api';

export const testAttendeeEndpoints = async () => {
  console.log('=== Testing Attendee Endpoints ===');
  
  try {
    // Test stats endpoint
    console.log('Testing /attendee/stats...');
    const stats = await attendeeAPI.getStats();
    console.log('Stats response:', stats);
    
    // Test registrations endpoint
    console.log('Testing /registrations...');
    const registrations = await attendeeAPI.getRegistrations();
    console.log('Registrations response:', registrations);
    
    // Test profile endpoint
    console.log('Testing /attendee/profile...');
    const profile = await attendeeAPI.getProfile();
    console.log('Profile response:', profile);
    
  } catch (error) {
    console.error('Attendee API Test Error:', error);
    
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('General error:', error.message);
    }
  }
};

export const testAuthentication = () => {
  console.log('=== Testing Authentication ===');
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('Access Token:', accessToken ? 'Present' : 'Missing');
  console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
  
  if (accessToken) {
    try {
      const decoded = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('Decoded Token:', decoded);
      console.log('User Role:', decoded.role);
      console.log('User ID:', decoded.sub);
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }
};

export const runAttendeeDiagnostics = () => {
  testAuthentication();
  testAttendeeEndpoints();
};
