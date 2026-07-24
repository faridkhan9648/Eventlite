import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Table, Pagination } from '../../components/ui/Table';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Input, SearchInput } from '../../components/ui/Input';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter
} from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { 
  useSuperAdminTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant
} from '../../hooks/useSuperAdmin';

export const TenantsManagement: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedTenant, setSelectedTenant] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    primaryColor: '#3B82F6',
    contactInfo: { phone: '' }
  });
  
  const { data: tenantsData, isLoading, error } = useSuperAdminTenants();
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const deleteMutation = useDeleteTenant();
  
  const itemsPerPage = 10;
  
  // Filter tenants based on search
  const filteredTenants = tenantsData?.tenants?.filter((tenant: any) => {
    if (!tenant) return false;
    
    const name = tenant.name || '';
    const email = tenant.email || '';
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];
  
  // Paginate filtered tenants
  const paginatedTenants = filteredTenants.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  
  const handleCreateTenant = async () => {
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        primaryColor: '#3B82F6',
        contactInfo: { phone: '' }
      });
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };
  
  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      await updateMutation.mutateAsync({
        id: selectedTenant.id,
        data: formData
      });
      setShowModal(false);
      setSelectedTenant(null);
      setFormData({
        name: '',
        email: '',
        primaryColor: '#3B82F6',
        contactInfo: { phone: '' }
      });
    } catch (error) {
      console.error('Failed to update tenant:', error);
    }
  };
  
  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      await deleteMutation.mutateAsync(selectedTenant.id);
      setShowConfirmModal(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };
  
  const openEditModal = (tenant: any) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name,
      email: tenant.email,
      primaryColor: tenant.primaryColor,
      contactInfo: { phone: tenant.contactInfo?.phone || '' }
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
              <p className="text-red-600">Failed to load tenants data. Please try again.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Tenant
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <SearchInput
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {paginatedTenants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tenant Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Users</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Created Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTenants.map((tenant: any) => (
                        <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-8 h-8 rounded-full" 
                                style={{ backgroundColor: tenant.primaryColor || '#3B82F6' }}
                              ></div>
                              <span className="font-medium">{tenant.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">{tenant.email || 'N/A'}</td>
                          <td className="py-4 px-4">{tenant.contactInfo?.phone || '-'}</td>
                          <td className="py-4 px-4">
                            <StatusBadge status={tenant.isActive ? 'active' : 'inactive'} />
                          </td>
                          <td className="py-4 px-4">{tenant.userCount || 0}</td>
                          <td className="py-4 px-4">
                            {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(tenant)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTenant(tenant);
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
                  title="No tenants found" 
                  description={searchTerm ? "No tenants match your search criteria." : "No tenants have been created yet."}
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
            setSelectedTenant(null);
            setFormData({
              name: '',
              email: '',
              primaryColor: '#3B82F6',
              contactInfo: { phone: '' }
            });
          }}
          title={selectedTenant ? 'Edit Tenant' : 'Create Tenant'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tenant name"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <Input
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  contactInfo: { ...formData.contactInfo, phone: e.target.value }
                })}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <Input
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                placeholder="Enter primary color"
                type="color"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTenant(null);
                  setFormData({
                    name: '',
                    email: '',
                    primaryColor: '#3B82F6',
                    contactInfo: { phone: '' }
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={selectedTenant ? handleUpdateTenant : handleCreateTenant}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedTenant ? 'Update' : 'Create')}
              </Button>
            </div>
          </div>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedTenant(null);
          }}
          onConfirm={handleDeleteTenant}
          title="Delete Tenant"
          message={`Are you sure you want to delete "${selectedTenant?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default TenantsManagement;
