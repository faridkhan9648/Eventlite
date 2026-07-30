import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { Unauthorized } from './pages/Unauthorized';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { UserRole } from './types/rbac';
import { GlobalLayout } from './components/layout/GlobalLayout';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
// Import role-specific dashboards
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { TenantsManagement } from './pages/super-admin/TenantsManagement';
import { UsersManagement } from './pages/super-admin/UsersManagement';
import { EventsManagement } from './pages/super-admin/EventsManagement';
import { ReportsManagement } from './pages/super-admin/ReportsManagement';
import { SettingsManagement } from './pages/super-admin/SettingsManagement';
import { CreatorDashboard } from './pages/creator/CreatorDashboard';
import { CreateEvent } from './pages/creator/CreateEvent';
import { EventsList } from './pages/creator/EventsList';
import { AttendeesList } from './pages/creator/AttendeesList';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AttendanceList } from './pages/staff/AttendanceList';
import { AttendeeDashboard } from './pages/attendee/AttendeeDashboard';
import { EventRegistration } from './pages/attendee/EventRegistration';
import { AttendeeProfile } from './pages/attendee/AttendeeProfile';
// Import new registration components
import { PublicEventsList } from './pages/PublicEventsList';
import { PublicEventRegistration } from './pages/PublicEventRegistration';
import { RegistrationQRCode } from './pages/RegistrationQRCode';
import { QRCheckIn } from './pages/QRCheckIn';

function App() {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  // Initialize authentication on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/" 
                element={<LandingPage />} 
              />
              <Route 
                path="/login" 
                element={<Login />} 
              />
              <Route 
                path="/register" 
                element={<Register />} 
              />
              <Route 
                path="/unauthorized" 
                element={<Unauthorized />} 
              />
              
              {/* Public Registration Routes */}
              <Route 
                path="/public-events" 
                element={<PublicEventsList />} 
              />
              <Route 
                path="/event-registration/:eventId" 
                element={<PublicEventRegistration />} 
              />
              <Route 
                path="/registration-qr/:registrationId" 
                element={<RegistrationQRCode />} 
              />
              
              {/* QR Check-in Route */}
              <Route 
                path="/checkin" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.STAFF, UserRole.SUPER_ADMIN, UserRole.EVENT_CREATOR]}>
                    <QRCheckIn />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/scan" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.STAFF, UserRole.SUPER_ADMIN, UserRole.EVENT_CREATOR]}>
                    <QRCheckIn />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Role-based Protected Routes */}
              <Route 
                path="/super-admin" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <SuperAdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/super-admin/tenants" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <TenantsManagement />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/super-admin/users" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <UsersManagement />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/super-admin/events" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <EventsManagement />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/super-admin/reports" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <ReportsManagement />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/super-admin/settings" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <SettingsManagement />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/creator" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
                    <CreatorDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/creator/events" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
                    <EventsList />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/creator/create" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
                    <CreateEvent />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/creator/attendees" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.EVENT_CREATOR]}>
                    <AttendeesList />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.STAFF]}>
                    <StaffDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/attendance" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.STAFF]}>
                    <AttendanceList />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/attendee" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
                    <AttendeeDashboard />
                  </RoleProtectedRoute>
                } 
              />
              <Route 
                path="/attendee/registration" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
                    <EventRegistration />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/attendee/profile" 
                element={
                  <RoleProtectedRoute allowedRoles={[UserRole.ATTENDEE]}>
                    <AttendeeProfile />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* Legacy Dashboard Route - redirects based on role */}
              <Route 
                path="/dashboard" 
                element={
                  isAuthenticated ? (
                    <Navigate to={
                      user?.role === UserRole.SUPER_ADMIN ? '/super-admin' :
                      user?.role === UserRole.EVENT_CREATOR ? '/creator' :
                      user?.role === UserRole.STAFF ? '/staff' :
                      user?.role === UserRole.ATTENDEE ? '/attendee' :
                      '/'
                    } />
                  ) : (
                    <Navigate to="/login" />
                  )
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
