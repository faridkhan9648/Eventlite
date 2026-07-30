// API Configuration
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://eventlite-gy14.onrender.com').replace(/\/api\/?$/, '');

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  HEALTH: `${API_BASE_URL}/health`,
  
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_PROFILE: `${API_BASE_URL}/api/users/profile`,
  
  // Event endpoints
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENTS_CREATE: `${API_BASE_URL}/api/events/create`,
  EVENTS_UPDATE: `${API_BASE_URL}/api/events/update`,
  EVENTS_DELETE: `${API_BASE_URL}/api/events/delete`,
  
  // Tenant endpoints
  TENANTS: `${API_BASE_URL}/api/tenants`,
  TENANTS_CREATE: `${API_BASE_URL}/api/tenants/create`,
  TENANTS_UPDATE: `${API_BASE_URL}/api/tenants/update`,
  TENANTS_DELETE: `${API_BASE_URL}/api/tenants/delete`,
  
  // Registration endpoints
  REGISTRATIONS: `${API_BASE_URL}/api/registrations`,
  REGISTRATIONS_CREATE: `${API_BASE_URL}/api/registrations/create`,
  REGISTRATIONS_UPDATE: `${API_BASE_URL}/api/registrations/update`,
  REGISTRATIONS_DELETE: `${API_BASE_URL}/api/registrations/delete`,
  
  // Attendance endpoints
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  ATTENDANCE_SCAN: `${API_BASE_URL}/api/attendance/scan`,
  ATTENDANCE_CHECKIN: `${API_BASE_URL}/api/attendance/checkin`,
  ATTENDANCE_CHECKOUT: `${API_BASE_URL}/api/attendance/checkout`,
} as const;

// Export for easy usage
export default API_ENDPOINTS;
