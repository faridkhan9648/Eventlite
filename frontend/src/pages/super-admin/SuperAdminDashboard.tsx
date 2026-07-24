import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Table, Pagination } from '../../components/ui/Table';
import { Badge, StatusBadge, RoleBadge } from '../../components/ui/Badge';
import { Input, Select, SearchInput } from '../../components/ui/Input';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, 
  Building2, 
  Calendar, 
  Settings, 
  BarChart3, 
  Shield, 
  Database,
  Globe,
  TrendingUp,
  UserPlus,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Activity,
  DollarSign,
  UserCheck,
  UserX
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { 
  useSuperAdminStats,
  useSuperAdminTenants,
  useSuperAdminUsers,
  useSuperAdminEvents,
  useSuperAdminReports,
  useCreateTenant,
  useCreateUser,
  useUpdateTenant,
  useUpdateUser,
  useDeleteTenant,
  useDeleteUser
} from '../../hooks/useSuperAdmin';
import { runDiagnostics } from '../../debug/test-api';

// Types
interface DashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalEvents: number;
  totalRegistrations: number;
}

interface Tenant {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  isActive: boolean;
  createdAt: string;
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'event_creator' | 'staff' | 'attendee';
  tenantId?: string;
  tenantName?: string;
  isActive: boolean;
  createdAt: string;
}

interface Event {
  id: string;
  name: string;
  tenantName: string;
  date: string;
  status: 'draft' | 'published' | 'closed';
  registrations: number;
  maxAttendees: number;
}

interface ChartData {
  date: string;
  events: number;
  registrations: number;
}

type ActiveView = 'overview' | 'tenants' | 'users' | 'events' | 'reports' | 'settings';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // React Query hooks for data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useSuperAdminStats();
  const { data: tenants, isLoading: tenantsLoading, error: tenantsError } = useSuperAdminTenants();
  const { data: users, isLoading: usersLoading, error: usersError } = useSuperAdminUsers();
  const { data: events, isLoading: eventsLoading, error: eventsError } = useSuperAdminEvents();
  const { data: reports, isLoading: reportsLoading, error: reportsError } = useSuperAdminReports();
  
  // Mutation hooks
  const createTenantMutation = useCreateTenant();
  const createUserMutation = useCreateUser();
  const updateTenantMutation = useUpdateTenant();
  const updateUserMutation = useUpdateUser();
  const deleteTenantMutation = useDeleteTenant();
  const deleteUserMutation = useDeleteUser();
  
  // Pagination states
  const [tenantPage, setTenantPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter states
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [eventStatusFilter, setEventStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [tenantForm, setTenantForm] = useState({
    name: '',
    logo: '',
    primaryColor: '#3B82F6',
    contactInfo: { email: '', phone: '' }
  });
  
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'attendee'
  });

  const [activeView, setActiveView] = useState<ActiveView>('overview');

  // Loading state
  const isLoading = statsLoading || tenantsLoading || usersLoading || eventsLoading || reportsLoading;

  // Error handling
  const hasError = statsError || tenantsError || usersError || eventsError || reportsError;

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateTenant = async () => {
    try {
      await createTenantMutation.mutateAsync(tenantForm);
      setShowTenantModal(false);
      setTenantForm({
        name: '',
        logo: '',
        primaryColor: '#3B82F6',
        contactInfo: { email: '', phone: '' }
      });
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync(userForm);
      setShowUserModal(false);
      setUserForm({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'attendee'
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      if (activeView === 'tenants') {
        await deleteTenantMutation.mutateAsync(selectedItem.id);
      } else if (activeView === 'users') {
        await deleteUserMutation.mutateAsync(selectedItem.id);
      }
      setShowConfirmModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
              <div className="mt-4 space-x-4">
                <Button onClick={() => window.location.reload()}>
                  Reload
                </Button>
                <Button onClick={() => runDiagnostics()} variant="outline">
                  Run Diagnostics
                </Button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RoleProtectedRoute>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalRegistrations || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tenants */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                {tenants && tenants.length > 0 ? (
                  <div className="space-y-4">
                    {tenants.slice(0, 5).map((tenant: any) => (
                      <div key={tenant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: tenant.primaryColor }}></div>
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-sm text-gray-600">{tenant.contactInfo?.email}</p>
                          </div>
                        </div>
                        <StatusBadge status={tenant.isActive ? 'active' : 'inactive'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tenants" description="No tenants have been created yet." />
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <RoleBadge role={user.role} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No users" description="No users have been created yet." />
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-gray-600">{event.tenantName}</p>
                        </div>
                        <StatusBadge status={event.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No events" description="No events have been created yet." />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default SuperAdminDashboard;
