import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Table, Pagination } from '../../components/ui/Table';
import { Badge, StatusBadge, RoleBadge } from '../../components/ui/Badge';
import { Input, SearchInput, Select } from '../../components/ui/Input';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX
} from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { 
  useSuperAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser
} from '../../hooks/useSuperAdmin';

export const UsersManagement: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [showModal, setShowModal] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'attendee'
  });
  
  const { data: usersData, isLoading, error } = useSuperAdminUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  
  const itemsPerPage = 10;
  
  // Filter users based on search and role
  const filteredUsers = usersData?.users?.filter((user: any) => {
    if (!user) return false;
    
    const username = user.username || '';
    const email = user.email || '';
    const name = user.name || '';
    
    const matchesSearch = 
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];
  
  // Paginate filtered users
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  const handleCreateUser = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({
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
  
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      await updateMutation.mutateAsync({
        id: selectedUser.id,
        data: formData
      });
      setShowModal(false);
      setSelectedUser(null);
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'attendee'
      });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      setShowConfirmModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };
  
  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role
    });
    setShowModal(true);
  };
  
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
  
  if (error) {
    return (
      <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load users data. Please try again.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Reload
              </Button>
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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <SearchInput
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="event_creator">Event Creator</option>
                  <option value="staff">Staff</option>
                  <option value="attendee">Attendee</option>
                </select>
              </div>
              
              {paginatedUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user: any) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {(user.username || '').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{user.name || 'N/A'}</p>
                                <p className="text-sm text-gray-500">@{user.username || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">{user.email || 'N/A'}</td>
                          <td className="py-4 px-4">
                            <RoleBadge role={user.role || 'attendee'} />
                          </td>
                          <td className="py-4 px-4">
                            <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                          </td>
                          <td className="py-4 px-4">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowConfirmModal(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState 
                  title="No users found" 
                  description={searchTerm || roleFilter !== 'all' ? "No users match your search criteria." : "No users have been created yet."}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
            setFormData({
              username: '',
              email: '',
              firstName: '',
              lastName: '',
              role: 'attendee'
            });
          }}
          title={selectedUser ? 'Edit User' : 'Create User'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="attendee">Attendee</option>
                <option value="staff">Staff</option>
                <option value="event_creator">Event Creator</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                  setFormData({
                    username: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    role: 'attendee'
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={selectedUser ? handleUpdateUser : handleCreateUser}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedUser ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default UsersManagement;
