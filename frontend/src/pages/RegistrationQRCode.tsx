import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Container, QRCodeDisplay } from '../components/ui';
import { Button } from '../components/ui';
import { LoadingSpinner } from '../components/ui/Loader';
import { useRegistrationQR } from '../hooks/usePublic';
import { useDownloadQR } from '../hooks/usePublic';

export const RegistrationQRCode: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const navigate = useNavigate();
  const { data: registration, isLoading, error } = useRegistrationQR(registrationId || '');
  const { downloadQR } = useDownloadQR();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading QR code...</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-600">Failed to load QR code</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Container size="sm">
          <Card className="w-full shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600">Registration not found</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      await downloadQR(registrationId || '');
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Container size="sm">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Registration QR Code</CardTitle>
            <CardDescription>
              QR code for {registration.eventId?.title}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Event Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {registration.eventId?.title}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Date:</span> {new Date(registration.eventId?.date || '').toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {registration.eventId?.location}
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Registration ID:</span> {registration.registrationId}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      registration.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                      registration.status === 'checked-in' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {registration.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Registered:</span> {new Date(registration.registeredAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              {registration.customFields && Object.keys(registration.customFields).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(registration.customFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium text-gray-600">{key}:</span>
                        <span className="text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code Display */}
              {registration.qrCode && (
                <div className="text-center">
                  <QRCodeDisplay value={registration.qrCode || ''} size={256} />
                  <p className="text-sm text-gray-600 mt-4">
                    Show this QR code at the event entrance for check-in
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/attendee')}
                >
                  Back to Dashboard
                </Button>
                
                {registration.qrCode && (
                  <Button
                    onClick={handleDownload}
                  >
                    Download QR Code
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
