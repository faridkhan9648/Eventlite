// Test API endpoints for debugging
import { superAdminAPI } from '../services/api';

export const testSuperAdminAPI = async () => {
  console.log('Testing Super Admin API endpoints...');
  
  try {
    // Test stats endpoint
    console.log('Testing /admin/stats...');
    const stats = await superAdminAPI.getStats();
    console.log('Stats response:', stats);
    
    // Test tenants endpoint
    console.log('Testing /admin/tenants...');
    const tenants = await superAdminAPI.getTenants();
    console.log('Tenants response:', tenants);
    
    // Test users endpoint
    console.log('Testing /admin/users...');
    const users = await superAdminAPI.getUsers();
    console.log('Users response:', users);
    
    // Test events endpoint
    console.log('Testing /admin/events...');
    const events = await superAdminAPI.getEvents();
    console.log('Events response:', events);
    
  } catch (error) {
    console.error('API Test Error:', error);
    
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

// Test authentication
export const testAuth = () => {
  console.log('Testing authentication...');
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('Access Token:', accessToken ? 'Present' : 'Missing');
  console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
  
  if (accessToken) {
    try {
      const decoded = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('Decoded Token:', decoded);
    } catch (error) {
      console.error('Token decode error:', error);
    }
  }
};

export const runDiagnostics = () => {
  console.log('=== Running API Diagnostics ===');
  testAuth();
  testSuperAdminAPI();
};
