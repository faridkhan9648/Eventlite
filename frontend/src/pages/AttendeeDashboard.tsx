import React from 'react';
import { Calendar, QrCode, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Layout } from '../components/layout';
import { useAuthStore } from '../store/authStore';

export const AttendeeDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Layout title="Attendee Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-neutral-600">
            Discover events and manage your registrations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Registered Events</p>
                  <p className="text-2xl font-bold text-neutral-900">8</p>
                </div>
                <div className="h-12 w-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                </div>
                <div className="h-12 w-12 bg-accent-50 rounded-lg flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Check-ins</p>
                  <p className="text-2xl font-bold text-neutral-900">12</p>
                </div>
                <div className="h-12 w-12 bg-warning-50 rounded-lg flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <Calendar className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-neutral-900">Browse Events</h3>
                <p className="text-sm text-neutral-600">Discover new events</p>
              </button>
              
              <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <QrCode className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-neutral-900">Self Check-in</h3>
                <p className="text-sm text-neutral-600">Use QR codes</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-neutral-500">
              <p>No upcoming events. Browse events to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
