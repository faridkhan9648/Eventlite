import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { LoadingSpinner } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import DashboardLayout from '../../components/DashboardLayout';
import { BarChart3 } from 'lucide-react';
import { RoleProtectedRoute } from '../../components/RoleProtectedRoute';
import { UserRole } from '../../types/rbac';
import { useSuperAdminReports } from '../../hooks/useSuperAdmin';
import { superAdminAPI } from '../../services/api';

const formatReportValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const ReportDetailView: React.FC<{ data: Record<string, unknown> }> = ({ data }) => {
  const entries = Object.entries(data);

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {entries.map(([key, value]) => (
        <div key={key} className="border-b border-gray-100 pb-3">
          <p className="text-sm font-medium text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
          </p>
          {Array.isArray(value) ? (
            <div className="mt-2 space-y-2">
              {value.map((item, index) => (
                <div key={index} className="rounded-md bg-gray-50 p-3 text-sm">
                  {typeof item === 'object' && item !== null ? (
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  ) : (
                    <span>{formatReportValue(item)}</span>
                  )}
                </div>
              ))}
            </div>
          ) : typeof value === 'object' && value !== null ? (
            <pre className="mt-1 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm text-gray-700">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatReportValue(value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export const ReportsManagement: React.FC = () => {
  const { data: reportsData, isLoading, error } = useSuperAdminReports();
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const [reportDetail, setReportDetail] = React.useState<Record<string, unknown> | null>(null);
  const [loadingReport, setLoadingReport] = React.useState(false);
  const [reportError, setReportError] = React.useState<string | null>(null);

  const handleViewReport = async (report: { name: string; endpoint: string }) => {
    setSelectedReport(report);
    setReportDetail(null);
    setReportError(null);
    setLoadingReport(true);

    try {
      const data = await superAdminAPI.getReport(report.endpoint);
      setReportDetail(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoadingReport(false);
    }
  };

  const closeReportModal = () => {
    setSelectedReport(null);
    setReportDetail(null);
    setReportError(null);
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
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewReport(report)}
                  >
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

        <Modal
          isOpen={!!selectedReport}
          onClose={closeReportModal}
          title={selectedReport?.name ? `${selectedReport.name} Report` : 'Report'}
          size="lg"
        >
          {loadingReport && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {reportError && (
            <div className="rounded-md bg-red-50 p-4 text-red-700">
              {reportError}
            </div>
          )}

          {!loadingReport && reportDetail && (
            <ReportDetailView data={reportDetail} />
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeReportModal}>
              Close
            </Button>
          </div>
        </Modal>
      </DashboardLayout>
    </RoleProtectedRoute>
  );
};

export default ReportsManagement;
