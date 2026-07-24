import React from 'react';
import { Calendar, PlusCircle, BarChart3, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Layout } from '../components/layout';
import { useAuthStore } from '../store/authStore';

export const CreatorDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Layout title="Creator Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-neutral-600">
            Manage your events and track their performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Events</p>
                  <p className="text-2xl font-bold text-neutral-900">12</p>
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
                  <p className="text-sm font-medium text-neutral-600">Total Attendees</p>
                  <p className="text-2xl font-bold text-neutral-900">1,247</p>
                </div>
                <div className="h-12 w-12 bg-accent-50 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Revenue</p>
                  <p className="text-2xl font-bold text-neutral-900">$24,500</p>
                </div>
                <div className="h-12 w-12 bg-warning-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-warning-600" />
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
                <PlusCircle className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-neutral-900">Create New Event</h3>
                <p className="text-sm text-neutral-600">Start planning your next event</p>
              </button>
              
              <button className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <BarChart3 className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-neutral-900">View Analytics</h3>
                <p className="text-sm text-neutral-600">Track event performance</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-neutral-500">
              <p>No events created yet. Create your first event to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
