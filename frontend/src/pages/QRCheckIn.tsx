import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui';
import { Container } from '../components/ui';
import { QRScanner } from '../components/ui/QRScanner';

export const QRCheckIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container size="lg">
        <div className="py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Check-in</h1>
            <p className="text-lg text-gray-600">
              Scan QR codes to check attendees into events
            </p>
          </div>
          
          <QRScanner />
          
          <div className="mt-8 text-center">
            <Card className="inline-block">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <span className="text-blue-600 font-bold text-2xl">📊</span>
                    </div>
                    <p className="text-sm text-gray-600">Check-in Stats</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <span className="text-green-600 font-bold text-2xl">👥</span>
                    </div>
                    <p className="text-sm text-gray-600">Attendees</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-2 mx-auto">
                      <span className="text-purple-600 font-bold text-2xl">📋</span>
                    </div>
                    <p className="text-sm text-gray-600">History</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};
