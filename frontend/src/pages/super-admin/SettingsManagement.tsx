import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import DashboardLayout from '../../components/DashboardLayout';
import { Settings } from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { useSuperAdminSettings, useUpdateSettings } from '../../hooks/useSuperAdmin';

type SettingKey = 'eventRegistration' | 'emailNotifications' | 'security' | 'backup';

const settingSections: {
  key: SettingKey;
  title: string;
  description: string;
}[] = [
  {
    key: 'eventRegistration',
    title: 'Event Registration',
    description: 'Allow users to register for events',
  },
  {
    key: 'emailNotifications',
    title: 'Email Notifications',
    description: 'Configure email notification settings',
  },
  {
    key: 'security',
    title: 'Security Settings',
    description: 'Manage security and authentication settings',
  },
  {
    key: 'backup',
    title: 'Backup & Recovery',
    description: 'Configure backup and recovery settings',
  },
];

export const SettingsManagement: React.FC = () => {
  const { data: settings, isLoading, error } = useSuperAdminSettings();
  const updateMutation = useUpdateSettings();
  const [activeSection, setActiveSection] = React.useState<SettingKey | null>(null);
  const [formValues, setFormValues] = React.useState<Record<string, unknown>>({});
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const openConfigure = (key: SettingKey) => {
    setActiveSection(key);
    setSaveError(null);
    setFormValues(settings?.[key] ? { ...settings[key] } : {});
  };

  const closeModal = () => {
    setActiveSection(null);
    setFormValues({});
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!activeSection) return;

    try {
      await updateMutation.mutateAsync({ [activeSection]: formValues });
      closeModal();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const updateField = (field: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const renderSettingFields = () => {
    if (!activeSection) return null;

    switch (activeSection) {
      case 'eventRegistration':
        return (
          <>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable event registration</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.enabled)}
                onChange={(e) => updateField('enabled', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Require approval</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.requireApproval)}
                onChange={(e) => updateField('requireApproval', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
          </>
        );
      case 'emailNotifications':
        return (
          <>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable email notifications</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.enabled)}
                onChange={(e) => updateField('enabled', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Registration confirmations</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.registrationConfirm)}
                onChange={(e) => updateField('registrationConfirm', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Event reminders</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.eventReminders)}
                onChange={(e) => updateField('eventReminders', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
          </>
        );
      case 'security':
        return (
          <>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Require two-factor authentication</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.twoFactorRequired)}
                onChange={(e) => updateField('twoFactorRequired', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session timeout (minutes)
              </label>
              <Input
                type="number"
                min={5}
                max={480}
                value={String(formValues.sessionTimeout ?? 60)}
                onChange={(e) => updateField('sessionTimeout', Number(e.target.value))}
              />
            </div>
          </>
        );
      case 'backup':
        return (
          <>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Enable automatic backups</span>
              <input
                type="checkbox"
                checked={Boolean(formValues.autoBackup)}
                onChange={(e) => updateField('autoBackup', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup frequency
              </label>
              <select
                value={String(formValues.frequency ?? 'daily')}
                onChange={(e) => updateField('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
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
              <p className="text-red-600">Failed to load settings. Please try again.</p>
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
                  {settingSections.map((section) => (
                    <div key={section.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                      <Button variant="outline" onClick={() => openConfigure(section.key)}>
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={!!activeSection}
          onClose={closeModal}
          title={
            settingSections.find((s) => s.key === activeSection)?.title ?? 'Configure Settings'
          }
        >
          <div className="space-y-4">
            {renderSettingFields()}

            {saveError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default SettingsManagement;
