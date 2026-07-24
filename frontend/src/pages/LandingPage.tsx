import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCode, 
  Calendar, 
  Users, 
  UserPlus
} from 'lucide-react';
import { Button, Container, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'QR-based Check-in',
      description: 'Seamless QR code scanning for instant event check-ins. No more manual registration hassles.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Real-time Attendance',
      description: 'Track attendance live with real-time updates and comprehensive analytics.'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Event Scheduling',
      description: 'Create and manage events with powerful scheduling tools and automated reminders.'
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Public Registration',
      description: 'Open registration for events with custom fields and QR code generation.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Event',
      description: 'Set up your event with basic details, schedule, and QR code generation.'
    },
    {
      number: '2',
      title: 'Public Registration',
      description: 'Open registration for events with custom fields and QR code generation.'
    },
    {
      number: '3',
      title: 'QR Code Check-in',
      description: 'Attendees can register and receive unique QR codes for instant check-in.'
    },
    {
      number: '4',
      title: 'Event Management',
      description: 'Comprehensive event management with analytics and reporting.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-900 to-emerald-500 py-16 px-4 text-center">
        <Container>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight">
              <span className="block">EventLite</span>
              <span className="block text-xl md:text-2xl mt-2 text-gray-100">Smart Event Management Platform</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
              Manage events, track attendees, and simplify check-ins with QR technology
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild>
                <Link to="/register" className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login" className="flex items-center">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage successful events from start to finish
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How EventLite Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps and transform your event management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-100">
        <Container>
          <div className="text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to Transform Your Events?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join thousands of event organizers who trust EventLite for their event management needs
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" asChild>
                    <Link to="/register" className="flex items-center justify-center">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </Link>
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/public-events" className="flex items-center justify-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Browse Public Events
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">EventLite</h3>
              <p className="text-gray-400">
                Smart event management platform for modern organizers
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 EventLite. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};
