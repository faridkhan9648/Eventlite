import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { LoadingSpinner, EmptyState } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { BarChart3 } from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { useSuperAdminReports } from '../../hooks/useSuperAdmin';

export const ReportsManagement: React.FC = () => {
  const { data: reportsData, isLoading, error } = useSuperAdminReports();
  
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
              <p className="text-red-600">Failed to load reports data. Please try again.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportsData?.availableReports?.map((report: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>{report.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <Button variant="outline" className="w-full">
                    View Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{reportsData?.summary?.totalEvents || 0}</p>
                  <p className="text-sm text-gray-600">Total Events</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{reportsData?.summary?.totalRegistrations || 0}</p>
                  <p className="text-sm text-gray-600">Total Registrations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{reportsData?.summary?.publishedEvents || 0}</p>
                  <p className="text-sm text-gray-600">Published Events</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{reportsData?.summary?.totalCapacity || 0}</p>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default ReportsManagement;
