import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { LoadingSpinner } from '../../components/ui/Loader';
import DashboardLayout from '../../components/DashboardLayout';
import { Settings } from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';

export const SettingsManagement: React.FC = () => {
  return (
    <RoleProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Platform Configuration</h3>
                  <p className="text-sm text-gray-600">Configure platform-wide settings and preferences.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Event Registration</p>
                      <p className="text-sm text-gray-600">Allow users to register for events</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Configure email notification settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Settings</p>
                      <p className="text-sm text-gray-600">Manage security and authentication settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Backup & Recovery</p>
                      <p className="text-sm text-gray-600">Configure backup and recovery settings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default SettingsManagement;
